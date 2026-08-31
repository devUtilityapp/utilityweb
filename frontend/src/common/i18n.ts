import i18n, { type InitOptions } from "i18next";
import { initReactI18next } from "react-i18next";
import translationEN from "../assets/locales/en/translations.json";
import translationKO from "../assets/locales/ko/translations.json";
import translationJA from "../assets/locales/ja/translations.json";
import translationZH from "../assets/locales/zh/translations.json";
import { DEFAULT_LANGUAGE, LANGUAGES, splitLanguagePath } from "./languages";
import { isProduction } from "./utils";

export const defaultNS = "translations";
export const resources = {
	en: { translations: translationEN },
	ko: { translations: translationKO },
	ja: { translations: translationJA },
	zh: { translations: translationZH },
} as const;

// 번역 파일을 번들에 포함한다. HTTP로 받아오던 방식은 개발 서버가 JSON을
// 모듈로 변환해 주는 탓에 파싱 경고가 뜨고, 배포에서도 404 위험이 있었다.
//
// 언어는 브라우저 설정이 아니라 주소가 정한다.
// 같은 주소가 사람마다 다른 언어로 보이면 검색엔진이 색인한 내용과 어긋난다.
//
// 첫 화면부터 맞는 언어로 그리려면 React가 그리기 전에 언어가 정해져 있어야 한다.
// 렌더 뒤에 changeLanguage를 부르면 그 사이 한 번은 영어가 보인다.
const initialLanguage =
	globalThis.location === undefined
		? DEFAULT_LANGUAGE
		: splitLanguagePath(globalThis.location.pathname).language;
const i18nOptions: InitOptions = {
	defaultNS,
	ns: [defaultNS],
	resources,
	debug: !isProduction,
	lng: initialLanguage,
	fallbackLng: DEFAULT_LANGUAGE,
	// ko-KR처럼 지역 코드가 붙은 언어도 ko 리소스를 쓰게 한다.
	load: "languageOnly",
	supportedLngs: [...LANGUAGES],
	interpolation: {
		escapeValue: false, // not needed for react as it escapes by default
	},
};

void i18n.use(initReactI18next).init(i18nOptions);
