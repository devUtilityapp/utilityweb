import { describe, expect, it } from "vitest";
import { generateUuids, inspectUuid } from "../uuid";

describe("generateUuids", () => {
	it("v4를 규격에 맞게 만든다", () => {
		const [value] = generateUuids(1, "v4", "plain");
		expect(inspectUuid(value ?? "")).toEqual({ valid: true, version: 4 });
	});

	it("겹치지 않는다", () => {
		const values = generateUuids(500, "v4", "plain");
		expect(new Set(values).size).toBe(500);
	});

	it("v7은 만든 순서대로 정렬된다", () => {
		const values = generateUuids(5000, "v7", "plain");
		expect([...values].sort()).toEqual(values);
	});

	it("v7은 1밀리초에 4096개를 넘겨도 순서를 지킨다", () => {
		const values = generateUuids(10_000, "v7", "plain");
		expect([...values].sort()).toEqual(values);
		expect(new Set(values).size).toBe(10_000);
	});

	it("호출을 나눠도 v7 순서가 이어진다", () => {
		const first = generateUuids(3, "v7", "plain");
		const second = generateUuids(3, "v7", "plain");
		const all = [...first, ...second];
		expect([...all].sort()).toEqual(all);
	});

	it("요청한 표기로 내보낸다", () => {
		expect(generateUuids(1, "v4", "upper")[0]).toMatch(/^[\dA-F-]+$/);
		expect(generateUuids(1, "v4", "braces")[0]).toMatch(/^\{.+\}$/);
		expect(generateUuids(1, "v4", "compact")[0]).toMatch(/^[\da-f]{32}$/);
	});
});

describe("inspectUuid", () => {
	it("중괄호를 벗겨서 본다", () => {
		const [value] = generateUuids(1, "v4", "braces");
		expect(inspectUuid(value ?? "").valid).toBe(true);
	});

	it("형식이 아니면 알려 준다", () => {
		expect(inspectUuid("not-a-uuid")).toEqual({ valid: false, version: null });
	});
});
