import type { FunctionComponent } from "../../../../common/types";

export const SidebarItems = ({
	title,
	children,
}: {
	title: string;
	children: React.ReactNode;
}): FunctionComponent => {
	return (
		<div className="flex flex-col gap-4">
			<div className="text-neutral-10 text-xl font-medium">{title}</div>
			<ul className="flex flex-col gap-3 pl-3">{children}</ul>
		</div>
	);
};

export default SidebarItems;
