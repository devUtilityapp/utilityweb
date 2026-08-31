import {
	DEFAULT_LANGUAGE,
	LANGUAGES,
	LANGUAGE_TAGS,
	type Language,
} from "../languages";
import { META_EN } from "./meta/en";
import { META_KO } from "./meta/ko";
import { META_JA } from "./meta/ja";
import { META_ZH } from "./meta/zh";
import { SEO_ROUTES, canonicalUrl, SITE_NAME, SITE_URL } from "./routes";
import type { PageGuide, PageMeta, PageSeo } from "./types";

export * from "./types";
export {
	SEO_ROUTES,
	SITE_NAME,
	SITE_URL,
	OG_IMAGE_PATH,
	canonicalUrl,
} from "./routes";

// 제목과 설명은 전부 합쳐도 가볍고 경로가 바뀌는 즉시 필요해서 함께 묶는다.
// 반대로 본문 가이드는 언어마다 수십 KB라 필요한 언어만 따로 받아온다.
const META: Record<Language, Record<string, PageMeta>> = {
	en: META_EN,
	ko: META_KO,
	ja: META_JA,
	zh: META_ZH,
};

export const DEFAULT_PATH = "/";

/** 우리가 아는 경로인지. 모르는 주소는 404로 다뤄야 한다. */
export const isKnownPath = (path: string): boolean =>
	SEO_ROUTES.some((route) => route.path === path);

/** 아직 번역되지 않은 페이지는 영어를 쓴다. */
export const findPageMeta = (path: string, language: Language): PageMeta =>
	META[language][path] ??
	META[DEFAULT_LANGUAGE][path] ??
	(META[DEFAULT_LANGUAGE][DEFAULT_PATH] as PageMeta);

export const findPageSeo = (path: string, language: Language): PageSeo => {
	const route =
		SEO_ROUTES.find((entry) => entry.path === path) ?? SEO_ROUTES[0];
	const resolvedPath = route?.path ?? DEFAULT_PATH;

	return {
		path: resolvedPath,
		priority: route?.priority ?? "0.5",
		...findPageMeta(resolvedPath, language),
	};
};

const GUIDE_LOADERS: Record<
	Language,
	() => Promise<Record<string, PageGuide>>
> = {
	en: async () => (await import("./guides/en")).GUIDES_EN,
	ko: async () => (await import("./guides/ko")).GUIDES_KO,
	ja: async () => (await import("./guides/ja")).GUIDES_JA,
	zh: async () => (await import("./guides/zh")).GUIDES_ZH,
};

const guideCache = new Map<Language, Record<string, PageGuide>>();

/** 한 언어의 가이드 전체를 받아온다. 같은 언어는 한 번만 받는다. */
export const loadGuides = async (
	language: Language
): Promise<Record<string, PageGuide>> => {
	const cached = guideCache.get(language);
	if (cached) return cached;

	const guides = await GUIDE_LOADERS[language]();
	guideCache.set(language, guides);
	return guides;
};

/** 번역이 아직 없는 페이지는 영어 가이드로 채운다. */
export const loadPageGuide = async (
	path: string,
	language: Language
): Promise<PageGuide | undefined> => {
	const guides = await loadGuides(language);
	if (guides[path]) return guides[path];
	if (language === DEFAULT_LANGUAGE) return undefined;
	return (await loadGuides(DEFAULT_LANGUAGE))[path];
};

/** 같은 페이지의 다른 언어 주소. hreflang에 쓴다. */
export const alternateUrls = (
	path: string
): Array<{ language: Language; tag: string; url: string }> =>
	LANGUAGES.map((language) => ({
		language,
		tag: LANGUAGE_TAGS[language],
		url: canonicalUrl(path, language),
	}));

// 검색엔진이 사이트 성격을 이해하도록 넣는 구조화 데이터.
// FAQ/HowTo는 요즘 리치 결과로 노출되는 경우가 드물지만, 페이지 주제를 명확히
// 전달하는 값은 남아 있다. 본문에 실제로 보이는 문장과 같은 데이터를 쓴다.
export const structuredData = (
	page: PageSeo,
	language: Language,
	guide?: PageGuide
): string => {
	const url = canonicalUrl(page.path, language);

	const application = {
		"@type": "WebApplication",
		"@id": `${url}#app`,
		name: page.title,
		description: page.description,
		url,
		inLanguage: LANGUAGE_TAGS[language],
		applicationCategory: "UtilitiesApplication",
		operatingSystem: "Any browser",
		browserRequirements: "Requires JavaScript",
		isAccessibleForFree: true,
		offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
		publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
	};

	const graph: Array<unknown> = [application];

	if (guide) {
		graph.push({
			"@type": "HowTo",
			"@id": `${url}#howto`,
			name: guide.stepsTitle,
			description: page.description,
			inLanguage: LANGUAGE_TAGS[language],
			step: guide.steps.map((text, index) => ({
				"@type": "HowToStep",
				position: index + 1,
				text,
			})),
		});

		graph.push({
			"@type": "FAQPage",
			"@id": `${url}#faq`,
			inLanguage: LANGUAGE_TAGS[language],
			mainEntity: guide.faq.map((entry) => ({
				"@type": "Question",
				name: entry.question,
				acceptedAnswer: { "@type": "Answer", text: entry.answer },
			})),
		});
	}

	return JSON.stringify({ "@context": "https://schema.org", "@graph": graph });
};
