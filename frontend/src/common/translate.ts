import type { TFunction } from "i18next";

/**
 * 실행 중에 조합한 번역 키(도구 이름, 분류 이름 등)를 쓴다.
 * 이런 키는 타입으로 확인할 수 없어서, 단언을 이 함수 한 곳에만 모아 둔다.
 */
export const tDynamic = (
	t: TFunction,
	key: string,
	options?: Record<string, unknown>
): string =>
	(t as (key: string, options?: Record<string, unknown>) => string)(
		key,
		options
	);
