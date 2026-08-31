export type UuidVersion = "v4" | "v7";
export type UuidFormat = "plain" | "upper" | "braces" | "compact";

const randomBytes = (length: number): Uint8Array => {
	const bytes = new Uint8Array(length);
	globalThis.crypto.getRandomValues(bytes);
	return bytes;
};

const format = (hex: string): string =>
	`${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;

const toHex = (bytes: Uint8Array): string =>
	[...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("");

/** 완전 무작위 UUID. 브라우저가 지원하면 내장 구현을 쓴다. */
const createV4 = (): string =>
	globalThis.crypto.randomUUID
		? globalThis.crypto.randomUUID()
		: ((): string => {
				const bytes = randomBytes(16);
				// 버전(4)과 변형(10xx) 비트를 규격대로 채운다.
				bytes[6] = ((bytes[6] ?? 0) & 0x0f) | 0x40;
				bytes[8] = ((bytes[8] ?? 0) & 0x3f) | 0x80;
				return format(toHex(bytes));
			})();

// 같은 밀리초 안에서 만들어진 값들의 순서를 지키는 카운터.
// rand_a(12비트)를 카운터로 쓰는 것은 UUIDv7 규격이 권하는 방식이다.
let lastTimestamp = 0;
let counter = 0;
const COUNTER_LIMIT = 0x1000;

/**
 * 앞 48비트가 밀리초 시각이라 만든 순서대로 정렬되는 UUID.
 * 데이터베이스 기본 키로 쓰면 인덱스가 덜 흩어진다.
 * 시각이 같은 값들끼리도 순서가 유지되도록 그 뒤 12비트를 카운터로 쓴다.
 */
const createV7 = (now: number): string => {
	// 시계가 뒤로 갔거나 카운터가 넘쳐 시각을 미리 당겨둔 상태라면
	// 앞서 낸 값보다 작아지지 않도록 큰 쪽을 쓴다.
	const timestamp_ = Math.max(now, lastTimestamp);

	if (timestamp_ === lastTimestamp) {
		counter++;
		// 1밀리초에 4096개를 넘기면 시각을 하나 당겨 순서를 이어간다.
		if (counter >= COUNTER_LIMIT) {
			lastTimestamp++;
			counter = 0;
		}
	} else {
		lastTimestamp = timestamp_;
		counter = 0;
	}

	const bytes = randomBytes(16);
	const timestamp = BigInt(lastTimestamp);
	for (let index = 0; index < 6; index++) {
		bytes[index] = Number((timestamp >> BigInt(8 * (5 - index))) & 0xffn);
	}

	// 버전(7) + rand_a 상위 4비트, 그리고 rand_a 하위 8비트.
	bytes[6] = 0x70 | ((counter >> 8) & 0x0f);
	bytes[7] = counter & 0xff;
	// 변형(10xx) 비트.
	bytes[8] = ((bytes[8] ?? 0) & 0x3f) | 0x80;
	return format(toHex(bytes));
};

const applyFormat = (uuid: string, style: UuidFormat): string => {
	if (style === "upper") return uuid.toUpperCase();
	if (style === "braces") return `{${uuid}}`;
	if (style === "compact") return uuid.replace(/-/g, "");
	return uuid;
};

export const generateUuids = (
	count: number,
	version: UuidVersion,
	style: UuidFormat
): Array<string> => {
	const now = Date.now();
	return Array.from({ length: count }, () =>
		applyFormat(version === "v4" ? createV4() : createV7(now), style)
	);
};

const UUID_PATTERN =
	/^[\da-f]{8}-[\da-f]{4}-([1-8])[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/i;

/** 붙여넣은 값이 규격에 맞는지, 몇 번 버전인지 알려준다. */
export const inspectUuid = (
	value: string
): { valid: boolean; version: number | null } => {
	const cleaned = value
		.trim()
		.replace(/^\{|\}$/g, "")
		.toLowerCase();
	const match = UUID_PATTERN.exec(cleaned);
	return match
		? { valid: true, version: Number(match[1]) }
		: { valid: false, version: null };
};
