import { useEffect, useRef, useState } from "react";
import type { FunctionComponent } from "../common/types";
import axios, { type AxiosResponse } from "axios";
import type {
	YouTubeDownloadRequest,
	YouTubeDownloadResolution,
	ResponseYouTubeVideoInfo,
	YouTubeDownloadFormat,
} from "../types/youtube";
import { PageTitle } from "../components/page/common";
import uuid from "react-uuid";
import { toast } from "react-toastify";
import { TAG } from "../components/ui/TAG";
import { CopyIcon } from "../components/icons/CopyIcon";
import { YoutubeDownloadButton } from "../components/page/YoutubeDonwloader/YoutubeDownloadButton";

interface YouTubeVideoInfo {
	title: string;
	durationString: string;
	thumbnail: string;
	tags: Array<string>;
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

const isVaildYoutubeURLString = (url: string): boolean => {
	if (!isValidURLString(url)) {
		toast.error("Invalid YouTube URL");
		return false;
	}

	const urlObject = new URL(url);
	if (urlObject.hostname !== "www.youtube.com") {
		toast.error("Invalid YouTube URL");
		return false;
	}
	const videoId = urlObject.searchParams.get("v");
	if (!videoId) {
		toast.error("Invalid YouTube URL");
		return false;
	}

	return true;
};

export const YoutubeDownloader = (): FunctionComponent => {
	const resolutions: Array<YouTubeDownloadResolution> = [
		"360p",
		"480p",
		"720p",
		"1080p",
	];
	// const formats: Array<YouTubeDownloadFormat> = ["mp4", "mp3"];
	const searchParameters = new URLSearchParams(window.location.search);
	const [title] = useState<string>(
		searchParameters.get("info") === "tags"
			? "YOUTUBE TAGS EXTRACTOR"
			: "YOUTUBE DOWNLOADER"
	);
	const [videoInfo, setVideoInfo] = useState<YouTubeVideoInfo | null>(null);
	const [url, setUrl] = useState<string>("");
	const [resolution, setResolution] =
		useState<YouTubeDownloadResolution>("360p");
	const [format] = useState<YouTubeDownloadFormat>("mp4");
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);
	const [progress, setProgress] = useState(0);
	const [speed, setSpeed] = useState(0);
	const [, setEta] = useState(0);
	const [isConverting, setIsConverting] = useState(false);
	const [infoParameter] = useState<string | null>(searchParameters.get("info"));
	const [myTags, setMyTags] = useState<Array<string>>([]);
	const clientId = useRef(uuid()); // 고유 ID 생성
	const wsRef = useRef<WebSocket | null>(null); // WebSocket 참조 저장

	useEffect(() => {
		const ws = new WebSocket(
			`ws://localhost:8000/api/v1/ws/${clientId.current}`
		);
		wsRef.current = ws;

		// 연결 시도
		ws.onopen = (): void => {
			console.log("WebSocket Connected:", clientId.current);
		};

		// 메시지 수신
		ws.onmessage = (event: MessageEvent): void => {
			console.log("Raw WebSocket message:", event.data);
			try {
				const data = JSON.parse(event.data as string) as {
					progress: number;
					speed: number;
					eta: number;
					status: string;
					phase: string;
				};
				console.log("Parsed WebSocket data:", data);

				setProgress(data.progress);
				setSpeed(data.speed);
				setEta(data.eta);

				if (data.phase === "downloading audio" && data.progress === 50) {
					setIsConverting(true);

					const progressInterval = setInterval(() => {
						setProgress((previousProgress) => {
							if (previousProgress === 99) {
								clearInterval(progressInterval);
								return previousProgress;
							}
							return previousProgress + 1;
						});
					}, 1000);
				}
			} catch (error) {
				console.error("Error parsing WebSocket message:", error);
			}
		};

		// 에러 발생
		ws.onerror = (error: Event): void => {
			console.error("WebSocket Error:", error);
		};

		// 연결 종료
		ws.onclose = (event: CloseEvent): void => {
			console.log("WebSocket Closed:", event.code, event.reason);
		};

		// 컴포넌트 언마운트 시 정리
		return (): void => {
			console.log("Cleaning up WebSocket connection");
			if (wsRef.current?.readyState === WebSocket.OPEN) {
				wsRef.current.close();
			}
		};
	}, []);

	const getVideoId = (url: string): string | null => {
		const videoId = new URL(url).searchParams.get("v");
		return videoId;
	};

	const videoDownload = async (): Promise<void> => {
		console.log("Starting download with clientId:", clientId.current);
		setIsLoading(true);
		setError(null);

		try {
			const response: AxiosResponse<Blob> = await axios.post(
				`http://localhost:8000/api/v1/youtube-download/${clientId.current}`,
				{
					url: url,
					resolution: resolution,
					format: format,
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
			let filename = `video.${format}`; // 기본 파일명

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

			setProgress(100);
			setIsConverting(false);
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

		if (!isVaildYoutubeURLString(url)) {
			setIsLoading(false);
			return;
		}

		const videoId = getVideoId(url);
		if (!videoId) {
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
			console.log(data);
			const title = data.title;
			const durationString = data.duration_string;
			const thumbnail = data.thumbnail;
			const tags = data.tags;

			if (!title || !durationString || !thumbnail || !tags.length) {
				setError("Failed to get video info");
				setIsLoading(false);
				return;
			}

			const videoInfo: YouTubeVideoInfo = {
				title,
				durationString,
				thumbnail,
				tags,
			};

			setVideoInfo(videoInfo);
		} catch (error) {
			console.error(error);
			setError("An unexpected error occurred");
		} finally {
			setIsLoading(false);
		}
	};

	const copyTags = async (): Promise<void> => {
		const videoTags = videoInfo?.tags || [];
		setMyTags([...myTags, ...videoTags]);

		const tags = videoInfo?.tags.join(",");
		if (tags) {
			await navigator.clipboard.writeText(tags);
			toast.success("Copied to clipboard");
		}
	};

	const copyMyTags = async (): Promise<void> => {
		const tags = myTags.join(",");
		if (tags) {
			await navigator.clipboard.writeText(tags);
			toast.success("Copied to clipboard");
		}
	};

	const tagHandler = (tag: string): void => {
		setMyTags((previousTags) => {
			if (previousTags.includes(tag)) {
				return previousTags.filter((t) => t !== tag);
			}
			return [...previousTags, tag];
		});
	};

	return (
		<div className="flex flex-col items-center justify-start min-h-[calc(100vh-4rem)] box-border">
			<PageTitle name={title} />
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
						className={`w-1/6 bg-main-05 border-2 border-neutral-05 flex justify-center items-center rounded-2xl text-2xl text-neutral-05
							${isLoading ? "bg-neutral-50 cursor-not-allowed" : "bg-main-05 hover:bg-main-10"}`}
					>
						{isLoading
							? "Ready..."
							: infoParameter === "tags"
								? "Get Tags"
								: "Download"}
					</button>
				</form>

				{error && (
					<div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
						{error}
					</div>
				)}

				{myTags.length > 0 && (
					<div className="flex flex-col gap-4 border border-neutral-05 rounded-2xl py-6 px-8">
						<div className="flex gap-3 items-center">
							<div className="text-neutral-05 font-medium text-2xl">
								MY TAGS
							</div>
							<CopyIcon iconSize="26" onClick={copyMyTags} />
						</div>
						<div className="rounded text-neutral-05 flex flex-wrap gap-4">
							{myTags.map((tag) => (
								<TAG
									key={tag}
									backgroundColorClass="bg-main-05"
									tag={tag}
									textColorClass="text-neutral-05"
									textSizeClass="text-md"
									onClick={() => {
										tagHandler(tag);
									}}
								/>
							))}
						</div>
					</div>
				)}

				{videoInfo && (
					<div className="flex flex-col gap-8">
						{/* 썸네일 */}
						<div className="flex gap-8">
							<div
								className={`w-1/2 rounded-2xl overflow-hidden ${
									videoInfo?.thumbnail ? "" : "loading-gradient"
								}`}
							>
								<img
									alt={videoInfo?.title}
									className="w-full  object-cover"
									src={videoInfo?.thumbnail}
								/>
							</div>
							{/* 비디오 정보 */}
							<div className="flex flex-col gap-8 w-1/2 ">
								<div className="flex flex-col justify-between h-full p-6 rounded-2xl bg-main-00 border border-neutral-05 ">
									<div className="flex flex-col h-full gap-3">
										<div className="font-medium text-neutral-05 text-ellipsis overflow-hidden whitespace-nowrap">
											{videoInfo?.title}
										</div>
										<div className="text-sm text-neutral-10 font-medium text-right">
											{videoInfo?.durationString}
										</div>
									</div>

									{/* 다운로드 버튼 */}
									{!infoParameter && (
										<YoutubeDownloadButton
											format={format}
											isLoading={isLoading}
											resolution={resolution}
											resolutions={resolutions}
											setResolution={setResolution}
											videoDownload={videoDownload}
										/>
									)}
								</div>

								{/* 태그 */}
								{infoParameter === "tags" && (
									<div className="flex flex-col gap-8">
										<div className="flex gap-3 items-center">
											<div className="text-neutral-05 font-medium">TAGS</div>
											<CopyIcon iconSize="18" onClick={copyTags} />
										</div>
										<div className="flex flex-wrap gap-4">
											{videoInfo?.tags.map((tag) => (
												<TAG
													key={tag}
													tag={tag}
													textColorClass="text-main-05"
													textSizeClass="text-md"
													backgroundColorClass={`${
														myTags.includes(tag)
															? "bg-green-05"
															: "bg-neutral-05"
													}`}
													onClick={() => {
														tagHandler(tag);
													}}
												/>
											))}
										</div>
									</div>
								)}
							</div>
						</div>

						{/* 다운로드 진행 바 */}
						{!infoParameter && (
							<div className="progress_bar_area">
								<div className="progress_bar">
									<div
										className="progress"
										style={{ width: `${progress}%` }}
									></div>
									<div className="progress_text">{progress}%</div>
								</div>
								<div className="stats text-sm text-neutral-10 font-medium text-right">
									{isConverting ? (
										<p>Converting audio to mp3...</p>
									) : (
										<p>Download speed: {speed} MB/s</p>
									)}
								</div>
							</div>
						)}
					</div>
				)}
			</div>
		</div>
	);
};
