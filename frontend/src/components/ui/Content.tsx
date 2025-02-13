import type { FunctionComponent } from "../../common/types";
import { useSidebarStore } from "../../store/Sidebar";
import { PageTitle } from "../page/common";

export const Content = ({
	children,
	title,
}: {
	children: React.ReactNode;
	title: string;
}): FunctionComponent => {
	const sidebarOpen = useSidebarStore((state) => state.sidebarOpen);
	const setSidebarOpen = useSidebarStore((state) => state.setSidebarOpen);
	return (
		<div className="flex flex-col items-center justify-start min-h-[calc(100vh-4rem)] box-border">
			<div className="relative w-full flex justify-center items-center">
				<PageTitle name={title} />
				<div
					className="absolute top-0 left-0 cursor-pointer"
					onClick={() => {
						setSidebarOpen(!sidebarOpen);
					}}
				>
					<div className="text-neutral-15 font-medium text-2xl select-none">
						Tools
					</div>
				</div>
			</div>
			{children}
		</div>
	);
};
