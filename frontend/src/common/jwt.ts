export interface JwtPart {
	/** 보기 좋게 편 JSON */
	json: string;
	value: Record<string, unknown>;
}

export interface DecodedJwt {
	header: JwtPart;
	payload: JwtPart;
	/** 서명 부분의 원문. 검증에는 열쇠가 있어야 한다. */
	signature: string;
	algorithm: string;
	/** 시각을 담은 표준 클레임을 사람이 읽는 값으로 바꾼 것 */
	times: Array<{ claim: string; date: Date; expired: boolean }>;
	expired: boolean;
}

const decodeSegment = (segment: string): Record<string, unknown> => {
	// JWT는 URL 안전 base64를 쓰고 채움 문자를 뺀다.
	const normalized = segment.replace(/-/g, "+").replace(/_/g, "/");
	const padded = normalized.padEnd(
		normalized.length + ((4 - (normalized.length % 4)) % 4),
		"="
	);

	const binary = atob(padded);
	const bytes = Uint8Array.from(binary, (letter) => letter.codePointAt(0) ?? 0);
	const text = new TextDecoder().decode(bytes);

	const parsed: unknown = JSON.parse(text);
	if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
		throw new TypeError("This part of the token is not a JSON object");
	}
	return parsed as Record<string, unknown>;
};

// 시각을 담는 표준 클레임. 초 단위 유닉스 시각이다.
const TIME_CLAIMS = ["exp", "iat", "nbf", "auth_time", "updated_at"];

export const decodeJwt = (token: string, now: number): DecodedJwt => {
	const parts = token.trim().split(".");
	if (parts.length < 2) {
		throw new Error("A token has three parts separated by dots");
	}

	const [headerPart, payloadPart, signaturePart = ""] = parts;
	let header: Record<string, unknown>;
	let payload: Record<string, unknown>;

	try {
		header = decodeSegment(headerPart ?? "");
	} catch {
		throw new Error("The header could not be read");
	}
	try {
		payload = decodeSegment(payloadPart ?? "");
	} catch {
		throw new Error("The payload could not be read");
	}

	const times = TIME_CLAIMS.filter(
		(claim) => typeof payload[claim] === "number"
	).map((claim) => {
		const seconds = payload[claim] as number;
		const date = new Date(seconds * 1000);
		return { claim, date, expired: claim === "exp" && date.getTime() < now };
	});

	return {
		header: { json: JSON.stringify(header, null, 2), value: header },
		payload: { json: JSON.stringify(payload, null, 2), value: payload },
		signature: signaturePart,
		algorithm: typeof header["alg"] === "string" ? header["alg"] : "unknown",
		times,
		expired: times.some((entry) => entry.expired),
	};
};

const HMAC_HASHES: Record<string, string> = {
	HS256: "SHA-256",
	HS384: "SHA-384",
	HS512: "SHA-512",
};

export const canVerify = (algorithm: string): boolean =>
	algorithm in HMAC_HASHES;

/**
 * HS256 계열 서명을 확인한다.
 * RS/ES 계열은 공개키가 있어야 해서 여기서는 다루지 않는다.
 * 열쇠도 브라우저 밖으로 나가지 않는다.
 */
export const verifyHmac = async (
	token: string,
	secret: string,
	algorithm: string
): Promise<boolean> => {
	const hash = HMAC_HASHES[algorithm];
	if (!hash) throw new Error(`${algorithm} needs a public key to check`);
	if (!globalThis.crypto?.subtle) {
		throw new Error("Checking a signature needs a secure connection (https)");
	}

	const [headerPart, payloadPart, signaturePart] = token.trim().split(".");
	if (!headerPart || !payloadPart || !signaturePart) {
		throw new Error("A token has three parts separated by dots");
	}

	const key = await globalThis.crypto.subtle.importKey(
		"raw",
		new TextEncoder().encode(secret),
		{ name: "HMAC", hash },
		false,
		["sign"]
	);
	const signed = await globalThis.crypto.subtle.sign(
		"HMAC",
		key,
		new TextEncoder().encode(`${headerPart}.${payloadPart}`)
	);

	// 우리가 만든 서명을 토큰과 같은 표기로 바꿔 견준다.
	const bytes = new Uint8Array(signed);
	let binary = "";
	for (const byte of bytes) binary += String.fromCharCode(byte);
	const expected = btoa(binary)
		.replace(/\+/g, "-")
		.replace(/\//g, "_")
		.replace(/=+$/, "");

	return expected === signaturePart;
};
