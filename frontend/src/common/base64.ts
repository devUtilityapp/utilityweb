/**
 * 텍스트를 base64로 바꾼다.
 * btoa는 라틴-1만 받으므로 UTF-8 바이트로 먼저 바꾼다.
 */
export const encodeText = (text: string, urlSafe: boolean): string => {
	const bytes = new TextEncoder().encode(text);
	let binary = "";
	for (const byte of bytes) {
		binary += String.fromCharCode(byte);
	}
	const encoded = btoa(binary);
	return urlSafe
		? encoded.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
		: encoded;
};

/** URL-safe 표기와 빠진 패딩을 되돌려 표준 base64로 만든다. */
const normalize = (value: string): string => {
	const cleaned = value
		.trim()
		.replace(/-/g, "+")
		.replace(/_/g, "/")
		.replace(/\s/g, "");
	const remainder = cleaned.length % 4;
	return remainder === 0 ? cleaned : cleaned + "=".repeat(4 - remainder);
};

export const decodeText = (value: string): string => {
	let binary: string;
	try {
		binary = atob(normalize(value));
	} catch {
		throw new Error("This is not valid base64");
	}

	const bytes = Uint8Array.from(
		binary,
		(character) => character.codePointAt(0) ?? 0
	);
	// UTF-8로 해석되지 않으면 원래 텍스트가 아니었다는 뜻이다.
	try {
		return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
	} catch {
		throw new Error(
			"The decoded bytes are not text — use the file mode instead"
		);
	}
};

/** 파일을 data URL 없이 순수 base64 문자열로 바꾼다. */
export const encodeFile = async (
	file: File,
	urlSafe: boolean
): Promise<string> => {
	const bytes = new Uint8Array(await file.arrayBuffer());
	// 한 번에 넘기면 인자 수 제한에 걸리므로 조각내서 이어 붙인다.
	const CHUNK = 0x80_00;
	let binary = "";
	for (let index = 0; index < bytes.length; index += CHUNK) {
		binary += String.fromCharCode(...bytes.subarray(index, index + CHUNK));
	}
	const encoded = btoa(binary);
	return urlSafe
		? encoded.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
		: encoded;
};

/** base64를 다시 바이트로 되돌린다. 파일로 저장할 때 쓴다. */
export const decodeToBytes = (value: string): Uint8Array => {
	try {
		const binary = atob(normalize(value));
		return Uint8Array.from(
			binary,
			(character) => character.codePointAt(0) ?? 0
		);
	} catch {
		throw new Error("This is not valid base64");
	}
};
