import { useState } from "react";
import type { FunctionComponent } from "../common/types";
import axios, { type AxiosResponse } from "axios";
import type {
	YouTubeDownloadRequest,
	YouTubeDownloadResolution,
} from "../types/youtube";

export const YoutubeDownloader = (): FunctionComponent => {
	const resolutions: Array<YouTubeDownloadResolution> = [
		"360p",
		"480p",
		"720p",
		"1080p",
	];

	const [url, setUrl] = useState<string>("");
	const [resolution, setResolution] =
		useState<YouTubeDownloadResolution>("360p");
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);

	const handleSubmit = async (
		event: React.FormEvent<HTMLFormElement>
	): Promise<void> => {
		event.preventDefault();
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

	return (
		<div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-4">
			<div className="w-full max-w-md">
				<form className="space-y-4" onSubmit={handleSubmit}>
					<div>
						<label
							className="block text-sm font-medium text-gray-700"
							htmlFor="url"
						>
							YouTube URL
						</label>
						<input
							required
							className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
							id="url"
							placeholder="https://www.youtube.com/watch?v=..."
							type="text"
							value={url}
							onChange={(event) => {
								setUrl(event.target.value);
							}}
						/>
						<select
							value={resolution}
							onChange={(event) => {
								setResolution(event.target.value as YouTubeDownloadResolution);
							}}
						>
							{resolutions.map((resolution) => (
								<option key={resolution} value={resolution}>
									{resolution}
								</option>
							))}
						</select>
					</div>

					<button
						disabled={isLoading}
						type="submit"
						className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
              ${
								isLoading
									? "bg-blue-400 cursor-not-allowed"
									: "bg-blue-600 hover:bg-blue-700"
							}`}
					>
						{isLoading ? "Downloading..." : "Download"}
					</button>
				</form>

				{error && (
					<div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
						{error}
					</div>
				)}
			</div>
		</div>
	);
};
