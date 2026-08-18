// YouTube 관련 외부 엔드포인트를 한곳에서 관리한다.
// 주소를 코드에 박아두면 배포 환경에서 localhost로 요청이 나가 실패하므로
// 환경 변수를 먼저 보고, 없으면 기본값을 쓴다.

const isDevelopmentEnvironment =
	import.meta.env.VITE_APP_ENVIRONMENT === "development";

const VIDEO_INFO_URL =
	import.meta.env.VITE_VIDEO_INFO_URL ??
	(isDevelopmentEnvironment
		? "http://127.0.0.1:5001/utility-web-451616/asia-northeast2/get_video_info"
		: "https://get-video-info-amqzqqtshq-dt.a.run.app");

// 직접 다운로드 주소가 없는 화질을 내려주는 자체 백엔드(FastAPI).
// 배포 환경에는 아직 없으므로 값이 없으면 관련 기능을 비활성화한다.
const DOWNLOAD_API_BASE_URL =
	import.meta.env.VITE_DOWNLOAD_API_BASE_URL ??
	(isDevelopmentEnvironment ? "http://localhost:8000" : "");

export const isDownloadApiConfigured = DOWNLOAD_API_BASE_URL !== "";

// 기본 엔드포인트는 ?video_id= 형태를 쓰지만, 경로에 아이디가 들어가는 서버도
// 쓸 수 있게 {videoId} 자리표시자를 지원한다.
// 예: VITE_VIDEO_INFO_URL=https://api.example.com/api/v1/youtube-video/info/{videoId}
export const videoInfoUrl = (videoId: string): string =>
	VIDEO_INFO_URL.includes("{videoId}")
		? VIDEO_INFO_URL.replace("{videoId}", encodeURIComponent(videoId))
		: `${VIDEO_INFO_URL}?video_id=${encodeURIComponent(videoId)}`;

export const videoDownloadUrl = (clientId: string): string =>
	`${DOWNLOAD_API_BASE_URL}/api/v1/youtube-download/${clientId}`;

export const downloadProgressWebSocketUrl = (clientId: string): string =>
	`${DOWNLOAD_API_BASE_URL.replace(/^http/, "ws")}/api/v1/ws/${clientId}`;
