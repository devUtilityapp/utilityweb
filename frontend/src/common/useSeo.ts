import { useEffect } from "react";
import { useRouterState } from "@tanstack/react-router";
import {
	canonicalUrl,
	findPageSeo,
	OG_IMAGE_PATH,
	SITE_NAME,
	SITE_URL,
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
 * 페이지를 옮길 때마다 head의 검색용 정보를 현재 경로에 맞춘다.
 * 빌드 시점에 경로별 HTML도 같은 값으로 만들어두므로(vite.config.ts),
 * 자바스크립트를 실행하지 않는 크롤러도 같은 정보를 본다.
 */
export const useSeo = (): void => {
	const pathname = useRouterState({
		select: (state) => state.location.pathname,
	});

	useEffect(() => {
		const page = findPageSeo(pathname);
		const url = canonicalUrl(page.path);
		const image = `${SITE_URL}${OG_IMAGE_PATH}`;

		document.title = page.title;
		setMeta("name", "description", page.description);
		setLink("canonical", url);

		setMeta("property", "og:type", "website");
		setMeta("property", "og:site_name", SITE_NAME);
		setMeta("property", "og:title", page.title);
		setMeta("property", "og:description", page.description);
		setMeta("property", "og:url", url);
		setMeta("property", "og:image", image);

		setMeta("name", "twitter:card", "summary_large_image");
		setMeta("name", "twitter:title", page.title);
		setMeta("name", "twitter:description", page.description);
		setMeta("name", "twitter:image", image);

		setStructuredData(structuredData(page));
	}, [pathname]);
};
