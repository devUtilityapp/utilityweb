import i18n, { type InitOptions } from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import translationEN from "../assets/locales/en/translations.json";
import translationES from "../assets/locales/es/translations.json";
import translationKO from "../assets/locales/ko/translations.json";
import { isProduction } from "./utils";

export const defaultNS = "translations";
export const resources = {
	en: { translations: translationEN },
	es: { translations: translationES },
	ko: { translations: translationKO },
} as const;

// 번역 파일을 번들에 포함한다. HTTP로 받아오던 방식은 개발 서버가 JSON을
// 모듈로 변환해 주는 탓에 파싱 경고가 뜨고, 배포에서도 404 위험이 있었다.
const i18nOptions: InitOptions = {
	defaultNS,
	ns: [defaultNS],
	resources,
	debug: !isProduction,
	fallbackLng: "en",
	// ko-KR처럼 지역 코드가 붙은 언어도 ko 리소스를 쓰게 한다.
	load: "languageOnly",
	supportedLngs: ["en", "es", "ko"],
	interpolation: {
		escapeValue: false, // not needed for react as it escapes by default
	},
};

void i18n.use(initReactI18next).use(LanguageDetector).init(i18nOptions);
