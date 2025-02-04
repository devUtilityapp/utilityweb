import { useState } from "react";
import type { FunctionComponent } from "../common/types";
import axios, { type AxiosResponse } from "axios";
import type {
	YouTubeDownloadRequest,
	YouTubeDownloadResolution,
	ResponseYouTubeVideoInfo,
} from "../types/youtube";
import { CustomSelect, PageTitle } from "../components/page/common";

interface YouTubeVideoInfo {
	title: string;
	durationString: string;
	thumbnail: string;
}

const isValidURLString = (url: string): boolean => {
	const urlPattern = new RegExp(
		"^(https?:\\/\\/)?" + // validate protocol
			"((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // validate domain name
			"((\\d{1,3}\\.){3}\\d{1,3}))" + // validate OR ip (v4) address
			"(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // validate port and path
			"(\\?[;&a-z\\d%_.~+=-]*)?" + // validate query string
			"(\\#[-a-z\\d_]*)?$",
		"i"
	); // validate fragment locator
	return !!urlPattern.test(url);
};

export const YoutubeDownloader = (): FunctionComponent => {
	const resolutions: Array<YouTubeDownloadResolution> = [
		"360p",
		"480p",
		"720p",
		"1080p",
	];
	const [videoInfo, setVideoInfo] = useState<YouTubeVideoInfo | null>(null);
	const [url, setUrl] = useState<string>("");
	const [resolution, setResolution] =
		useState<YouTubeDownloadResolution>("360p");
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);

	const getVideoId = (url: string): string | null => {
		const videoId = new URL(url).searchParams.get("v");
		return videoId;
	};

	const videoDownload = async (): Promise<void> => {
		setIsLoading(true);
		setError(null);

		try {
			const response: AxiosResponse<Blob> = await axios.post(
				"http://localhost:8000/api/v1/youtube-download",
				{
					url: url,
					resolution: resolution,
					format: "mp4",
				} as YouTubeDownloadRequest,
				{
					responseType: "blob",
					headers: {
						"Content-Type": "application/json",
					},
				}
			);

			// Content-Disposition 헤더에서 파일명 추출
			const contentDisposition = response.headers["content-disposition"] as
				| string
				| undefined;
			let filename = "video.mp4"; // 기본 파일명

			if (contentDisposition) {
				// UTF-8로 인코딩된 파일명 디코딩
				const filenameMatch = contentDisposition.match(
					/filename\*?=['"]?(?:UTF-\d['"]*)?([^;\r\n"']*)['"]?;?/i
				);
				if (filenameMatch && filenameMatch[1]) {
					filename = decodeURIComponent(filenameMatch[1]);
				} else {
					// 기본 filename 파라미터 확인
					const defaultMatch = contentDisposition.match(
						/filename=['"]?([^;\r\n"']*)['"]?;?/i
					);
					if (defaultMatch && defaultMatch[1]) {
						filename = defaultMatch[1];
					}
				}
			}

			// 파일 다운로드 처리
			const downloadUrl = window.URL.createObjectURL(new Blob([response.data]));
			const link = document.createElement("a");
			link.href = downloadUrl;
			link.download = filename;
			document.body.appendChild(link);
			link.click();
			link.remove();
			window.URL.revokeObjectURL(downloadUrl);
		} catch (error) {
			console.error(error);
			if (axios.isAxiosError(error)) {
				setError(
					(error.response?.data as { detail: string })?.detail || error.message
				);
			} else {
				setError("An unexpected error occurred");
			}
		} finally {
			setIsLoading(false);
		}
	};

	const getVideoInfo = async (
		event: React.FormEvent<HTMLFormElement>
	): Promise<void> => {
		event.preventDefault();
		setIsLoading(true);
		setError(null);

		if (!isValidURLString(url)) {
			setError("Invalid YouTube URL");
			setIsLoading(false);
			return;
		}

		const videoId = getVideoId(url);
		if (!videoId) {
			setError("Invalid YouTube URL");
			setIsLoading(false);
			return;
		}

		try {
			const response: AxiosResponse<ResponseYouTubeVideoInfo> = await axios.get(
				`http://localhost:8000/api/v1/youtube-video/info/${videoId}`
			);

			const data = response.data;
			if (!data) {
				setError("Failed to get video info");
				setIsLoading(false);
				return;
			}
			const title = data.title;
			const durationString = data.duration_string;
			const thumbnail = data.thumbnail;

			if (!title || !durationString || !thumbnail) {
				setError("Failed to get video info");
				setIsLoading(false);
				return;
			}

			const videoInfo: YouTubeVideoInfo = {
				title,
				durationString,
				thumbnail,
			};

			setVideoInfo(videoInfo);
		} catch (error) {
			console.error(error);
			setError("An unexpected error occurred");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="flex flex-col items-center justify-start min-h-[calc(100vh-4rem)] py-20 px-30 box-border">
			<PageTitle name="YOUTUBE DOWNLOADER" />
			<div className="w-full flex flex-col gap-8">
				<form className="flex h-20 gap-8" onSubmit={getVideoInfo}>
					<div className="w-5/6 h-full">
						<input
							required
							className="block w-full h-full rounded-2xl text-2xl px-8 border-neutral-05 border-2 bg-main-00 text-neutral-05 outline-none"
							id="url"
							placeholder="https://www.youtube.com/watch?v=..."
							type="text"
							value={url}
							onChange={(event) => {
								setUrl(event.target.value);
							}}
						/>
					</div>

					<button
						disabled={isLoading}
						type="submit"
						className={`w-1/6 bg-main-05 border-2 border-neutral-05 flex justify-center items-center rounded-2xl text-2xl text-neutral-05 px-3
							${isLoading ? "bg-neutral-50 cursor-not-allowed" : "bg-main-05 hover:bg-main-10"}`}
					>
						{isLoading ? "download..." : "download"}
					</button>
				</form>

				{error && (
					<div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
						{error}
					</div>
				)}

				{/* 비디오 정보 */}
				{videoInfo && (
					<div className="flex gap-8">
						{/* 썸네일 */}
						<div
							className={`w-1/2 rounded-2xl overflow-hidden ${
								videoInfo?.thumbnail ? "" : "loading-gradient"
							}`}
						>
							<img
								alt={videoInfo?.title}
								className="w-full h-full object-cover"
								src={videoInfo?.thumbnail}
							/>
						</div>

						{/* 비디오 정보 */}
						<div className="w-full flex flex-col justify-between  p-6 rounded-2xl bg-main-00 border border-neutral-05 w-1/2">
							<div className="flex flex-col h-full gap-3">
								<div className="font-medium text-neutral-05 text-ellipsis overflow-hidden whitespace-nowrap">
									{videoInfo?.title}
								</div>
								<div className="text-sm text-neutral-10 font-medium text-right">
									{videoInfo?.durationString}
								</div>
							</div>
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
								<div className="flex justify-end items-center gap-6 h-12">
									<label className="pointer-events-none " htmlFor="resolution">
										<span className="text-neutral-05 font-medium">
											Select video quality
										</span>
									</label>
									<CustomSelect
										currentValue={resolution}
										options={resolutions}
										onChange={(value) => {
											setResolution(value as YouTubeDownloadResolution);
										}}
									></CustomSelect>
								</div>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};
