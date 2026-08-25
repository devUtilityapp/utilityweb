import { createFileRoute, redirect } from "@tanstack/react-router";
import { YoutubeDownloader } from "../pages/YoutubeDownloader/YoutubeDownloader";
import { isYoutubeToolEnabled } from "../common/features";

export interface YoutubeDownloaderSearch {
	info?: "tags";
}

export const Route = createFileRoute("/youtube-downloader")({
	// 숨겨진 동안에는 주소를 직접 입력해도 들어올 수 없다.
	beforeLoad: (): void => {
		if (!isYoutubeToolEnabled) {
			// TanStack Router는 redirect 객체를 throw하는 방식으로 이동시킨다.
			// eslint-disable-next-line @typescript-eslint/only-throw-error
			throw redirect({ to: "/tools" });
		}
	},
	validateSearch: (
		search: Record<string, unknown>
	): YoutubeDownloaderSearch => ({
		info: search["info"] === "tags" ? "tags" : undefined,
	}),
	component: YoutubeDownloader,
});
