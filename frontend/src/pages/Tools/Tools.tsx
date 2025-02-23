import type { FunctionComponent } from "../../common/types";
import { Content } from "../../components/ui/Content";
import { useYoutubeStore } from "../../store/youtubeStore";
import { ToolCard } from "../../components/page/Tools/ToolCard";
import { ToolCards } from "../../components/page/Tools/ToolCards";

export const Tools = (): FunctionComponent => {
	const setCurrentYoutubeInfo = useYoutubeStore(
		(state) => state.setCurrentYoutubeInfo
	);

	return (
		<Content categoryName="Tools" title="Tools" tools={false}>
			<div className="flex flex-col gap-14">
				<ToolCards title="Youtube">
					<ToolCard
						to="/youtube-downloader"
						toolName="Video Downloader"
						onClick={() => {
							setCurrentYoutubeInfo("");
						}}
					/>
					<ToolCard
						to="/youtube-downloader"
						toolName="Tags Extractor"
						onClick={() => {
							setCurrentYoutubeInfo("tags");
						}}
					/>
				</ToolCards>
				<ToolCards title="Calculator">
					<ToolCard to="/calculator/gcd" toolName="Greatest Common Divisor" />
					<ToolCard to="/calculator/lcm" toolName="Least Common Multiple" />
				</ToolCards>
			</div>
		</Content>
	);
};
