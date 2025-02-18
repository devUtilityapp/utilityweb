import { Link } from "@tanstack/react-router";
import type { FunctionComponent } from "../../common/types";
import { Content } from "../../components/ui/Content";
import { useYoutubeStore } from "../../store/youtubeStore";

export const Tools = (): FunctionComponent => {
	const setCurrentYoutubeInfo = useYoutubeStore(
		(state) => state.setCurrentYoutubeInfo
	);

	return (
		<Content categoryName="Tools" title="Tools" tools={false}>
			<div className="flex flex-col gap-14">
				<div className="flex flex-col gap-4">
					<div className="text-neutral-05 font-medium text-2xl">Youtube</div>
					<div className="tool_items flex flex-wrap px-4">
						<div className="tool_item flex justify-center items-center gap-4 border border-neutral-05 rounded-lg">
							<Link
								className="w-full h-full flex justify-center items-center text-neutral-05 font-medium "
								to="/youtube-downloader"
								onClick={() => {
									setCurrentYoutubeInfo("");
								}}
							>
								Video Downloader
							</Link>
						</div>
						<div className="tool_item flex justify-center items-center gap-4 border border-neutral-05 rounded-lg">
							<Link
								className="w-full h-full flex justify-center items-center text-neutral-05 font-medium "
								search={{ info: "tags" }}
								to="/youtube-downloader"
								onClick={() => {
									setCurrentYoutubeInfo("tags");
								}}
							>
								Tags Extractor
							</Link>
						</div>
					</div>
				</div>
				<div className="flex flex-col gap-4">
					<div className="text-neutral-05 font-medium text-2xl">Calculator</div>
					<div className="tool_items flex flex-wrap px-4">
						<div className="tool_item flex justify-center items-center gap-4 border border-neutral-05 rounded-lg">
							<Link
								className="w-full h-full flex justify-center items-center text-neutral-05 font-medium "
								to="/calculator/gcd"
							>
								Greatest Common Divisor
							</Link>
						</div>
						<div className="tool_item flex justify-center items-center gap-4 border border-neutral-05 rounded-lg">
							<Link
								className="w-full h-full flex justify-center items-center text-neutral-05 font-medium "
								to="/calculator/lcm"
							>
								Least Common Multiple
							</Link>
						</div>
					</div>
				</div>
			</div>
		</Content>
	);
};
