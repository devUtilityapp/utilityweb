import type { FunctionComponent } from "../../common/types";
import { isYoutubeToolEnabled } from "../../common/features";
import { Content } from "../../components/ui/Content";
import { ToolCard } from "../../components/page/Tools/ToolCard";
import { ToolCards } from "../../components/page/Tools/ToolCards";

export const Tools = (): FunctionComponent => {
	return (
		<Content categoryName="Tools" title="Tools" tools={false}>
			<div className="flex flex-col gap-14">
				{isYoutubeToolEnabled && (
					<ToolCards title="Youtube">
						<ToolCard to="/youtube-downloader" toolName="Video Downloader" />
						<ToolCard
							search={{ info: "tags" }}
							to="/youtube-downloader"
							toolName="Tags Extractor"
						/>
					</ToolCards>
				)}
				<ToolCards title="PDF">
					<ToolCard to="/pdf-to-pptx" toolName="PDF to PPTX" />
				</ToolCards>
				<ToolCards title="PPTX">
					<ToolCard to="/pptx-viewer" toolName="PPTX Viewer" />
				</ToolCards>
				<ToolCards title="Calculator">
					<ToolCard to="/calculator/gcd" toolName="Greatest Common Divisor" />
					<ToolCard to="/calculator/lcm" toolName="Least Common Multiple" />
				</ToolCards>
			</div>
		</Content>
	);
};
