import { createFileRoute } from "@tanstack/react-router";
import { YoutubeDownloader } from "../pages/YoutubeDownloader/YoutubeDownloader";

export interface YoutubeDownloaderSearch {
	info?: "tags";
}

export const Route = createFileRoute("/youtube-downloader")({
	validateSearch: (
		search: Record<string, unknown>
	): YoutubeDownloaderSearch => ({
		info: search["info"] === "tags" ? "tags" : undefined,
	}),
	component: YoutubeDownloader,
});
