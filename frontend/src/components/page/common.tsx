import type { FunctionComponent } from "../../common/types";

export const PageTitle = ({ name }: { name: string }): FunctionComponent => {
	return (
		<div className="text-2xl font-medium text-neutral-05 mb-10">{name}</div>
	);
};
