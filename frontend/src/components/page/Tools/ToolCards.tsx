import type { FunctionComponent } from "../../../common/types";

export const ToolCards = ({
	title,
	children,
}: {
	title: string;
	children: React.ReactNode;
}): FunctionComponent => {
	return (
		<div className="flex flex-col gap-8">
			<div className="text-neutral-05 font-medium text-2xl">{title}</div>
			<div className="tool_items flex flex-wrap px-4">{children}</div>
		</div>
	);
};
