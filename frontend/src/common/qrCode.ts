import type { ErrorCorrection } from "./qrPayload";

export interface QrOptions {
	value: string;
	size: number;
	errorCorrection: ErrorCorrection;
}

/** 화면 미리보기와 PNG 저장에 함께 쓰는 data URL. */
export const renderQrDataUrl = async ({
	value,
	size,
	errorCorrection,
}: QrOptions): Promise<string> => {
	const QRCode = await import("qrcode");
	return QRCode.toDataURL(value, {
		width: size,
		margin: 2,
		errorCorrectionLevel: errorCorrection,
		color: { dark: "#000000", light: "#ffffff" },
	});
};

/** 인쇄용. 벡터라 크기를 키워도 흐려지지 않는다. */
export const renderQrSvg = async ({
	value,
	errorCorrection,
}: Omit<QrOptions, "size">): Promise<string> => {
	const QRCode = await import("qrcode");
	return QRCode.toString(value, {
		type: "svg",
		margin: 2,
		errorCorrectionLevel: errorCorrection,
		color: { dark: "#000000", light: "#ffffff" },
	});
};
