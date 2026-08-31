import { describe, expect, it } from "vitest";
import { csvToJson, jsonToCsv, parseCsv } from "../csvJson";

describe("parseCsv", () => {
	it("따옴표 안의 쉼표와 줄바꿈을 한 칸으로 본다", () => {
		expect(parseCsv('a,"b,c\nd",e', ",")).toEqual([["a", "b,c\nd", "e"]]);
	});

	it("겹친 따옴표는 따옴표 한 개로 읽는다", () => {
		expect(parseCsv('"say ""hi"""', ",")).toEqual([['say "hi"']]);
	});

	it("CRLF를 줄바꿈 한 번으로 센다", () => {
		expect(parseCsv("a,b\r\n1,2\r\n", ",")).toEqual([
			["a", "b"],
			["1", "2"],
		]);
	});

	it("앞에 붙은 BOM을 떼어 낸다", () => {
		expect(parseCsv("﻿name\nAda", ",")).toEqual([["name"], ["Ada"]]);
	});
});

describe("csvToJson", () => {
	const options = { delimiter: "," as const, header: true, typed: true };

	it("첫 줄을 열 이름으로 쓴다", () => {
		expect(csvToJson("name,age\nAda,36", options)).toEqual([
			{ name: "Ada", age: 36 },
		]);
	});

	it("앞자리가 0인 값은 숫자로 바꾸지 않는다", () => {
		expect(csvToJson("zip\n01234", options)).toEqual([{ zip: "01234" }]);
	});

	it("빈 칸은 null이 된다", () => {
		expect(csvToJson("a,b\n1,", options)).toEqual([{ a: 1, b: null }]);
	});

	it("타입 변환을 끄면 모두 문자열로 둔다", () => {
		expect(csvToJson("a\n1", { ...options, typed: false })).toEqual([
			{ a: "1" },
		]);
	});

	it("겹치거나 빈 열 이름을 구분해 준다", () => {
		// 키 이름은 CSV 쪽이 정하므로 우리 코드의 이름 규칙과 무관하다.
		const [row] = csvToJson("a,a,\n1,2,3", options) as Array<
			Record<string, unknown>
		>;
		expect(Object.keys(row ?? {})).toEqual(["a", "a_2", "column3"]);
		expect(Object.values(row ?? {})).toEqual([1, 2, 3]);
	});
});

describe("jsonToCsv", () => {
	it("모든 행의 키를 합쳐 열을 만든다", () => {
		expect(jsonToCsv('[{"a":1},{"b":2}]', ",")).toBe("a,b\n1,\n,2");
	});

	it("쉼표가 든 값을 따옴표로 감싼다", () => {
		expect(jsonToCsv('[{"a":"x,y"}]', ",")).toBe('a\n"x,y"');
	});

	it("배열이 아니면 거절한다", () => {
		expect(() => jsonToCsv("{}", ",")).toThrow(/array/);
	});

	it("올바르지 않은 JSON은 거절한다", () => {
		expect(() => jsonToCsv("nope", ",")).toThrow(/valid JSON/);
	});
});
