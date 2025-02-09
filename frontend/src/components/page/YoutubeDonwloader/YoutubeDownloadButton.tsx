import type { FunctionComponent } from "../../../common/types";
import type { AllowResolution } from "../../../types/youtube";
import { NoAudioIcon } from "../../icons/NoAudioIcon";
import { Select } from "../../ui/Select";

export const YoutubeDownloadButton = ({
	isLoading,
	videoDownload,
	format,
	allowResolutions,
	resolution,
	setResolution,
}: {
	isLoading: boolean;
	videoDownload: () => Promise<void>;
	format: string;
	allowResolutions: Array<AllowResolution>;
	resolution: AllowResolution | null;
	setResolution: (value: AllowResolution) => void;
}): FunctionComponent => {
	return (
		<div className="w-full flex justify-center gap-4 flex-col">
			{resolution?.download_url ? (
				<a
					href={resolution.download_url}
					target="_blank"
					className={`w-full h-12 bg-main-05 border border-neutral-05 flex justify-center items-center rounded-xl text-neutral-05
					${isLoading ? "bg-neutral-50 cursor-not-allowed" : "bg-main-05 hover:bg-main-10"}`}
				>
					{isLoading ? "FREE DOWNLOAD..." : "FREE DOWNLOAD"}
				</a>
			) : (
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
			)}
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
						currentValue={resolution?.resolution ?? ""}
						width="140px"
						optionTitles={allowResolutions.map((allowResolution) => (
							<div className="flex justify-between items-center gap-2">
								<span>{allowResolution.resolution}</span>
								{!allowResolution.is_audio && <NoAudioIcon />}
							</div>
						))}
						options={allowResolutions.map(
							(allowResolution) => allowResolution.resolution
						)}
						onChange={(value) => {
							setResolution(
								allowResolutions.find(
									(allowResolution) => allowResolution.resolution === value
								) as AllowResolution
							);
						}}
					></Select>
				</div>
			)}
		</div>
	);
};
