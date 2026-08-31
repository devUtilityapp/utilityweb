import { describe, expect, it } from "vitest";
import { parsePageRanges } from "../pdfEdit";

describe("parsePageRanges", () => {
	it("낱장과 범위를 섞어 읽는다", () => {
		expect(parsePageRanges("1-2, 5", 10)).toEqual([0, 1, 4]);
	});

	it("끝을 비우면 마지막 쪽까지로 본다", () => {
		expect(parsePageRanges("8-", 10)).toEqual([7, 8, 9]);
	});

	it("겹쳐 적어도 한 번만 담는다", () => {
		expect(parsePageRanges("1,1-3,2", 5)).toEqual([0, 1, 2]);
	});

	it("적은 순서를 그대로 지킨다", () => {
		expect(parsePageRanges("3,1", 5)).toEqual([2, 0]);
	});

	it("문서 밖의 쪽은 거절한다", () => {
		expect(() => parsePageRanges("11", 10)).toThrow(/outside/);
	});

	it("거꾸로 된 범위는 거절한다", () => {
		expect(() => parsePageRanges("5-2", 10)).toThrow(/starts after/);
	});

	it("빈 입력은 거절한다", () => {
		expect(() => parsePageRanges("  ,  ", 10)).toThrow(/at least one/);
	});
});
