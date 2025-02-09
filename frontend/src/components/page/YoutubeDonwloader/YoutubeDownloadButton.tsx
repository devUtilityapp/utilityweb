import type { FunctionComponent } from "../../../common/types";
import type { YouTubeDownloadResolution } from "../../../types/youtube";
import { Select } from "../../ui/Select";

export const YoutubeDownloadButton = ({
	isLoading,
	videoDownload,
	format,
	resolutions,
	resolution,
	setResolution,
}: {
	isLoading: boolean;
	videoDownload: () => Promise<void>;
	format: string;
	resolutions: Array<string>;
	resolution: YouTubeDownloadResolution;
	setResolution: (value: YouTubeDownloadResolution) => void;
}): FunctionComponent => {
	return (
		<div className="w-full flex justify-center gap-4 flex-col">
			<button
				disabled={isLoading}
				className={`w-full h-12 bg-main-05 border border-neutral-05 flex justify-center items-center rounded-xl text-neutral-05
				${isLoading ? "bg-neutral-50 cursor-not-allowed" : "bg-main-05 hover:bg-main-10"}`}
				onClick={async () => {
					await videoDownload();
				}}
			>
				{isLoading ? "FREE DOWNLOAD..." : "FREE DOWNLOAD"}
			</button>
			{/*
												<div className="flex justify-end items-center gap-6 h-12">
													<label
														className="pointer-events-none "
														htmlFor="resolution"
													>
														<span className="text-neutral-05 font-medium">
															Select video format
														</span>
													</label>
													<Select
														currentValue={format}
														options={formats}
														onChange={(value) => {
															setFormat(value as YouTubeDownloadFormat);
														}}
													></Select>
												</div> 
											*/}
			{format === "mp4" && (
				<div className="flex justify-end items-center gap-6 h-12">
					<label className="pointer-events-none " htmlFor="resolution">
						<span className="text-neutral-05 font-medium">
							Select video quality
						</span>
					</label>
					<Select
						currentValue={resolution}
						options={resolutions}
						onChange={(value) => {
							setResolution(value as YouTubeDownloadResolution);
						}}
					></Select>
				</div>
			)}
		</div>
	);
};
