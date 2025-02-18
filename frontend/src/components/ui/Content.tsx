import type { FunctionComponent } from "../../common/types";
import { useSidebarStore } from "../../store/Sidebar";
import { PageTitle } from "../page/common";

export const Content = ({
	children,
	title,
	categoryName,
	tools = true,
}: {
	children: React.ReactNode;
	title: string;
	categoryName: string;
	tools?: boolean;
}): FunctionComponent => {
	const sidebarOpen = useSidebarStore((state) => state.sidebarOpen);
	const setSidebarOpen = useSidebarStore((state) => state.setSidebarOpen);
	return (
		<div className="flex flex-col items-center justify-start min-h-[calc(100vh-4rem)] box-border">
			<div className="relative w-full flex justify-center items-center">
				<PageTitle categoryName={categoryName} name={title} />
				{tools && (
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
				)}
			</div>
			<div className="w-full flex flex-col gap-8">{children}</div>
		</div>
	);
};
