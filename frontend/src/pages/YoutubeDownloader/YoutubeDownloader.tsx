import { useTranslation } from "react-i18next";
import { useEffect, useRef, useState } from "react";
import { useSearch } from "@tanstack/react-router";
import axios, { type AxiosResponse } from "axios";
import uuid from "react-uuid";
import { toast } from "react-toastify";
import type { FunctionComponent } from "../../common/types";
import type {
	AllowResolution,
	ResponseYouTubeVideoInfoWithAllowResolutions,
	YouTubeDownloadFormat,
	YouTubeDownloadRequest,
} from "../../types/youtube";
import {
	downloadProgressWebSocketUrl,
	isDownloadApiConfigured,
	videoDownloadUrl,
	videoInfoUrl,
} from "../../common/youtubeApi";
import { TAG } from "../../components/ui/TAG";
import { CopyIcon } from "../../components/icons/CopyIcon";
import { YoutubeDownloadButton } from "../../components/page/YoutubeDonwloader/YoutubeDownloadButton";
import { MainInput } from "../../components/ui/MainInput";
import { Content } from "../../components/ui/Content";
import { useProcessLoadingStore } from "../../store/ProcessLoading";
import { MainSearchParameterForm } from "../../components/ui/MainSearchParameterForm";

interface YouTubeVideoInfo {
	title: string;
	durationString: string;
	thumbnail: string;
	tags: Array<string>;
	allowResolutions: Array<AllowResolution>;
}

interface DownloadProgress {
	progress: number;
	speed: number;
	eta: number;
	phase: string;
}

// Cloud Function은 실패해도 HTTP 200으로 { error, status }를 돌려주는 경우가 있다.
interface VideoInfoErrorResponse {
	error?: string;
	status?: number;
}

const getYoutubeVideoId = (url: string): string | null => {
	let urlObject: URL;
	try {
		urlObject = new URL(url.startsWith("http") ? url : `https://${url}`);
	} catch {
		return null;
	}

	const hostname = urlObject.hostname.replace(/^www\./, "");

	if (hostname === "youtu.be") {
		return urlObject.pathname.slice(1) || null;
	}

	if (
		hostname !== "youtube.com" &&
		hostname !== "m.youtube.com" &&
		hostname !== "music.youtube.com"
	) {
		return null;
	}

	// /shorts/<id>, /embed/<id> 형태도 지원한다.
	const pathMatch = /^\/(?:shorts|embed|live)\/([^/?]+)/.exec(
		urlObject.pathname
	);
	if (pathMatch?.[1]) {
		return pathMatch[1];
	}

	return urlObject.searchParams.get("v");
};

const readErrorMessage = (data: unknown, fallback: string): string => {
	if (typeof data === "object" && data !== null) {
		const { error, status } = data as VideoInfoErrorResponse;
		if (typeof error === "string" && error.length > 0) {
			return status === undefined ? error : `${error} (status ${status})`;
		}
		const { detail } = data as { detail?: string };
		if (typeof detail === "string" && detail.length > 0) {
			return detail;
		}
	}
	return fallback;
};

const parseFilename = (
	contentDisposition: string | undefined,
	fallback: string
): string => {
	if (!contentDisposition) return fallback;

	const encodedMatch =
		/filename\*?=['"]?(?:UTF-\d['"]*)?([^;\r\n"']*)['"]?;?/i.exec(
			contentDisposition
		);
	if (encodedMatch?.[1]) {
		return decodeURIComponent(encodedMatch[1]);
	}

	const plainMatch = /filename=['"]?([^;\r\n"']*)['"]?;?/i.exec(
		contentDisposition
	);
	return plainMatch?.[1] ?? fallback;
};

export const YoutubeDownloader = (): FunctionComponent => {
	const { t } = useTranslation();
	// 현재 모드는 URL(?info=tags)에서 읽는다. 새로고침이나 링크 공유에도 유지된다.
	const { info } = useSearch({ from: "/youtube-downloader" });
	const isTagMode = info === "tags";

	const [videoInfo, setVideoInfo] = useState<YouTubeVideoInfo | null>(null);
	const [url, setUrl] = useState<string>("");
	const [resolution, setResolution] = useState<AllowResolution | null>(null);
	const [format] = useState<YouTubeDownloadFormat>("mp4");
	const { processLoading, setProcessLoading } = useProcessLoadingStore();
	const [error, setError] = useState<string | null>(null);
	const [downloadProgress, setDownloadProgress] =
		useState<DownloadProgress | null>(null);
	const [myTags, setMyTags] = useState<Array<string>>([]);
	const clientId = useRef(uuid());

	const title = isTagMode ? "TAG EXPLORER" : "VIDEO DOWNLOADER";
	const allowResolutions = videoInfo?.allowResolutions ?? [];

	useEffect(() => {
		// 다운로드 백엔드가 설정되지 않은 환경(예: 배포)에서는 연결을 시도하지 않는다.
		// 예전 코드는 localhost로 접속을 시도해 콘솔이 에러로 가득 찼다.
		if (!isDownloadApiConfigured) return;

		const websocket = new WebSocket(
			downloadProgressWebSocketUrl(clientId.current)
		);

		websocket.onmessage = (event: MessageEvent): void => {
			try {
				const data = JSON.parse(event.data as string) as DownloadProgress;
				setDownloadProgress(data);
			} catch {
				// 진행률 메시지는 실패해도 다운로드 자체에는 영향이 없다.
			}
		};

		return (): void => {
			if (
				websocket.readyState === WebSocket.OPEN ||
				websocket.readyState === WebSocket.CONNECTING
			) {
				websocket.close();
			}
		};
	}, []);

	// 모드가 바뀌면 이전 조회 결과를 남기지 않는다.
	useEffect(() => {
		setVideoInfo(null);
		setResolution(null);
		setError(null);
		setDownloadProgress(null);
	}, [isTagMode]);

	const videoDownload = async (): Promise<void> => {
		if (!isDownloadApiConfigured) {
			toast.error(t("youtube.notConfigured"));
			return;
		}

		setProcessLoading(true);
		setError(null);

		try {
			const response: AxiosResponse<Blob> = await axios.post(
				videoDownloadUrl(clientId.current),
				{
					url,
					resolution: resolution?.resolution,
					format,
				} satisfies Partial<YouTubeDownloadRequest>,
				{
					responseType: "blob",
					headers: { "Content-Type": "application/json" },
				}
			);

			const filename = parseFilename(
				response.headers["content-disposition"] as string | undefined,
				`video.${format}`
			);

			const downloadUrl = window.URL.createObjectURL(response.data);
			const link = document.createElement("a");
			link.href = downloadUrl;
			link.download = filename;
			document.body.append(link);
			link.click();
			link.remove();
			window.URL.revokeObjectURL(downloadUrl);
		} catch (caughtError) {
			console.error(caughtError);
			const message = axios.isAxiosError(caughtError)
				? readErrorMessage(caughtError.response?.data, caughtError.message)
				: t("youtube.unexpected");
			setError(message);
			toast.error(message);
		} finally {
			setProcessLoading(false);
			setDownloadProgress(null);
		}
	};

	const getVideoInfo = async (
		event: React.FormEvent<HTMLFormElement>
	): Promise<void> => {
		event.preventDefault();
		setError(null);

		const videoId = getYoutubeVideoId(url);
		if (!videoId) {
			toast.error(t("youtube.invalidUrl"));
			return;
		}

		setProcessLoading(true);

		try {
			const response: AxiosResponse<
				ResponseYouTubeVideoInfoWithAllowResolutions | VideoInfoErrorResponse
			> = await axios.get(videoInfoUrl(videoId), {
				headers: { "Content-Type": "application/json" },
			});

			const data = response.data;
			const videoDetails =
				"info" in data && data.info !== undefined ? data.info : null;

			// 서버가 200으로 에러 본문을 돌려주는 경우까지 여기서 걸러낸다.
			if (!videoDetails) {
				const message = readErrorMessage(data, t("youtube.failedInfo"));
				setError(message);
				toast.error(message);
				return;
			}

			const resolutions =
				("allow_resolutions" in data ? data.allow_resolutions : null) ?? [];

			if (!isTagMode && resolutions.length === 0) {
				const message = "Unable to download this video";
				setError(message);
				toast.error(message);
				return;
			}

			setResolution(
				resolutions.find((item) => item.is_audio) ?? resolutions[0] ?? null
			);

			setVideoInfo({
				title: videoDetails.title,
				durationString: videoDetails.duration_string,
				thumbnail: videoDetails.thumbnail,
				tags: videoDetails.tags ?? [],
				allowResolutions: resolutions,
			});
		} catch (caughtError) {
			console.error(caughtError);
			const message = axios.isAxiosError(caughtError)
				? readErrorMessage(caughtError.response?.data, caughtError.message)
				: "Failed to get video info";
			setError(message);
			toast.error(message);
		} finally {
			setProcessLoading(false);
		}
	};

	const copyTags = async (): Promise<void> => {
		const videoTags = videoInfo?.tags ?? [];
		if (videoTags.length === 0) return;

		setMyTags((previousTags) => [
			...previousTags,
			...videoTags.filter((tag) => !previousTags.includes(tag)),
		]);
		await navigator.clipboard.writeText(videoTags.join(","));
		toast.success(t("common.copied"));
	};

	const copyMyTags = async (): Promise<void> => {
		if (myTags.length === 0) return;
		await navigator.clipboard.writeText(myTags.join(","));
		toast.success(t("common.copied"));
	};

	const tagHandler = (tag: string): void => {
		setMyTags((previousTags) =>
			previousTags.includes(tag)
				? previousTags.filter((previousTag) => previousTag !== tag)
				: [...previousTags, tag]
		);
	};

	return (
		<Content categoryName={t("youtube.category")} title={title}>
			<MainSearchParameterForm
				parameter={isTagMode ? "tags" : ""}
				onSubmit={getVideoInfo}
			>
				<div className="w-full h-full">
					<MainInput
						id="url"
						placeholder={t("youtube.urlPlaceholder")}
						setValue={setUrl}
						value={url}
					/>
				</div>
			</MainSearchParameterForm>

			{error && (
				<div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
					{error}
				</div>
			)}

			{!isTagMode && !isDownloadApiConfigured && (
				<div className="text-neutral-15 text-sm">
					Videos that provide a direct link can be downloaded. Other qualities
					need the download server, which is not configured in this environment.
				</div>
			)}

			{myTags.length > 0 && isTagMode && (
				<div className="flex flex-col gap-4 border border-neutral-05 rounded-2xl py-6 px-8">
					<div className="flex gap-3 items-center">
						<div className="text-neutral-05 font-medium text-2xl">
							{t("youtube.myTags")}
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
					<div className="flex gap-8">
						<div className="w-1/2 rounded-2xl overflow-hidden">
							<img
								alt={videoInfo.title}
								className="w-full rounded-2xl object-cover"
								src={videoInfo.thumbnail}
							/>
						</div>
						<div className="flex flex-col gap-8 w-1/2 ">
							<div className="flex flex-col justify-between h-full p-6 rounded-2xl bg-main-00 border border-neutral-05 ">
								<div className="flex flex-col h-full gap-3">
									<div className="font-medium text-neutral-05 text-ellipsis overflow-hidden whitespace-nowrap">
										{videoInfo.title}
									</div>
									<div className="text-sm text-neutral-10 font-medium text-right">
										{videoInfo.durationString}
									</div>
								</div>

								{!isTagMode && (
									<YoutubeDownloadButton
										allowResolutions={allowResolutions}
										format={format}
										isLoading={processLoading}
										resolution={resolution}
										setResolution={setResolution}
										videoDownload={videoDownload}
									/>
								)}
							</div>

							{isTagMode && (
								<div className="flex flex-col gap-8">
									<div className="flex gap-3 items-center">
										{videoInfo.tags.length > 0 ? (
											<>
												<div className="text-neutral-05 font-medium">
													{t("youtube.tags")}
												</div>
												<CopyIcon iconSize="18" onClick={copyTags} />
											</>
										) : (
											<div className="text-neutral-05 font-medium">
												{t("youtube.noTags")}
											</div>
										)}
									</div>
									<div className="flex flex-wrap gap-4">
										{videoInfo.tags.map((tag) => (
											<TAG
												key={tag}
												tag={tag}
												textColorClass="text-main-05"
												textSizeClass="text-md"
												backgroundColorClass={`${
													myTags.includes(tag) ? "bg-green-05" : "bg-neutral-05"
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

					{!isTagMode && downloadProgress && (
						<div className="flex flex-col gap-2">
							<div className="w-full h-3 bg-main-05 rounded-full overflow-hidden">
								<div
									className="h-full bg-green-05 transition-all duration-200"
									style={{ width: `${downloadProgress.progress}%` }}
								></div>
							</div>
							<div className="text-neutral-15 text-sm text-right">
								{downloadProgress.phase} · {downloadProgress.progress}%
								{downloadProgress.speed > 0 &&
									` · ${downloadProgress.speed} MB/s`}
							</div>
						</div>
					)}
				</div>
			)}
		</Content>
	);
};
