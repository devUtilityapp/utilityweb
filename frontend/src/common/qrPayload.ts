export type QrContentType = "url" | "text" | "wifi" | "email" | "tel";
export type ErrorCorrection = "L" | "M" | "Q" | "H";

export interface WifiInput {
	ssid: string;
	password: string;
	encryption: "WPA" | "WEP" | "nopass";
	hidden: boolean;
}

/** Wi-Fi QR 규격의 예약 문자는 백슬래시로 막아야 한다. */
const escapeWifi = (value: string): string =>
	value.replace(/([;,":\\])/g, String.raw`\$1`);

export const buildWifiPayload = ({
	ssid,
	password,
	encryption,
	hidden,
}: WifiInput): string =>
	`WIFI:T:${encryption};S:${escapeWifi(ssid)};${
		encryption === "nopass" ? "" : `P:${escapeWifi(password)};`
	}${hidden ? "H:true;" : ""};`;

export const buildEmailPayload = (
	address: string,
	subject: string,
	body: string
): string => {
	const query = [
		subject ? `subject=${encodeURIComponent(subject)}` : "",
		body ? `body=${encodeURIComponent(body)}` : "",
	]
		.filter(Boolean)
		.join("&");
	return `mailto:${address.trim()}${query ? `?${query}` : ""}`;
};

/** 사용자가 스킴을 빼먹어도 링크로 인식되게 https를 붙여준다. */
export const normalizeUrl = (value: string): string => {
	const trimmed = value.trim();
	if (trimmed === "") return "";
	return /^[a-z][\w+.-]*:/i.test(trimmed) ? trimmed : `https://${trimmed}`;
};
