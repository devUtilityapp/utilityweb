export const LANGUAGES = ["en", "ko", "ja", "zh"] as const;

export type Language = (typeof LANGUAGES)[number];

/**
 * 기본 언어는 접두사 없이 지금 쓰던 주소를 그대로 쓴다.
 * 타입을 넓히지 않고 "en" 그대로 두어야, 나머지 언어만 골라내는 곳에서 쓸 수 있다.
 */
export const DEFAULT_LANGUAGE = "en" satisfies Language;

export const LANGUAGE_NAMES: Record<Language, string> = {
	en: "English",
	ko: "한국어",
	ja: "日本語",
	zh: "中文",
};

/** hreflang과 <html lang>에 넣는 값. 중국어는 간체를 쓴다. */
export const LANGUAGE_TAGS: Record<Language, string> = {
	en: "en",
	ko: "ko",
	ja: "ja",
	zh: "zh-Hans",
};

export const isLanguage = (value: string): value is Language =>
	(LANGUAGES as ReadonlyArray<string>).includes(value);

/**
 * 주소에서 언어와 언어를 뗀 경로를 뽑는다.
 * "/ko/merge-pdf" -> { language: "ko", path: "/merge-pdf" }
 * "/merge-pdf"    -> { language: "en", path: "/merge-pdf" }
 */
export const splitLanguagePath = (
	pathname: string
): { language: Language; path: string } => {
	const [, first = "", ...rest] = pathname.split("/");
	if (first !== DEFAULT_LANGUAGE && isLanguage(first)) {
		const path = `/${rest.join("/")}`.replace(/\/$/, "");
		return { language: first, path: path === "" ? "/" : path };
	}
	const path = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
	return { language: DEFAULT_LANGUAGE, path };
};

/** 언어를 뗀 경로에 그 언어의 접두사를 붙인다. */
export const localizePath = (path: string, language: Language): string => {
	if (language === DEFAULT_LANGUAGE) return path;
	return path === "/" ? `/${language}` : `/${language}${path}`;
};
