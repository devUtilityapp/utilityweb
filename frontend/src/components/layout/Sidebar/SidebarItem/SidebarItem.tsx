import { Link } from "@tanstack/react-router";

const SidebarItem = ({
	item,
}: {
	item: { name: string; link: string; onClick: () => void };
}): React.ReactNode => {
	return (
		<li className="text-neutral-05 text-xl font-medium">
			<Link to={item.link} onClick={item.onClick}>
				{item.name}
			</Link>
		</li>
	);
};

export default SidebarItem;
