// TypeScript IntelliSense for VITE_ .env variables.
// VITE_ prefixed variables are exposed to the client while non-VITE_ variables aren't
// https://vitejs.dev/guide/env-and-mode.html

/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly VITE_APP_TITLE: string;
	/** "development"이면 로컬 에뮬레이터/백엔드를 사용한다. */
	readonly VITE_APP_ENVIRONMENT?: string;
	/** 영상 정보 조회 엔드포인트. 없으면 배포된 Cloud Function을 사용한다. */
	readonly VITE_VIDEO_INFO_URL?: string;
	/** 영상 다운로드 백엔드 주소(예: https://api.example.com). 없으면 기능 비활성화. */
	readonly VITE_DOWNLOAD_API_BASE_URL?: string;
	/** "true"면 YouTube 도구(다운로더/태그 탐색기)를 노출한다. */
	readonly VITE_ENABLE_YOUTUBE_TOOL?: string;
	// more env variables...
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
