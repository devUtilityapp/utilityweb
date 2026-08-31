import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
// jest-dom 6부터는 matchers를 직접 넘기지 않고 vitest용 진입점을 불러오면
// expect가 알아서 확장된다. 기본 내보내기를 쓰던 예전 방식은 undefined를 준다.
import "@testing-library/jest-dom/vitest";

// 테스트마다 jsdom에 남은 것을 치운다.
afterEach(() => {
	cleanup();
});
