// YouTube 정보 API(Cloud Function)가 GCP IP 봇 판정에 막혀 대부분의 영상에서
// 실패하는 동안 관련 페이지를 숨긴다.
// 우회 수단(쿠키/프록시/PO token)이 준비되면 아래 환경 변수로 다시 켤 수 있다.
export const isYoutubeToolEnabled =
	import.meta.env.VITE_ENABLE_YOUTUBE_TOOL === "true";
