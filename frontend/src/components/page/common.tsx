import type { FunctionComponent } from "../../common/types";

export const PageTitle = ({
	categoryName,
	name,
}: {
	categoryName: string;
	name: string;
}): FunctionComponent => {
	return (
		<div className="w-full flex flex-col items-center justify-start">
			<div className="font-regular text-neutral-15 mb-6 lg:mb-2">
				{categoryName}
			</div>
			<h1 className="text-xl lg:text-2xl font-medium text-neutral-05 mb-10">
				{name}
			</h1>
		</div>
	);
};
