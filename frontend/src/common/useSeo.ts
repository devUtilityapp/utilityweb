import { useEffect } from "react";
import { useRouterState } from "@tanstack/react-router";
import i18n from "i18next";
import { LANGUAGE_TAGS, splitLanguagePath } from "./languages";
import {
	OG_IMAGE_PATH,
	SITE_NAME,
	SITE_URL,
	alternateUrls,
	canonicalUrl,
	findPageSeo,
	isKnownPath,
	loadPageGuide,
	structuredData,
} from "./seo";

const setMeta = (
	attribute: "name" | "property",
	key: string,
	content: string
): void => {
	let element = document.head.querySelector<HTMLMetaElement>(
		`meta[${attribute}="${key}"]`
	);
	if (!element) {
		element = document.createElement("meta");
		element.setAttribute(attribute, key);
		document.head.append(element);
	}
	element.content = content;
};

/** 앞 페이지에서 붙인 태그가 남지 않도록 지운다. */
const removeMeta = (key: string): void => {
	document.head.querySelector(`meta[name="${key}"]`)?.remove();
};

const setLink = (relation: string, href: string): void => {
	let element = document.head.querySelector<HTMLLinkElement>(
		`link[rel="${relation}"]`
	);
	if (!element) {
		element = document.createElement("link");
		element.rel = relation;
		document.head.append(element);
	}
	element.href = href;
};

/** 언어별 대체 주소. 경로가 바뀌면 전부 다시 그린다. */
const setAlternates = (path: string): void => {
	for (const element of document.head.querySelectorAll(
		'link[rel="alternate"]'
	)) {
		element.remove();
	}

	const append = (hreflang: string, href: string): void => {
		const element = document.createElement("link");
		element.rel = "alternate";
		element.hreflang = hreflang;
		element.href = href;
		document.head.append(element);
	};

	for (const alternate of alternateUrls(path)) {
		append(alternate.tag, alternate.url);
	}
	// 어느 언어에도 맞지 않는 방문자에게 보여줄 기본 주소.
	append("x-default", canonicalUrl(path, "en"));
};

const setStructuredData = (json: string): void => {
	let element = document.head.querySelector<HTMLScriptElement>(
		'script[type="application/ld+json"]'
	);
	if (!element) {
		element = document.createElement("script");
		element.type = "application/ld+json";
		document.head.append(element);
	}
	element.textContent = json;
};

/**
 * 페이지를 옮길 때마다 head의 검색용 정보를 현재 경로와 언어에 맞춘다.
 * 빌드 시점에 경로·언어별 HTML도 같은 값으로 만들어두므로(vite.config.ts),
 * 자바스크립트를 실행하지 않는 크롤러도 같은 정보를 본다.
 */
export const useSeo = (): void => {
	const pathname = useRouterState({
		select: (state) => state.location.pathname,
	});

	useEffect(() => {
		const { language, path } = splitLanguagePath(pathname);

		// 화면 문구는 주소의 언어를 따른다. 브라우저 설정보다 주소가 우선이다.
		if (i18n.language !== language) {
			void i18n.changeLanguage(language);
		}
		document.documentElement.lang = LANGUAGE_TAGS[language];

		// 없는 주소를 홈 페이지의 제목과 설명으로 채우면, 색인에 없는 페이지가
		// 있는 것처럼 남는다. 404로 표시하고 색인에서 빼 달라고 알린다.
		if (!isKnownPath(path)) {
			document.title = i18n.t("notFound.title");
			setMeta("name", "description", i18n.t("notFound.lead"));
			setMeta("name", "robots", "noindex");
			for (const element of document.head.querySelectorAll(
				'link[rel="alternate"], link[rel="canonical"]'
			)) {
				element.remove();
			}
			return;
		}

		removeMeta("robots");
		const page = findPageSeo(path, language);
		const url = canonicalUrl(page.path, language);
		const image = `${SITE_URL}${OG_IMAGE_PATH}`;

		document.title = page.title;
		setMeta("name", "description", page.description);
		setLink("canonical", url);
		setAlternates(page.path);

		setMeta("property", "og:type", "website");
		setMeta("property", "og:site_name", SITE_NAME);
		setMeta("property", "og:title", page.title);
		setMeta("property", "og:description", page.description);
		setMeta("property", "og:url", url);
		setMeta("property", "og:image", image);
		setMeta("property", "og:locale", LANGUAGE_TAGS[language]);

		setMeta("name", "twitter:card", "summary_large_image");
		setMeta("name", "twitter:title", page.title);
		setMeta("name", "twitter:description", page.description);
		setMeta("name", "twitter:image", image);

		// 구조화 데이터는 본문 가이드가 도착한 뒤에 완성본으로 바꾼다.
		// 그 전까지는 정적 HTML이 넣어둔 값을 그대로 둔다.
		let cancelled = false;
		loadPageGuide(page.path, language)
			.then((guide) => {
				if (!cancelled) {
					setStructuredData(structuredData(page, language, guide));
				}
			})
			.catch(() => {
				// 가이드를 못 받아도 제목·설명은 이미 반영되어 있다.
			});

		return (): void => {
			cancelled = true;
		};
	}, [pathname]);
};
