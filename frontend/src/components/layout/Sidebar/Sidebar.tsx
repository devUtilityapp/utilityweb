import { useTranslation } from "react-i18next";
import type { FunctionComponent } from "../../../common/types";
import { useSidebarStore } from "../../../store/Sidebar";
import { TOOL_CATEGORIES } from "../../../common/toolCatalog";
import { tDynamic } from "../../../common/translate";
import SidebarItems from "./SidebarItem/SidebarItems";
import SidebarItem from "./SidebarItem/SidebarItem";
import { useEffect } from "react";

export const Sidebar = (): FunctionComponent => {
	const { t } = useTranslation();
	const sidebarOpen = useSidebarStore((state) => state.sidebarOpen);
	const setSidebarOpen = useSidebarStore((state) => state.setSidebarOpen);

	// 렌더 중에 리스너를 등록하면 렌더마다 쌓이므로 effect에서 등록하고 정리한다.
	useEffect(() => {
		const setSidebarHeight = (): void => {
			const header = document.getElementById("header");
			const sidebar = document.getElementById("sidebar");
			if (header && sidebar) {
				sidebar.style.height = `${window.innerHeight - header.clientHeight + 1}px`;
			}
		};

		setSidebarHeight();
		window.addEventListener("resize", setSidebarHeight);
		return (): void => {
			window.removeEventListener("resize", setSidebarHeight);
		};
	}, []);
	return (
		<div
			id="sidebar"
			className={`sidebar w-1/6 min-w-[300px] h-screen flex flex-col fixed bottom-0 py-6 px-8 left-0 bg-main-10 rounded-tr-2xl rounded-br-2xl shadow-md z-50 gap-8 transition-transform duration-300 ${
				sidebarOpen ? "translate-x-0" : "-translate-x-full"
			}`}
		>
			<div className="flex justify-between items-center ">
				<div className="text-neutral-05 text-2xl font-medium">
					{t("nav.tools")}
				</div>
				<div
					className="cursor-pointer"
					onClick={() => {
						setSidebarOpen(false);
					}}
				>
					<svg
						fill="none"
						height="30"
						viewBox="0 0 30 30"
						width="30"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							clipRule="evenodd"
							d="M19.1381 15.0001L11.9137 7.77382L10.5862 9.09944L16.4869 15.0001L10.5862 20.8988L11.9137 22.2263L19.1381 15.0001Z"
							fill="#F7F7F7"
							fillRule="evenodd"
						/>
					</svg>
				</div>
			</div>
			<div className="border-b border-neutral-15 w-full"></div>
			<div className="flex flex-col gap-10 overflow-y-auto pb-10">
				{TOOL_CATEGORIES.map((category) => (
					<SidebarItems
						key={category.key}
						title={tDynamic(t, `categories.${category.key}`)}
					>
						{category.tools.map((tool) => (
							<SidebarItem
								key={`${tool.to}-${tool.key}`}
								item={{
									name: tDynamic(t, `tools.${tool.key}.short`),
									link: tool.to,
									search: tool.search,
									onClick: () => {
										setSidebarOpen(false);
									},
								}}
							/>
						))}
					</SidebarItems>
				))}
			</div>
		</div>
	);
};
