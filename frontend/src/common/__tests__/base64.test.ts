import { describe, expect, it } from "vitest";
import { decodeText, decodeToBytes, encodeText } from "../base64";

describe("base64", () => {
	it("아스키를 옮긴다", () => {
		expect(encodeText("Hello", false)).toBe("SGVsbG8=");
	});

	it("한글과 이모지를 원래대로 되돌린다", () => {
		const original = "한글 텍스트 😀";
		expect(decodeText(encodeText(original, false))).toBe(original);
	});

	it("URL 안전 표기에는 + / = 를 쓰지 않는다", () => {
		const encoded = encodeText("ûÿþ??", true);
		expect(encoded).not.toMatch(/[+/=]/);
		expect(decodeText(encoded)).toBe("ûÿþ??");
	});

	it("채움 문자가 빠진 값도 읽는다", () => {
		expect(decodeText("SGVsbG8")).toBe("Hello");
	});

	it("base64가 아니면 거절한다", () => {
		expect(() => decodeText("!!!nope!!!")).toThrow(/not valid base64/);
	});

	it("텍스트가 아닌 바이트는 파일로 다루라고 알린다", () => {
		expect(() => decodeText(btoa("ÿþý"))).toThrow(/file mode/);
	});

	it("바이트로 되돌린다", () => {
		expect([...decodeToBytes("SGVsbG8=")]).toEqual([72, 101, 108, 108, 111]);
	});
});
