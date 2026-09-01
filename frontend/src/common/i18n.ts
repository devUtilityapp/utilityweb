import i18n, { type InitOptions } from "i18next";
import { initReactI18next } from "react-i18next";
import translationEN from "../assets/locales/en/translations.json";
import type { Language } from "./languages";
import { DEFAULT_LANGUAGE, LANGUAGES, splitLanguagePath } from "./languages";
import { isProduction } from "./utils";

export const defaultNS = "translations";

// 타입의 기준이 되는 리소스. 영어에 모든 키가 있으므로 이것 하나면 된다.
export const resources = {
	en: { translations: translationEN },
} as const;

/**
 * 영어를 뺀 나머지는 필요할 때만 받아온다.
 * 네 언어를 모두 번들에 넣으면 방문자가 절대 보지 않을 세 언어까지 내려받게 된다.
 * 본문 가이드와 같은 방식이다.
 */
const LOADERS: Record<
	Exclude<Language, typeof DEFAULT_LANGUAGE>,
	() => Promise<Record<string, unknown>>
> = {
	ko: async () => (await import("../assets/locales/ko/translations.json")).default,
	ja: async () => (await import("../assets/locales/ja/translations.json")).default,
	zh: async () => (await import("../assets/locales/zh/translations.json")).default,
};

const loaded = new Set<Language>([DEFAULT_LANGUAGE]);

/** 그 언어의 문구를 아직 안 받았으면 받아서 등록한다. 같은 언어는 한 번만 받는다. */
export const ensureLanguage = async (language: Language): Promise<void> => {
	if (loaded.has(language)) return;

	const load = LOADERS[language as Exclude<Language, typeof DEFAULT_LANGUAGE>];
	if (!load) return;

	i18n.addResourceBundle(language, defaultNS, await load());
	loaded.add(language);
};

// 언어는 브라우저 설정이 아니라 주소가 정한다.
// 같은 주소가 사람마다 다른 언어로 보이면 검색엔진이 색인한 내용과 어긋난다.
const languageFromPath = (): Language =>
	globalThis.location === undefined
		? DEFAULT_LANGUAGE
		: splitLanguagePath(globalThis.location.pathname).language;

const i18nOptions: InitOptions = {
	defaultNS,
	ns: [defaultNS],
	resources,
	debug: !isProduction,
	fallbackLng: DEFAULT_LANGUAGE,
	// ko-KR처럼 지역 코드가 붙은 언어도 ko 리소스를 쓰게 한다.
	load: "languageOnly",
	supportedLngs: [...LANGUAGES],
	interpolation: {
		escapeValue: false, // not needed for react as it escapes by default
	},
};

/**
 * 앱을 그리기 전에 부른다.
 * 문구를 먼저 받아 두어야 첫 화면이 영어로 한 번 번쩍이지 않는다.
 * 기다리는 동안 화면에는 빌드 때 넣어둔 그 언어의 정적 본문이 남아 있다.
 */
export const initI18n = async (): Promise<void> => {
	const language = languageFromPath();

	await i18n.use(initReactI18next).init({ ...i18nOptions, lng: DEFAULT_LANGUAGE });
	await ensureLanguage(language);
	if (language !== DEFAULT_LANGUAGE) {
		await i18n.changeLanguage(language);
	}
};
