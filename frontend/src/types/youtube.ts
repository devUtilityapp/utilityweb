// YouTube 관련 타입 정의
export type YouTubeDownloadRequest = {
	url: string;
	resolution: "360p" | "480p" | "720p" | "1080p";
	format: "mp4";
};
