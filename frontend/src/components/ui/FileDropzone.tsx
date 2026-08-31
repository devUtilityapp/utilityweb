import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import type { FunctionComponent } from "../../common/types";
import { MAX_FILE_LABEL, isWithinSizeLimit } from "../../common/limits";

export const FileDropzone = ({
	accept,
	title,
	hint,
	multiple = false,
	disabled = false,
	onFilesAdded,
}: {
	accept: string;
	title: string;
	hint: string;
	multiple?: boolean;
	disabled?: boolean;
	onFilesAdded: (files: Array<File>) => void;
}): FunctionComponent => {
	const { t } = useTranslation();
	const inputRef = useRef<HTMLInputElement>(null);
	const [dragging, setDragging] = useState(false);

	// 모든 도구가 이 상자를 거치므로, 크기 확인도 여기서 한 번만 한다.
	const acceptFiles = (files: Array<File>): void => {
		const withinLimit = files.filter((file) => isWithinSizeLimit(file));
		for (const file of files) {
			if (!isWithinSizeLimit(file)) {
				toast.error(
					t("common.fileTooLarge", { name: file.name, limit: MAX_FILE_LABEL })
				);
			}
		}
		if (withinLimit.length > 0) onFilesAdded(withinLimit);
	};

	const openFileDialog = (): void => {
		if (disabled) return;
		inputRef.current?.click();
	};

	const handleDrop = (event: React.DragEvent<HTMLDivElement>): void => {
		event.preventDefault();
		setDragging(false);
		if (disabled) return;
		acceptFiles([...event.dataTransfer.files]);
	};

	return (
		<div
			role="button"
			tabIndex={0}
			className={`w-full flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-2xl
				lg:py-16 py-10 px-6 text-center transition-colors
				${disabled ? "cursor-not-allowed border-neutral-50" : "cursor-pointer"}
				${dragging ? "border-green-05 bg-main-05" : "border-neutral-05 bg-main-00"}`}
			onClick={openFileDialog}
			onDrop={handleDrop}
			onDragLeave={() => {
				setDragging(false);
			}}
			onDragOver={(event) => {
				event.preventDefault();
				if (!disabled) setDragging(true);
			}}
			onKeyDown={(event) => {
				if (event.key === "Enter" || event.key === " ") {
					event.preventDefault();
					openFileDialog();
				}
			}}
		>
			<svg
				fill="none"
				height="42"
				viewBox="0 0 24 24"
				width="42"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3"
					stroke="#F7F7F7"
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth="1.5"
				/>
			</svg>
			<div className="text-neutral-05 lg:text-2xl text-xl font-medium">
				{title}
			</div>
			<div className="text-neutral-15 text-sm lg:text-md">{hint}</div>

			<input
				ref={inputRef}
				accept={accept}
				className="hidden"
				disabled={disabled}
				multiple={multiple}
				type="file"
				onChange={(event) => {
					acceptFiles([...(event.target.files ?? [])]);
					event.target.value = "";
				}}
			/>
		</div>
	);
};
