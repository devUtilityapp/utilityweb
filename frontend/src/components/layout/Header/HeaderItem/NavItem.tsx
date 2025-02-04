import { Link } from "@tanstack/react-router";
import type { FunctionComponent } from "../../../../common/types";

export const NavItem = ({
	name,
	to,
}: {
	name: string;
	to: string;
}): FunctionComponent => {
	return (
		<Link
			activeProps={{ className: "text-neutral-00" }}
			className="text-neutral-15 hover:text-neutral-00 transition-colors"
			to={to}
		>
			{name}
		</Link>
	);
};

export const CircleNavItem = ({
	name,
	to,
}: {
	name: string;
	to: string;
}): FunctionComponent => {
	return (
		<Link
			className="text-sm text-neutral-05 border border-neutral-15 rounded-full px-3 h-full flex justify-center items-center"
			to={to}
		>
			{name}
		</Link>
	);
};

export const IconButton = ({
	svg,
}: {
	svg: React.ReactNode;
}): FunctionComponent => {
	return (
		<div className="flex justify-center items-center bg-main-10 p-5px rounded-md">
			{svg}
		</div>
	);
};
