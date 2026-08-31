import { describe, expect, it } from "vitest";
import { contrastRatio, describeColor, parseColor } from "../color";

describe("parseColor", () => {
	it("여러 표기를 같은 색으로 읽는다", () => {
		const expected = { r: 57, g: 162, b: 128 };
		for (const input of [
			"#39a280",
			"39a280",
			"rgb(57, 162, 128)",
			"rgb(57 162 128)",
			"rgba(57,162,128,0.5)",
		]) {
			expect(parseColor(input)).toEqual(expected);
		}
	});

	it("세 자리 헥사를 여섯 자리로 편다", () => {
		expect(parseColor("#f00")).toEqual({ r: 255, g: 0, b: 0 });
	});

	it("읽을 수 없으면 null을 준다", () => {
		expect(parseColor("not a color")).toBeNull();
		expect(parseColor("")).toBeNull();
	});
});

describe("describeColor", () => {
	it("빨강을 각 표기로 옮긴다", () => {
		const info = describeColor({ r: 255, g: 0, b: 0 });
		expect(info.hex).toBe("#ff0000");
		expect(info.hsl).toEqual({ h: 0, s: 100, l: 50 });
		expect(info.cmyk).toEqual({ c: 0, m: 100, y: 100, k: 0 });
	});

	it("HSL로 갔다 와도 같은 색으로 돌아온다", () => {
		const source = parseColor("hsl(160, 48%, 43%)");
		expect(source).not.toBeNull();
		const info = describeColor(source as { r: number; g: number; b: number });
		expect(describeColor(parseColor(info.hex) as typeof info.rgb).hsl).toEqual(
			info.hsl
		);
	});
});

describe("contrastRatio", () => {
	it("흰색과 검은색은 21:1이다", () => {
		expect(
			contrastRatio({ r: 255, g: 255, b: 255 }, { r: 0, g: 0, b: 0 })
		).toBe(21);
	});

	it("같은 색끼리는 1:1이다", () => {
		expect(
			contrastRatio({ r: 57, g: 162, b: 128 }, { r: 57, g: 162, b: 128 })
		).toBe(1);
	});
});
