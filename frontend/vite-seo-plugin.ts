import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Plugin } from "vite";
import type { Language } from "./src/common/languages";
import {
	DEFAULT_LANGUAGE,
	LANGUAGES,
	LANGUAGE_NAMES,
	LANGUAGE_TAGS,
	localizePath,
} from "./src/common/languages";
import {
	OG_IMAGE_PATH,
	SEO_ROUTES,
	SITE_NAME,
	SITE_URL,
	alternateUrls,
	canonicalUrl,
	findPageSeo,
	loadGuides,
	structuredData,
	type PageGuide,
	type PageSeo,
} from "./src/common/seo";

const escapeHtml = (value: string): string =>
	value
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;");

// 자바스크립트를 실행하지 않는 크롤러도 페이지 본문을 볼 수 있도록,
// 같은 문구를 #root 안에 정적으로 넣어둔다. 앱이 뜨면 React가 이 내용을 지우고
// 실제 화면을 그린다.
const WRAPPER_STYLE =
	"max-width:56rem;margin:0 auto;padding:4rem 2rem;color:#aaa;font-family:system-ui,-apple-system,sans-serif;line-height:1.7";
const HEADING_STYLE = "color:#f7f7f7;font-size:1.5rem;margin-bottom:1.5rem";
const SUBHEADING_STYLE = "color:#f7f7f7;font-size:1.25rem;margin:2rem 0 1rem";

// 크롤러가 다른 언어판을 링크로도 찾아갈 수 있게 한다.
const languageLinks = (page: PageSeo): Array<string> => [
	`<h2 style="${SUBHEADING_STYLE}">Languages</h2>`,
	"<ul>",
	...LANGUAGES.map(
		(language) =>
			`<li><a href="${localizePath(page.path, language)}" hreflang="${LANGUAGE_TAGS[language]}" style="color:#f7f7f7">${escapeHtml(LANGUAGE_NAMES[language])}</a></li>`
	),
	"</ul>",
];

// 링크가 있어야 자바스크립트를 실행하지 않는 크롤러도 나머지 페이지를 찾아간다.
// 언어별 페이지는 같은 언어의 다른 도구로 연결한다.
const otherToolLinks = (
	page: PageSeo,
	language: Language,
	title: string,
	titleOf: (path: string) => string
): Array<string> => [
	`<h2 style="${SUBHEADING_STYLE}">${escapeHtml(title)}</h2>`,
	"<ul>",
	...SEO_ROUTES.filter(
		(entry) => entry.path !== "/" && entry.path !== page.path
	).map((entry) => {
		const label = titleOf(entry.path).split(" - ")[0] ?? titleOf(entry.path);
		return `<li><a href="${localizePath(entry.path, language)}" style="color:#f7f7f7">${escapeHtml(label)}</a></li>`;
	}),
	"</ul>",
];

const bodyFor = (
	page: PageSeo,
	language: Language,
	guide: PageGuide | undefined,
	titleOf: (path: string) => string
): string => {
	const links = [
		...otherToolLinks(
			page,
			language,
			guide ? "Other tools" : "Tools",
			titleOf
		),
		...languageLinks(page),
		"</div>",
	];

	if (!guide) {
		return [
			`<div style="${WRAPPER_STYLE}">`,
			`<h1 style="${HEADING_STYLE}">${escapeHtml(SITE_NAME)}</h1>`,
			`<p>${escapeHtml(page.description)}</p>`,
			...links,
		].join("");
	}

	return [
		`<div style="${WRAPPER_STYLE}">`,
		`<h1 style="${HEADING_STYLE}">${escapeHtml(guide.heading)}</h1>`,
		`<p>${escapeHtml(guide.lead)}</p>`,
		`<h2 style="${SUBHEADING_STYLE}">${escapeHtml(guide.stepsTitle)}</h2>`,
		"<ol>",
		...guide.steps.map((step) => `<li>${escapeHtml(step)}</li>`),
		"</ol>",
		`<h2 style="${SUBHEADING_STYLE}">${escapeHtml(guide.faqTitle)}</h2>`,
		...guide.faq.flatMap((entry) => [
			`<h3 style="color:#f7f7f7;font-size:1rem;margin:1.5rem 0 0.5rem">${escapeHtml(entry.question)}</h3>`,
			`<p>${escapeHtml(entry.answer)}</p>`,
		]),
		...links,
	].join("");
};

const headFor = (
	page: PageSeo,
	language: Language,
	guide: PageGuide | undefined
): string => {
	const url = canonicalUrl(page.path, language);
	const image = `${SITE_URL}${OG_IMAGE_PATH}`;

	return [
		`<title>${escapeHtml(page.title)}</title>`,
		`<meta name="description" content="${escapeHtml(page.description)}" />`,
		`<link rel="canonical" href="${url}" />`,
		...alternateUrls(page.path).map(
			(alternate) =>
				`<link rel="alternate" hreflang="${alternate.tag}" href="${alternate.url}" />`
		),
		`<link rel="alternate" hreflang="x-default" href="${canonicalUrl(page.path, DEFAULT_LANGUAGE)}" />`,
		`<meta property="og:type" content="website" />`,
		`<meta property="og:site_name" content="${escapeHtml(SITE_NAME)}" />`,
		`<meta property="og:title" content="${escapeHtml(page.title)}" />`,
		`<meta property="og:description" content="${escapeHtml(page.description)}" />`,
		`<meta property="og:url" content="${url}" />`,
		`<meta property="og:image" content="${image}" />`,
		`<meta property="og:locale" content="${LANGUAGE_TAGS[language]}" />`,
		`<meta name="twitter:card" content="summary_large_image" />`,
		`<meta name="twitter:title" content="${escapeHtml(page.title)}" />`,
		`<meta name="twitter:description" content="${escapeHtml(page.description)}" />`,
		`<meta name="twitter:image" content="${image}" />`,
		`<script type="application/ld+json">${structuredData(page, language, guide)}</script>`,
	].join("\n    ");
};

// index.html의 기본 title/description을 페이지별 값으로 갈아끼운다.
const renderHtml = (
	template: string,
	page: PageSeo,
	language: Language,
	guide: PageGuide | undefined,
	titleOf: (path: string) => string
): string =>
	template
		.replace(/<title>[^<]*<\/title>/, "")
		.replace(/<meta\s+name="description"[\s\S]*?\/>/, "")
		.replace('<html lang="en"', `<html lang="${LANGUAGE_TAGS[language]}"`)
		.replace("</head>", `  ${headFor(page, language, guide)}\n  </head>`)
		.replace(
			'<div id="root"></div>',
			`<div id="root">${bodyFor(page, language, guide, titleOf)}</div>`
		);

// 한 페이지의 모든 언어판을 <xhtml:link>로 서로 가리키게 한다.
// 구글은 사이트맵의 이 표기를 hreflang 태그와 동등하게 읽는다.
const sitemap = (lastModified: string): string =>
	[
		'<?xml version="1.0" encoding="UTF-8"?>',
		'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
		...LANGUAGES.flatMap((language) =>
			SEO_ROUTES.map((route) =>
				[
					"  <url>",
					`    <loc>${canonicalUrl(route.path, language)}</loc>`,
					...alternateUrls(route.path).map(
						(alternate) =>
							`    <xhtml:link rel="alternate" hreflang="${alternate.tag}" href="${alternate.url}" />`
					),
					`    <xhtml:link rel="alternate" hreflang="x-default" href="${canonicalUrl(route.path, DEFAULT_LANGUAGE)}" />`,
					`    <lastmod>${lastModified}</lastmod>`,
					`    <priority>${route.priority}</priority>`,
					"  </url>",
				].join("\n")
			)
		),
		"</urlset>",
		"",
	].join("\n");

// 숨긴 /youtube-downloader는 vercel.json에서 /tools로 301 처리한다.
// robots.txt로 막으면 크롤러가 그 리다이렉트를 못 보고 옛 주소를 계속 들고 있다.
const robots = (): string =>
	[
		"User-agent: *",
		"Allow: /",
		"",
		`Sitemap: ${SITE_URL}/sitemap.xml`,
		"",
	].join("\n");

/**
 * SPA는 크롤러가 자바스크립트를 돌리지 않으면 모든 경로가 같은 HTML로 보인다.
 * 빌드 후 경로·언어마다 메타데이터와 본문을 채운 HTML을 만들어 두면,
 * 색인과 링크 미리보기가 해당 페이지의 언어로 된 제목과 설명을 그대로 쓴다.
 */
export const seoPlugin = (buildDate: string): Plugin => ({
	name: "utilityweb-seo",
	apply: "build",
	async closeBundle(): Promise<void> {
		const outDir = path.resolve("./dist");
		const template = await readFile(path.join(outDir, "index.html"), "utf8");

		for (const language of LANGUAGES) {
			const guides = await loadGuides(language);
			const fallbackGuides =
				language === DEFAULT_LANGUAGE
					? guides
					: await loadGuides(DEFAULT_LANGUAGE);
			const titleOf = (target: string): string =>
				findPageSeo(target, language).title;

			for (const route of SEO_ROUTES) {
				const page = findPageSeo(route.path, language);
				const guide = guides[route.path] ?? fallbackGuides[route.path];
				const html = renderHtml(template, page, language, guide, titleOf);
				const localized = localizePath(route.path, language);

				if (localized === "/") {
					await writeFile(path.join(outDir, "index.html"), html);
					continue;
				}

				const directory = path.join(outDir, localized.replace(/^\//, ""));
				await mkdir(directory, { recursive: true });
				await writeFile(path.join(directory, "index.html"), html);
			}
		}

		await writeFile(path.join(outDir, "sitemap.xml"), sitemap(buildDate));
		await writeFile(path.join(outDir, "robots.txt"), robots());
	},
});
