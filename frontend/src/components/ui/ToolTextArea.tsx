import { useState } from "react";
import { toast } from "react-toastify";
import type { FunctionComponent } from "../../common/types";

/**
 * 도구 페이지의 입력 상자.
 * 파일을 떨어뜨리면 그 내용을 텍스트로 읽어 채운다.
 */
export const ToolTextArea = ({
	id,
	value,
	placeholder,
	readOnly = false,
	height = "h-[320px]",
	mono = false,
	accept,
	onChange,
}: {
	id: string;
	value: string;
	placeholder: string;
	readOnly?: boolean;
	height?: string;
	mono?: boolean;
	accept?: string;
	onChange?: (value: string) => void;
}): FunctionComponent => {
	const [dragging, setDragging] = useState(false);

	const readFile = (file: File | undefined): void => {
		if (!file || !onChange) return;
		file
			.text()
			.then(onChange)
			.catch(() => {
				toast.error(`Cannot read the file: ${file.name}`);
			});
	};

	return (
		<textarea
			id={id}
			placeholder={placeholder}
			readOnly={readOnly}
			spellCheck={false}
			value={value}
			className={`w-full ${height} bg-main-00 border rounded-xl p-4 text-neutral-05
				outline-none resize-y leading-relaxed
				${mono ? "font-mono text-sm" : ""}
				${dragging ? "border-green-05" : "border-neutral-05"}`}
			onChange={(event) => {
				onChange?.(event.target.value);
			}}
			onDragLeave={() => {
				setDragging(false);
			}}
			onDragOver={(event) => {
				if (!onChange) return;
				event.preventDefault();
				setDragging(true);
			}}
			onDrop={(event) => {
				if (!onChange) return;
				event.preventDefault();
				setDragging(false);
				readFile(event.dataTransfer.files[0]);
			}}
			{...(accept ? { "data-accept": accept } : {})}
		/>
	);
};
