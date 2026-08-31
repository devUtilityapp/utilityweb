import { describe, expect, it } from "vitest";
import { localizePath, splitLanguagePath } from "../languages";

describe("splitLanguagePath", () => {
	it("접두사가 없으면 기본 언어로 본다", () => {
		expect(splitLanguagePath("/merge-pdf")).toEqual({
			language: "en",
			path: "/merge-pdf",
		});
	});

	it("언어 접두사를 떼어 낸다", () => {
		expect(splitLanguagePath("/ko/merge-pdf")).toEqual({
			language: "ko",
			path: "/merge-pdf",
		});
	});

	it("언어만 있는 주소는 첫 화면을 가리킨다", () => {
		expect(splitLanguagePath("/ja")).toEqual({ language: "ja", path: "/" });
	});

	it("여러 단계 경로도 유지한다", () => {
		expect(splitLanguagePath("/zh/calculator/gcd")).toEqual({
			language: "zh",
			path: "/calculator/gcd",
		});
	});

	it("지원하지 않는 접두사는 경로의 일부로 남긴다", () => {
		expect(splitLanguagePath("/fr/merge-pdf")).toEqual({
			language: "en",
			path: "/fr/merge-pdf",
		});
	});

	it("끝의 빗금을 지운다", () => {
		expect(splitLanguagePath("/tools/").path).toBe("/tools");
	});
});

describe("localizePath", () => {
	it("기본 언어에는 접두사를 붙이지 않는다", () => {
		expect(localizePath("/merge-pdf", "en")).toBe("/merge-pdf");
		expect(localizePath("/", "en")).toBe("/");
	});

	it("다른 언어에는 접두사를 붙인다", () => {
		expect(localizePath("/merge-pdf", "ko")).toBe("/ko/merge-pdf");
		expect(localizePath("/", "ja")).toBe("/ja");
	});

	it("떼었다 붙이면 원래 주소로 돌아온다", () => {
		for (const path of ["/", "/tools", "/calculator/gcd"]) {
			for (const language of ["en", "ko", "ja", "zh"] as const) {
				const localized = localizePath(path, language);
				expect(splitLanguagePath(localized)).toEqual({ language, path });
			}
		}
	});
});
