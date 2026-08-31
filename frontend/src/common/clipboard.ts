import { toast } from "react-toastify";

/** 값을 클립보드에 넣고 결과를 알린다. https 또는 localhost에서만 동작한다. */
export const copyToClipboard = (value: string): void => {
	navigator.clipboard
		.writeText(value)
		.then(() => {
			toast.success("Copied to the clipboard");
		})
		.catch(() => {
			toast.error("Cannot access the clipboard");
		});
};
