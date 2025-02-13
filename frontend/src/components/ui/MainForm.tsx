import type { FunctionComponent } from "../../common/types";
import { useProcessLoadingStore } from "../../store/ProcessLoading";

export const MainForm = ({
	children,
	onSubmit,
	buttonText,
}: {
	children: React.ReactNode;
	onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
	buttonText: string;
}): FunctionComponent => {
	const { processLoading } = useProcessLoadingStore();

	return (
		<form className="flex h-20 gap-8" onSubmit={onSubmit}>
			{children}

			<button
				disabled={processLoading}
				type="submit"
				className={`w-1/6 bg-main-05 border-2 border-neutral-05 flex justify-center items-center rounded-2xl text-2xl text-neutral-05
							${processLoading ? "bg-neutral-50 cursor-not-allowed" : "bg-main-05 hover:bg-main-10"}`}
			>
				{processLoading ? "Loading..." : buttonText}
			</button>
		</form>
	);
};
