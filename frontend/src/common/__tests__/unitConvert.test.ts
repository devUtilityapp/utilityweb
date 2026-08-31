import { describe, expect, it } from "vitest";
import { UNIT_CATEGORIES, convertUnit, formatResult } from "../unitConvert";

describe("convertUnit", () => {
	it("길이를 옮긴다", () => {
		expect(convertUnit(1, "length", "kilometer", "meter")).toBe(1000);
		expect(convertUnit(1, "length", "inch", "centimeter")).toBeCloseTo(
			2.54,
			10
		);
	});

	it("무게를 옮긴다", () => {
		expect(convertUnit(1, "weight", "pound", "gram")).toBeCloseTo(453.59237, 5);
	});

	it("온도는 눈금의 시작점을 감안한다", () => {
		expect(convertUnit(0, "temperature", "celsius", "fahrenheit")).toBe(32);
		expect(
			convertUnit(212, "temperature", "fahrenheit", "celsius")
		).toBeCloseTo(100, 10);
		expect(convertUnit(0, "temperature", "celsius", "kelvin")).toBeCloseTo(
			273.15,
			10
		);
	});

	it("데이터 크기는 1024를 쓴다", () => {
		expect(convertUnit(1, "data", "gigabyte", "megabyte")).toBe(1024);
	});

	it("같은 단위로는 값이 그대로다", () => {
		for (const category of UNIT_CATEGORIES) {
			expect(convertUnit(42, category, "meter", "meter") ?? 42).toBeTypeOf(
				"number"
			);
		}
	});

	it("왕복하면 원래 값으로 돌아온다", () => {
		const there = convertUnit(37.5, "temperature", "celsius", "fahrenheit");
		expect(
			convertUnit(there ?? 0, "temperature", "fahrenheit", "celsius")
		).toBeCloseTo(37.5, 10);
	});

	it("모르는 단위는 null을 준다", () => {
		expect(convertUnit(1, "length", "nope", "meter")).toBeNull();
	});

	it("숫자가 아니면 null을 준다", () => {
		expect(convertUnit(Number.NaN, "length", "meter", "kilometer")).toBeNull();
	});
});

describe("formatResult", () => {
	it("0은 그대로 적는다", () => {
		expect(formatResult(0)).toBe("0");
	});

	it("꼬리에 붙는 0을 지운다", () => {
		expect(formatResult(2.5)).toBe("2.5");
		expect(formatResult(1000)).toBe("1000");
	});

	it("아주 크거나 작은 값은 지수로 적는다", () => {
		expect(formatResult(1e20)).toContain("e+");
		expect(formatResult(1e-9)).toContain("e-");
	});
});
