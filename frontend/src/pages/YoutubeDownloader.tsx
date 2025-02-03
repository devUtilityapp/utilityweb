import { useState } from "react";
import type { FunctionComponent } from "../common/types";

export const YoutubeDownloader = (): FunctionComponent => {
	const [url, setUrl] = useState<string>("");
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);

	const handleSubmit = async (
		event: React.FormEvent<HTMLFormElement>
	): Promise<void> => {
		event.preventDefault();
		setIsLoading(true);
		setError(null);

		try {
			const response = await fetch(
				"http://localhost:8000/api/v1/youtube-download",
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						url: url,
						resolution: "360p", // 기본 해상도 설정
						format: "mp4", // 기본 포맷 설정
					}),
				}
			);

			if (!response.ok) {
				throw new Error("Download failed");
			}

			// 파일 다운로드 처리
			const blob = await response.blob();
			const downloadUrl = window.URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = downloadUrl;
			link.download = "video.mp4"; // 또는 서버에서 제공하는 파일명 사용
			document.body.appendChild(link);
			link.click();
			link.remove();
			window.URL.revokeObjectURL(downloadUrl);
		} catch (error_) {
			setError(error_ instanceof Error ? error_.message : "An error occurred");
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
