import type { FunctionComponent } from "../../common/types";
import type { SetStateAction, Dispatch } from "react";
import { toast } from "react-toastify";

type Props<T extends string | number | Array<number>> = {
	value: T;
	setValue: T extends Array<number>
		? Dispatch<SetStateAction<Array<number>>>
		: (value: T) => void;
	placeholder: string;
	id: string;
	pattern?: string;
	onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
};

export const MainInput = <T extends string | number | Array<number>>({
	value,
	setValue,
	placeholder,
	id,
	pattern,
	onKeyDown,
}: Props<T>): FunctionComponent => {
	const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
		const inputValue = event.target.value;

		if (pattern === "numbers-only" && !/^[\d,\s]*$/.test(inputValue)) {
			return;
		}

		const cleanedValue = inputValue.replace(/\s/g, "");

		if (Array.isArray(value)) {
			(setValue as Dispatch<SetStateAction<Array<number>>>)(
				cleanedValue.split(",").map(Number)
			);
		} else if (typeof value === "number") {
			(setValue as (value: number) => void)(Number(cleanedValue));
		} else {
			(setValue as (value: string) => void)(cleanedValue);
		}
	};

	const handleKeyDown = (
		event: React.KeyboardEvent<HTMLInputElement>
	): void => {
		if (pattern === "numbers-only") {
			if (
				!/[\d,\s]/.test(event.key) &&
				![
					"Backspace",
					"Delete",
					"ArrowLeft",
					"ArrowRight",
					"Tab",
					"Enter",
					"Meta",
					"v",
					"Control",
					"a",
					"z",
					"c",
				].includes(event.key)
			) {
				event.preventDefault();
			}
		}
		onKeyDown?.(event);
	};

	const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>): void => {
		console.log("Paste event triggered");

		if (pattern === "numbers-only") {
			const pastedText = event.clipboardData.getData("text");
			console.log("Pasted text:", pastedText);

			const cleanedText = pastedText.replace(/\s/g, "");
			console.log("Cleaned text:", cleanedText);

			if (!/^[\d,]*$/.test(cleanedText)) {
				event.preventDefault();
				toast.error("Only numbers and commas are allowed");
				return;
			}

			if (/,,/.test(cleanedText)) {
				event.preventDefault();
				toast.error("Invalid format: consecutive commas are not allowed");
				return;
			}

			if (cleanedText.startsWith(",") || cleanedText.endsWith(",")) {
				event.preventDefault();
				toast.error("Invalid format: comma at start or end is not allowed");
				return;
			}

			const currentValue = event.currentTarget.value;
			const selectionStart = event.currentTarget.selectionStart || 0;
			const selectionEnd = event.currentTarget.selectionEnd || 0;
			const newValue =
				currentValue.slice(0, selectionStart) +
				cleanedText +
				currentValue.slice(selectionEnd);

			if (!/^[\d,]*$/.test(newValue.replace(/\s/g, ""))) {
				event.preventDefault();
				toast.error("Invalid format after paste");
				return;
			}

			if (Array.isArray(value)) {
				(setValue as Dispatch<SetStateAction<Array<number>>>)(
					newValue.split(",").map(Number)
				);
			} else if (typeof value === "number") {
				(setValue as (value: number) => void)(Number(newValue));
			} else {
				(setValue as (value: string) => void)(newValue);
			}
			event.preventDefault();
		}
	};

	return (
		<input
			required
			className="block w-full h-full rounded-2xl text-2xl px-8 border-neutral-05 border-2 bg-main-00 text-neutral-05 outline-none"
			id={id}
			placeholder={placeholder}
			type="text"
			value={Array.isArray(value) ? value.join(", ") : value.toString()}
			onChange={handleChange}
			onKeyDown={handleKeyDown}
			onPaste={handlePaste}
		/>
	);
};
