import { describe, expect, it } from "vitest";
import { canVerify, decodeJwt, verifyHmac } from "../jwt";

// jwt.io의 예제 토큰. 비밀 값은 "your-256-bit-secret".
const SAMPLE =
	"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9" +
	".eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ" +
	".SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

const NOW = Date.UTC(2026, 0, 1);

describe("decodeJwt", () => {
	it("헤더와 내용을 읽는다", () => {
		const decoded = decodeJwt(SAMPLE, NOW);
		expect(decoded.algorithm).toBe("HS256");
		expect(decoded.payload.value["name"]).toBe("John Doe");
	});

	it("시각 클레임을 날짜로 바꾼다", () => {
		const decoded = decodeJwt(SAMPLE, NOW);
		const issued = decoded.times.find((entry) => entry.claim === "iat");
		expect(issued?.date.toISOString()).toBe("2018-01-18T01:30:22.000Z");
	});

	it("만료된 토큰을 표시한다", () => {
		const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
		const payload = btoa(JSON.stringify({ exp: 1_000_000_000 }));
		const decoded = decodeJwt(`${header}.${payload}.sig`, NOW);
		expect(decoded.expired).toBe(true);
	});

	it("점이 모자라면 거절한다", () => {
		expect(() => decodeJwt("onlyonepart", NOW)).toThrow(/three parts/);
	});

	it("읽을 수 없는 내용은 거절한다", () => {
		expect(() => decodeJwt("aaa.bbb.ccc", NOW)).toThrow(/could not be read/);
	});
});

describe("verifyHmac", () => {
	it("맞는 비밀 값을 확인한다", async () => {
		await expect(
			verifyHmac(SAMPLE, "your-256-bit-secret", "HS256")
		).resolves.toBe(true);
	});

	it("틀린 비밀 값을 가려낸다", async () => {
		await expect(verifyHmac(SAMPLE, "wrong", "HS256")).resolves.toBe(false);
	});

	it("공개키가 필요한 알고리즘은 거절한다", async () => {
		await expect(verifyHmac(SAMPLE, "x", "RS256")).rejects.toThrow(
			/public key/
		);
	});
});

describe("canVerify", () => {
	it("HMAC 계열만 확인할 수 있다", () => {
		expect([canVerify("HS256"), canVerify("RS256")]).toEqual([true, false]);
	});
});
