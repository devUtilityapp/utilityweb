import { useState } from "react";
import type { FunctionComponent } from "../../../common/types";

export interface PdfItem {
	id: string;
	file: File;
	pageCount: number | null;
}

const formatFileSize = (bytes: number): string => {
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
	return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
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

const DragHandle = (): FunctionComponent => (
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
	const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
	const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

	const totalPages = items.reduce(
		(total, item) => total + (item.pageCount ?? 0),
		0
	);

	const endDrag = (): void => {
		setDraggingIndex(null);
		setDragOverIndex(null);
	};

	const dropOn = (index: number): void => {
		if (draggingIndex !== null && draggingIndex !== index) {
			onReorder(draggingIndex, index);
		}
		endDrag();
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
				Drag rows to change the slide order
			</div>

			<ul className="flex flex-col gap-3">
				{items.map((item, index) => (
					<li
						key={item.id}
						draggable={!disabled}
						className={`flex items-center gap-4 border rounded-xl px-4 py-3 transition-colors
							${disabled ? "border-neutral-05" : "cursor-grab active:cursor-grabbing"}
							${draggingIndex === index ? "opacity-40" : ""}
							${
								dragOverIndex === index && draggingIndex !== index
									? "border-green-05 bg-main-05"
									: "border-neutral-05"
							}`}
						onDragEnd={endDrag}
						onDragLeave={() => {
							setDragOverIndex((previousIndex) =>
								previousIndex === index ? null : previousIndex
							);
						}}
						onDragOver={(event) => {
							event.preventDefault();
							event.dataTransfer.dropEffect = "move";
							setDragOverIndex(index);
						}}
						onDragStart={(event) => {
							event.dataTransfer.effectAllowed = "move";
							// Firefox는 데이터가 설정되어야 드래그를 시작한다.
							event.dataTransfer.setData("text/plain", item.id);
							setDraggingIndex(index);
						}}
						onDrop={(event) => {
							event.preventDefault();
							dropOn(index);
						}}
					>
						<DragHandle />
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
				))}
			</ul>
		</div>
	);
};
