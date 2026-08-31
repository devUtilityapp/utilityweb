import { describe, expect, it } from "vitest";
import { countNodes, formatJson, minifyJson } from "../jsonFormat";

describe("formatJson", () => {
	it("들여쓰기를 넣어 편다", () => {
		expect(formatJson('{"a":1}', { indent: "2", sort: false }).output).toBe(
			'{\n  "a": 1\n}'
		);
	});

	it("탭 들여쓰기를 쓴다", () => {
		expect(formatJson('{"a":1}', { indent: "tab", sort: false }).output).toBe(
			'{\n\t"a": 1\n}'
		);
	});

	it("키를 알파벳 순으로 정렬한다", () => {
		expect(
			formatJson('{"b":1,"a":2}', { indent: "2", sort: true }).output
		).toBe('{\n  "a": 2,\n  "b": 1\n}');
	});

	it("위치를 알 수 있는 오류는 줄과 칸을 알려 준다", () => {
		const { error } = formatJson('{"a":1,}', { indent: "2", sort: false });
		expect(error?.line).toBe(1);
		expect(error?.column).toBe(8);
	});

	it("위치를 알 수 없으면 없다고 둔다", () => {
		const { error } = formatJson('{\n "a": oops\n}', {
			indent: "2",
			sort: false,
		});
		expect(error).not.toBeNull();
		expect(error?.line).toBeNull();
	});
});

describe("minifyJson", () => {
	it("공백과 줄바꿈을 걷어낸다", () => {
		expect(minifyJson('{\n  "a" : 1\n}', { sort: false }).output).toBe(
			'{"a":1}'
		);
	});
});

describe("countNodes", () => {
	it("값의 개수를 센다", () => {
		expect(countNodes('{"a":[1,2],"b":{"c":3}}')).toBe(6);
	});

	it("읽을 수 없으면 null을 준다", () => {
		expect(countNodes("nope")).toBeNull();
	});
});
