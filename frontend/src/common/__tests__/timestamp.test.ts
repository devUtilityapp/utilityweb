import { describe, expect, it } from "vitest";
import { describeTimestamp, guessUnit, parseTimestamp } from "../timestamp";

describe("guessUnit", () => {
	it("열 자리는 초로 본다", () => {
		expect(guessUnit("1767225600")).toBe("seconds");
	});

	it("열세 자리는 밀리초로 본다", () => {
		expect(guessUnit("1767225600000")).toBe("milliseconds");
	});
});

describe("parseTimestamp", () => {
	it("초를 시각으로 바꾼다", () => {
		expect(parseTimestamp("0", "seconds")?.toISOString()).toBe(
			"1970-01-01T00:00:00.000Z"
		);
	});

	it("밀리초를 시각으로 바꾼다", () => {
		expect(parseTimestamp("1000", "milliseconds")?.toISOString()).toBe(
			"1970-01-01T00:00:01.000Z"
		);
	});

	it("음수는 1970년 이전을 가리킨다", () => {
		expect(parseTimestamp("-86400", "seconds")?.toISOString()).toBe(
			"1969-12-31T00:00:00.000Z"
		);
	});

	it("숫자가 아니면 null이다", () => {
		expect(parseTimestamp("abc", "seconds")).toBeNull();
		expect(parseTimestamp("", "seconds")).toBeNull();
		expect(parseTimestamp("12.5", "seconds")).toBeNull();
	});
});

describe("describeTimestamp", () => {
	const moment = new Date("2026-01-01T00:00:00.000Z");

	it("여러 표기를 함께 준다", () => {
		const view = describeTimestamp(moment, moment.getTime());
		expect(view.seconds).toBe(1767225600);
		expect(view.milliseconds).toBe(1767225600000);
		expect(view.iso).toBe("2026-01-01T00:00:00.000Z");
	});

	it("지금과의 거리를 알맞은 단위로 적는다", () => {
		const now = moment.getTime();
		expect(describeTimestamp(new Date(now - 3600_000), now).relative).toEqual({
			amount: -1,
			unit: "hour",
		});
		expect(
			describeTimestamp(new Date(now + 86_400_000 * 3), now).relative
		).toEqual({
			amount: 3,
			unit: "day",
		});
	});
});
