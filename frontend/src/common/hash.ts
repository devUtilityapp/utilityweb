export type HashAlgorithm = "SHA-1" | "SHA-256" | "SHA-384" | "SHA-512";

export const HASH_ALGORITHMS: Array<HashAlgorithm> = [
	"SHA-1",
	"SHA-256",
	"SHA-384",
	"SHA-512",
];

const toHex = (buffer: ArrayBuffer): string =>
	[...new Uint8Array(buffer)]
		.map((byte) => byte.toString(16).padStart(2, "0"))
		.join("");

/**
 * 브라우저에 내장된 WebCrypto로 해시를 만든다.
 * https 또는 localhost에서만 crypto.subtle을 쓸 수 있다.
 */
const digest = async (
	algorithm: HashAlgorithm,
	data: BufferSource
): Promise<string> => {
	if (!globalThis.crypto?.subtle) {
		throw new Error("Hashing needs a secure connection (https)");
	}
	return toHex(await globalThis.crypto.subtle.digest(algorithm, data));
};

export const hashText = async (
	text: string,
	algorithm: HashAlgorithm
): Promise<string> => digest(algorithm, new TextEncoder().encode(text));

export const hashFile = async (
	file: File,
	algorithm: HashAlgorithm
): Promise<string> => digest(algorithm, await file.arrayBuffer());

/** 한 입력에 대해 모든 알고리즘의 해시를 한 번에 구한다. */
export const hashAll = async (
	source: string | File
): Promise<Record<HashAlgorithm, string>> => {
	const data =
		typeof source === "string"
			? new TextEncoder().encode(source)
			: new Uint8Array(await source.arrayBuffer());

	const entries = await Promise.all(
		HASH_ALGORITHMS.map(
			async (algorithm) => [algorithm, await digest(algorithm, data)] as const
		)
	);
	return Object.fromEntries(entries) as Record<HashAlgorithm, string>;
};
