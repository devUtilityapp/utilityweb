import type { FunctionComponent } from "../../../common/types";
import { LocalizedLink } from "../../ui/LocalizedLink";

export const ToolCard = ({
	toolName,
	to,
	search,
}: {
	toolName: string;
	to: string;
	search?: Record<string, string>;
}): FunctionComponent => {
	return (
		<div className="tool_item flex justify-center items-center gap-4 border border-neutral-05 rounded-lg">
			<LocalizedLink
				className="w-full h-full flex justify-center items-center text-neutral-05 font-medium text-center px-2"
				search={search}
				to={to}
			>
				{toolName}
			</LocalizedLink>
		</div>
	);
};
