import { describe, expect, it } from "vitest";
import { analyzeText, formatDuration } from "../textStats";

describe("analyzeText", () => {
	it("낱말, 글자, 문장, 문단을 센다", () => {
		const stats = analyzeText(
			"Hello world. This is a test!\n\nSecond paragraph."
		);
		expect(stats.words).toBe(8);
		expect(stats.sentences).toBe(3);
		expect(stats.paragraphs).toBe(2);
	});

	it("공백을 뺀 글자 수를 따로 센다", () => {
		const stats = analyzeText("a b c");
		expect([stats.characters, stats.charactersNoSpaces]).toEqual([5, 3]);
	});

	it("이모지를 한 글자로 센다", () => {
		expect(analyzeText("a👍b").characters).toBe(3);
	});

	it("빈 글은 모두 0이다", () => {
		const stats = analyzeText("");
		expect([stats.words, stats.characters, stats.sentences]).toEqual([0, 0, 0]);
	});

	it("자주 쓴 낱말을 많은 순으로 준다", () => {
		const stats = analyzeText("the dog and the cat and the bird");
		expect(stats.topWords[0]).toEqual({ word: "the", count: 3 });
	});
});

describe("formatDuration", () => {
	it("분과 초를 사람이 읽는 대로 적는다", () => {
		expect([
			formatDuration(45),
			formatDuration(60),
			formatDuration(125),
		]).toEqual(["45s", "1m", "2m 5s"]);
	});
});
