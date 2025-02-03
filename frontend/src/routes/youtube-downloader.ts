import { createFileRoute } from "@tanstack/react-router";
import { YoutubeDownloader } from "../pages/YoutubeDownloader";

export const Route = createFileRoute("/youtube-downloader")({
	component: YoutubeDownloader,
});
