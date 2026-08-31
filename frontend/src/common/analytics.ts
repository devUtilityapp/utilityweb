import { isProduction } from "./utils";

const BEACON_URL = "https://static.cloudflareinsights.com/beacon.min.js";

/**
 * 방문 통계를 붙인다.
 *
 * Cloudflare Web Analytics는 쿠키를 심지 않고 방문자를 개인 단위로 따라가지도
 * 않는다. 파일을 올리지 않는다고 적어 둔 사이트가 방문자는 추적한다면
 * 앞뒤가 맞지 않으므로, 개인 식별이 없는 쪽을 골랐다.
 *
 * 토큰이 없으면 아무 스크립트도 싣지 않는다. 개발 중에는 항상 그렇다.
 */
export const startAnalytics = (): void => {
	const token = import.meta.env.VITE_CF_BEACON_TOKEN;
	if (!isProduction || !token) return;

	const script = document.createElement("script");
	script.defer = true;
	script.src = BEACON_URL;
	script.dataset["cfBeacon"] = JSON.stringify({ token });
	document.head.append(script);
};
