import { describe, expect, it } from "vitest";
import { replaceAll, runRegex, splitByMatches } from "../regexTest";

describe("runRegex", () => {
	it("모두 찾는다", () => {
		const result = runRegex("\\d+", "", "a1 b22 c333");
		expect(result.matches.map((match) => match.text)).toEqual([
			"1",
			"22",
			"333",
		]);
		expect(result.error).toBeNull();
	});

	it("g가 없어도 전부 찾는다", () => {
		expect(runRegex("a", "", "aaa").matches).toHaveLength(3);
	});

	it("괄호로 잡은 부분을 준다", () => {
		const [match] = runRegex("(\\w+)@(\\w+)", "", "me@example").matches;
		expect(match?.groups).toEqual(["me", "example"]);
	});

	it("이름 붙인 그룹을 준다", () => {
		const [match] = runRegex("(?<year>\\d{4})", "", "2026").matches;
		expect(match?.named).toEqual({ year: "2026" });
	});

	it("플래그를 지킨다", () => {
		expect(runRegex("ABC", "i", "abc").matches).toHaveLength(1);
		expect(runRegex("ABC", "", "abc").matches).toHaveLength(0);
	});

	it("잘못된 식은 오류를 알린다", () => {
		const result = runRegex("(", "", "x");
		expect(result.error).not.toBeNull();
		expect(result.matches).toHaveLength(0);
	});

	it("빈 식은 아무것도 찾지 않는다", () => {
		expect(runRegex("", "", "x")).toEqual({
			matches: [],
			truncated: false,
			error: null,
		});
	});

	it("너무 긴 글은 거절한다", () => {
		const result = runRegex("a", "", "x".repeat(200_001));
		expect(result.error).toMatch(/longer than/);
	});

	it("결과가 아주 많으면 잘라내고 알린다", () => {
		const result = runRegex("a", "", "a".repeat(2000));
		expect(result.truncated).toBe(true);
		expect(result.matches).toHaveLength(1000);
	});
});

describe("splitByMatches", () => {
	it("찾은 자리를 표시할 수 있게 나눈다", () => {
		const { matches } = runRegex("\\d+", "", "a1b22c");
		expect(splitByMatches("a1b22c", matches)).toEqual([
			{ text: "a", matched: false },
			{ text: "1", matched: true },
			{ text: "b", matched: false },
			{ text: "22", matched: true },
			{ text: "c", matched: false },
		]);
	});

	it("아무것도 못 찾으면 통째로 준다", () => {
		expect(splitByMatches("abc", [])).toEqual([
			{ text: "abc", matched: false },
		]);
	});
});

describe("replaceAll", () => {
	it("잡은 부분을 참조해 바꾼다", () => {
		expect(replaceAll("(\\w+)@(\\w+)", "", "me@example", "$2/$1")).toBe(
			"example/me"
		);
	});

	it("잘못된 식은 null을 준다", () => {
		expect(replaceAll("(", "", "x", "y")).toBeNull();
	});
});
