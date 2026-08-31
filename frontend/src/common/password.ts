export interface PasswordOptions {
	length: number;
	lowercase: boolean;
	uppercase: boolean;
	digits: boolean;
	symbols: boolean;
	/** 0/O, 1/l/I처럼 눈으로 헷갈리는 글자를 뺀다. */
	avoidAmbiguous: boolean;
}

const SETS = {
	lowercase: "abcdefghijklmnopqrstuvwxyz",
	uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
	digits: "0123456789",
	symbols: "!@#$%^&*()-_=+[]{};:,.?/",
};

// 손으로 옮겨 적을 때 틀리기 쉬운 글자들.
const AMBIGUOUS = new Set("0O1lI|`'\"{}[]()/\\");

export const buildAlphabet = (options: PasswordOptions): string => {
	let alphabet = "";
	if (options.lowercase) alphabet += SETS.lowercase;
	if (options.uppercase) alphabet += SETS.uppercase;
	if (options.digits) alphabet += SETS.digits;
	if (options.symbols) alphabet += SETS.symbols;

	if (options.avoidAmbiguous) {
		alphabet = [...alphabet]
			.filter((letter) => !AMBIGUOUS.has(letter))
			.join("");
	}
	return alphabet;
};

/**
 * 범위 안의 정수를 치우침 없이 고른다.
 * 난수를 그냥 나머지 연산하면 앞쪽 글자가 조금 더 자주 뽑힌다.
 * 남는 구간에 걸린 값은 버리고 다시 뽑는다.
 */
const randomBelow = (limit: number): number => {
	const ceiling = Math.floor(0x1_00_00_00_00 / limit) * limit;
	const buffer = new Uint32Array(1);
	let value = 0;
	do {
		globalThis.crypto.getRandomValues(buffer);
		value = buffer[0] ?? 0;
	} while (value >= ceiling);
	return value % limit;
};

export const generatePassword = (options: PasswordOptions): string => {
	const alphabet = buildAlphabet(options);
	if (alphabet.length === 0) {
		throw new Error("Pick at least one kind of character");
	}
	if (options.length < 1) {
		throw new Error("The length has to be at least 1");
	}

	const letters = [...alphabet];
	return Array.from(
		{ length: options.length },
		() => letters[randomBelow(letters.length)] ?? ""
	).join("");
};

export type Strength = "weak" | "fair" | "strong" | "excellent";

export interface StrengthReport {
	/** 이 설정으로 만들 수 있는 경우의 수를 비트로 나타낸 값 */
	bits: number;
	level: Strength;
}

/**
 * 얼마나 추측하기 어려운지를 비트로 잰다.
 * 글자 종류가 많을수록, 길수록 커진다. 사전에 있는 단어인지는 보지 않는다.
 */
export const estimateStrength = (options: PasswordOptions): StrengthReport => {
	const alphabet = buildAlphabet(options);
	const bits =
		alphabet.length === 0
			? 0
			: Math.round(options.length * Math.log2(alphabet.length));

	const level: Strength =
		bits >= 128
			? "excellent"
			: bits >= 80
				? "strong"
				: bits >= 60
					? "fair"
					: "weak";

	return { bits, level };
};
