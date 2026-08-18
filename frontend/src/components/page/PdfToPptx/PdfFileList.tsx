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

export const PdfFileList = ({
	items,
	disabled = false,
	onMove,
	onRemove,
	onClear,
}: {
	items: Array<PdfItem>;
	disabled?: boolean;
	onMove: (index: number, direction: -1 | 1) => void;
	onRemove: (id: string) => void;
	onClear: () => void;
}): FunctionComponent => {
	const totalPages = items.reduce(
		(total, item) => total + (item.pageCount ?? 0),
		0
	);

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

			<ul className="flex flex-col gap-3">
				{items.map((item, index) => (
					<li
						key={item.id}
						className="flex items-center gap-4 border border-neutral-05 rounded-xl px-4 py-3"
					>
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
									onMove(index, -1);
								}}
							>
								▲
							</IconButton>
							<IconButton
								disabled={disabled || index === items.length - 1}
								label="Move down"
								onClick={() => {
									onMove(index, 1);
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
