import type { FunctionComponent } from "../../common/types";
import { useProcessLoadingStore } from "../../store/ProcessLoading";

export const MainSearchParameterForm = ({
	children,
	onSubmit,
	parameter,
}: {
	children: React.ReactNode;
	onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
	parameter: string;
}): FunctionComponent => {
	const { processLoading } = useProcessLoadingStore();

	return (
		<form
			className="flex gap-8 lg:flex-row sm: flex-col items-end"
			onSubmit={onSubmit}
		>
			<div
				className="w-full lg:w-5/6 
				lg:h-20 h-16
				sm:w-full"
			>
				{children}
			</div>

			<button
				disabled={processLoading}
				type="submit"
				className={`w-1/3 min-w-[150px] bg-main-05 border-2 border-neutral-05 flex justify-center 
					items-center text-neutral-05 h-16 
					lg:h-20 lg:rounded-2xl rounded-xl
					lg:text-2xl text-xl
					${processLoading ? "bg-neutral-50 cursor-not-allowed" : "bg-main-05 hover:bg-main-10"}`}
			>
				{processLoading
					? "Ready..."
					: parameter === "tags"
						? "Get Tags"
						: "Download"}
			</button>
		</form>
	);
};
