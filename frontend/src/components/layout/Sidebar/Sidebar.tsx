import { Link } from "@tanstack/react-router";
import type { FunctionComponent } from "../../../common/types";
import { useYoutubeStore } from "../../../store/youtubeStore";
import { useSidebarStore } from "../../../store/Sidebar";

export const Sidebar = (): FunctionComponent => {
	const setCurrentYoutubeInfo = useYoutubeStore(
		(state) => state.setCurrentYoutubeInfo
	);
	const sidebarOpen = useSidebarStore((state) => state.sidebarOpen);
	const setSidebarOpen = useSidebarStore((state) => state.setSidebarOpen);
	return (
		<div
			id="sidebar"
			className={`sidebar w-1/6 h-screen flex flex-col fixed bottom-0 py-6 px-8 left-0 bg-main-10 rounded-tr-2xl rounded-br-2xl shadow-md z-50 gap-8 transition-all duration-300 ${
				sidebarOpen ? "translate-x-0" : "-translate-x-full"
			}`}
		>
			<div className="flex justify-between items-center ">
				<div className="text-neutral-05 text-2xl font-medium">TOOLS</div>
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
			<div className="flex flex-col gap-4">
				<div className="text-neutral-10 text-xl font-medium">Youtube</div>
				<ul className="flex flex-col gap-3 pl-3">
					<li className="text-neutral-05 text-xl font-medium">
						<Link
							to="/youtube-downloader"
							onClick={() => {
								setCurrentYoutubeInfo("");
								setSidebarOpen(false);
							}}
						>
							video downloader
						</Link>
					</li>
					<li className="text-neutral-05 text-xl font-medium">
						<Link
							to="/youtube-downloader?info=tags"
							onClick={() => {
								setCurrentYoutubeInfo("tags");
								setSidebarOpen(false);
							}}
						>
							tag explorer
						</Link>
					</li>
				</ul>
			</div>
		</div>
	);
};
