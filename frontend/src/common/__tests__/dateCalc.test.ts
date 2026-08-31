import { describe, expect, it } from "vitest";
import {
	differenceBetween,
	parseDate,
	shiftDate,
	toDateInput,
} from "../dateCalc";

const day = (text: string): Date => parseDate(text) as Date;

describe("differenceBetween", () => {
	it("전체 일수를 센다", () => {
		expect(differenceBetween(day("2026-01-01"), day("2026-01-31")).days).toBe(
			30
		);
	});

	it("년·월·남은 일수로 나눈다", () => {
		const result = differenceBetween(day("2024-03-15"), day("2026-05-20"));
		expect([result.years, result.months, result.restDays]).toEqual([2, 2, 5]);
	});

	it("달을 넘길 때 직전 달의 길이를 빌려 온다", () => {
		const result = differenceBetween(day("2026-01-31"), day("2026-03-01"));
		expect([result.years, result.months]).toEqual([0, 1]);
	});

	it("순서를 바꿔도 같은 값이 나온다", () => {
		const forward = differenceBetween(day("2026-01-01"), day("2026-06-15"));
		const backward = differenceBetween(day("2026-06-15"), day("2026-01-01"));
		expect(backward.days).toBe(forward.days);
	});

	it("주말을 뺀 날을 센다", () => {
		// 2026-01-05는 월요일. 그 주 월~금이면 5일이다.
		expect(
			differenceBetween(day("2026-01-05"), day("2026-01-10")).businessDays
		).toBe(5);
	});

	it("같은 날은 0일이다", () => {
		expect(differenceBetween(day("2026-02-10"), day("2026-02-10")).days).toBe(
			0
		);
	});

	it("윤년의 2월을 넘어간다", () => {
		expect(differenceBetween(day("2024-02-28"), day("2024-03-01")).days).toBe(
			2
		);
	});
});

describe("shiftDate", () => {
	it("일·주·월·년 단위로 옮긴다", () => {
		expect(toDateInput(shiftDate(day("2026-01-01"), 10, "days"))).toBe(
			"2026-01-11"
		);
		expect(toDateInput(shiftDate(day("2026-01-01"), 2, "weeks"))).toBe(
			"2026-01-15"
		);
		expect(toDateInput(shiftDate(day("2026-01-31"), 1, "months"))).toBe(
			"2026-03-03"
		);
		expect(toDateInput(shiftDate(day("2026-01-01"), 1, "years"))).toBe(
			"2027-01-01"
		);
	});

	it("음수면 거꾸로 간다", () => {
		expect(toDateInput(shiftDate(day("2026-01-10"), -10, "days"))).toBe(
			"2025-12-31"
		);
	});
});

describe("parseDate", () => {
	it("빈 값과 잘못된 값은 null이다", () => {
		expect(parseDate("")).toBeNull();
		expect(parseDate("nope")).toBeNull();
	});
});
