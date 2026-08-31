import { describe, expect, it } from "vitest";
import { buildAlphabet, estimateStrength, generatePassword } from "../password";

const base = {
	length: 16,
	lowercase: true,
	uppercase: true,
	digits: true,
	symbols: false,
	avoidAmbiguous: false,
};

describe("generatePassword", () => {
	it("정한 길이만큼 만든다", () => {
		expect(generatePassword({ ...base, length: 24 })).toHaveLength(24);
	});

	it("고른 종류의 글자만 쓴다", () => {
		const value = generatePassword({
			...base,
			uppercase: false,
			digits: false,
		});
		expect(value).toMatch(/^[a-z]+$/);
	});

	it("헷갈리는 글자를 뺀다", () => {
		const value = generatePassword({
			...base,
			length: 200,
			avoidAmbiguous: true,
		});
		expect(value).not.toMatch(/[0O1lI]/);
	});

	it("매번 다른 값을 만든다", () => {
		const values = new Set(
			Array.from({ length: 50 }, () => generatePassword(base))
		);
		expect(values.size).toBe(50);
	});

	it("아무 종류도 고르지 않으면 거절한다", () => {
		expect(() =>
			generatePassword({
				...base,
				lowercase: false,
				uppercase: false,
				digits: false,
				symbols: false,
			})
		).toThrow(/at least one/);
	});

	it("길이가 0이면 거절한다", () => {
		expect(() => generatePassword({ ...base, length: 0 })).toThrow(
			/at least 1/
		);
	});
});

describe("buildAlphabet", () => {
	it("고른 종류를 합친다", () => {
		expect(buildAlphabet({ ...base, symbols: false })).toHaveLength(62);
	});
});

describe("estimateStrength", () => {
	it("길수록 비트가 커진다", () => {
		const short = estimateStrength({ ...base, length: 8 });
		const long = estimateStrength({ ...base, length: 32 });
		expect(long.bits).toBeGreaterThan(short.bits);
	});

	it("등급을 나눈다", () => {
		expect(estimateStrength({ ...base, length: 6 }).level).toBe("weak");
		expect(estimateStrength({ ...base, length: 32 }).level).toBe("excellent");
	});
});
