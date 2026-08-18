import { useRef, useState } from "react";
import type { FunctionComponent } from "../../../common/types";

export interface PdfItem {
	id: string;
	file: File;
	pageCount: number | null;
}

interface RowRect {
	top: number;
	height: number;
}

interface DragOrigin {
	index: number;
	pointerId: number;
	startY: number;
	rects: Array<RowRect>;
}

interface DragState {
	index: number;
	targetIndex: number;
	offsetY: number;
}

const formatFileSize = (bytes: number): string => {
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
	return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// 포인터가 올라가 있는 행을 찾는다. 행 사이 여백은 아래쪽 행으로 본다.
const findTargetIndex = (rects: Array<RowRect>, pointerY: number): number => {
	const index = rects.findIndex((rect) => pointerY < rect.top + rect.height);
	return index === -1 ? rects.length - 1 : index;
};

const IconButton = ({
	label,
	disabled = false,
	children,
	onClick,
}: {
	label: string;
	disabled?: boolean;
	children: React.ReactNode;
	onClick: () => void;
}): FunctionComponent => (
	<button
		aria-label={label}
		disabled={disabled}
		title={label}
		type="button"
		className={`w-8 h-8 flex items-center justify-center rounded-lg border border-neutral-15 text-neutral-05
			${disabled ? "opacity-30 cursor-not-allowed" : "hover:bg-main-05"}`}
		onClick={onClick}
	>
		{children}
	</button>
);

export const PdfFileList = ({
	items,
	disabled = false,
	onReorder,
	onRemove,
	onClear,
}: {
	items: Array<PdfItem>;
	disabled?: boolean;
	onReorder: (fromIndex: number, toIndex: number) => void;
	onRemove: (id: string) => void;
	onClear: () => void;
}): FunctionComponent => {
	const listRef = useRef<HTMLUListElement>(null);
	const dragOriginRef = useRef<DragOrigin | null>(null);
	const [dragState, setDragState] = useState<DragState | null>(null);

	const totalPages = items.reduce(
		(total, item) => total + (item.pageCount ?? 0),
		0
	);

	const startDrag = (
		event: React.PointerEvent<HTMLDivElement>,
		index: number
	): void => {
		if (disabled || !event.isPrimary) return;
		const list = listRef.current;
		if (!list) return;

		const rects = [...list.children].map((child) => {
			const rect = child.getBoundingClientRect();
			return { top: rect.top, height: rect.height };
		});

		dragOriginRef.current = {
			index,
			pointerId: event.pointerId,
			startY: event.clientY,
			rects,
		};
		// 포인터를 잡아두면 행 밖으로 나가도 move/up 이벤트를 계속 받는다.
		event.currentTarget.setPointerCapture(event.pointerId);
		setDragState({ index, targetIndex: index, offsetY: 0 });
	};

	const moveDrag = (event: React.PointerEvent<HTMLDivElement>): void => {
		const origin = dragOriginRef.current;
		if (!origin || origin.pointerId !== event.pointerId) return;

		setDragState({
			index: origin.index,
			targetIndex: findTargetIndex(origin.rects, event.clientY),
			offsetY: event.clientY - origin.startY,
		});
	};

	const endDrag = (event: React.PointerEvent<HTMLDivElement>): void => {
		const origin = dragOriginRef.current;
		if (!origin || origin.pointerId !== event.pointerId) return;

		const targetIndex = findTargetIndex(origin.rects, event.clientY);
		dragOriginRef.current = null;
		setDragState(null);

		if (targetIndex !== origin.index) {
			onReorder(origin.index, targetIndex);
		}
	};

	const cancelDrag = (): void => {
		dragOriginRef.current = null;
		setDragState(null);
	};

	return (
		<div className="flex flex-col gap-4">
			<div className="flex items-center justify-between">
				<div className="text-neutral-05 font-medium text-xl lg:text-2xl">
					Files ({items.length})
				</div>
				<div className="flex items-center gap-4">
					<div className="text-neutral-15 text-sm lg:text-md">
						{totalPages} slides
					</div>
					<button
						disabled={disabled}
						type="button"
						className={`text-neutral-15 text-sm lg:text-md underline
							${disabled ? "cursor-not-allowed" : "hover:text-neutral-05"}`}
						onClick={onClear}
					>
						Clear all
					</button>
				</div>
			</div>

			<div className="text-neutral-15 text-sm">
				Drag the handle to change the slide order
			</div>

			<ul ref={listRef} className="flex flex-col gap-3">
				{items.map((item, index) => {
					const dragging = dragState?.index === index;
					const dropTarget =
						dragState !== null &&
						dragState.targetIndex === index &&
						dragState.index !== index;

					return (
						<li
							key={item.id}
							className={`flex items-center gap-4 border rounded-xl px-4 py-3 bg-main-00
								${dragState === null ? "" : "select-none"}
								${dragging ? "relative z-10 shadow-lg border-green-05" : ""}
								${dropTarget ? "border-green-05 bg-main-05" : "border-neutral-05"}`}
							style={
								dragging
									? {
											transform: `translateY(${dragState.offsetY}px)`,
										}
									: undefined
							}
						>
							<div
								aria-label="Drag to reorder"
								role="button"
								style={{ touchAction: "none" }}
								tabIndex={-1}
								title="Drag to reorder"
								className={`flex items-center justify-center -mx-1 px-1 py-2
									${disabled ? "cursor-not-allowed" : "cursor-grab active:cursor-grabbing"}`}
								onPointerCancel={cancelDrag}
								onPointerMove={moveDrag}
								onPointerUp={endDrag}
								onPointerDown={(event) => {
									startDrag(event, index);
								}}
							>
								<svg
									aria-hidden="true"
									fill="none"
									height="20"
									viewBox="0 0 20 20"
									width="20"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										d="M7 5h.01M7 10h.01M7 15h.01M13 5h.01M13 10h.01M13 15h.01"
										stroke="#7C7C6F"
										strokeLinecap="round"
										strokeWidth="2.5"
									/>
								</svg>
							</div>
							<div className="text-neutral-15 font-medium w-6 text-center">
								{index + 1}
							</div>
							<div className="flex flex-col min-w-0 flex-1">
								<div className="text-neutral-05 font-medium truncate">
									{item.file.name}
								</div>
								<div className="text-neutral-15 text-sm">
									{formatFileSize(item.file.size)} ·{" "}
									{item.pageCount === null
										? "reading..."
										: `${item.pageCount} pages`}
								</div>
							</div>
							<div className="flex items-center gap-2">
								<IconButton
									disabled={disabled || index === 0}
									label="Move up"
									onClick={() => {
										onReorder(index, index - 1);
									}}
								>
									▲
								</IconButton>
								<IconButton
									disabled={disabled || index === items.length - 1}
									label="Move down"
									onClick={() => {
										onReorder(index, index + 1);
									}}
								>
									▼
								</IconButton>
								<IconButton
									disabled={disabled}
									label="Remove"
									onClick={() => {
										onRemove(item.id);
									}}
								>
									✕
								</IconButton>
							</div>
						</li>
					);
				})}
			</ul>
		</div>
	);
};
