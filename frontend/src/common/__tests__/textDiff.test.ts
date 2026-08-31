import { describe, expect, it } from "vitest";
import { collapseUnchanged, diffLines } from "../textDiff";

const plain = { ignoreCase: false, ignoreWhitespace: false };

describe("diffLines", () => {
	it("바뀐 줄을 삭제와 추가로 나눠 센다", () => {
		const result = diffLines("a\nb\nc", "a\nx\nc", plain);
		expect(result.lines.map((line) => line.type)).toEqual([
			"equal",
			"remove",
			"add",
			"equal",
		]);
		expect([result.added, result.removed, result.unchanged]).toEqual([1, 1, 2]);
	});

	it("같은 글은 변경이 없다고 본다", () => {
		const result = diffLines("same", "same", plain);
		expect([result.added, result.removed]).toEqual([0, 0]);
	});

	it("무시 설정을 켜도 보여 주는 글은 원문 그대로다", () => {
		const result = diffLines("Hello  World", "hello world", {
			ignoreCase: true,
			ignoreWhitespace: true,
		});
		expect(result.added).toBe(0);
		expect(result.lines[0]?.text).toBe("Hello  World");
	});

	it("양쪽 줄 번호를 각각 매긴다", () => {
		const [first] = diffLines("a", "a", plain).lines;
		expect([first?.leftNumber, first?.rightNumber]).toEqual([1, 1]);
	});
});

describe("collapseUnchanged", () => {
	const long = Array.from({ length: 20 }, (_, index) => `line${index}`);

	it("변경이 뒤쪽에 있으면 접힌 줄을 앞에 알린다", () => {
		const diff = diffLines(
			long.join("\n"),
			[...long.slice(0, 19), "CHANGED"].join("\n"),
			plain
		);
		const chunks = collapseUnchanged(diff.lines, 2);
		expect(chunks).toHaveLength(1);
		expect(chunks[0]?.skipped).toBe(17);
		expect(chunks[0]?.lines.at(-1)?.text).toBe("CHANGED");
	});

	it("변경이 앞쪽에 있으면 접힌 줄을 뒤에 알린다", () => {
		const diff = diffLines(
			long.join("\n"),
			["CHANGED", ...long.slice(1)].join("\n"),
			plain
		);
		const chunks = collapseUnchanged(diff.lines, 2);
		expect(chunks).toHaveLength(2);
		expect(chunks[0]?.skipped).toBe(0);
		expect(chunks[1]).toEqual({ skipped: 17, lines: [] });
	});
});
