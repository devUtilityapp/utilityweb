import { LocalizedLink } from "../../../ui/LocalizedLink";

const SidebarItem = ({
	item,
}: {
	item: {
		name: string;
		link: string;
		search?: Record<string, string>;
		onClick: () => void;
	};
}): React.ReactNode => {
	return (
		<li className="text-neutral-05 text-xl font-medium">
			<LocalizedLink search={item.search} to={item.link} onClick={item.onClick}>
				{item.name}
			</LocalizedLink>
		</li>
	);
};

export default SidebarItem;
