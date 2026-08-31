import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Plugin } from "vite";
import {
	canonicalUrl,
	OG_IMAGE_PATH,
	PAGE_SEO,
	SITE_NAME,
	SITE_URL,
	structuredData,
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

// 링크가 있어야 자바스크립트를 실행하지 않는 크롤러도 나머지 페이지를 찾아간다.
const otherToolLinks = (page: PageSeo, title: string): Array<string> => [
	`<h2 style="${SUBHEADING_STYLE}">${title}</h2>`,
	"<ul>",
	...PAGE_SEO.filter(
		(entry) => entry.path !== "/" && entry.path !== page.path
	).map(
		(entry) =>
			`<li><a href="${entry.path}" style="color:#f7f7f7">${escapeHtml(entry.title.split(" - ")[0] ?? entry.title)}</a></li>`
	),
	"</ul>",
];

// 가이드가 없는 페이지(목록/계산기)는 설명과 내부 링크만 남긴다.
const linkListBody = (page: PageSeo): string =>
	[
		`<div style="${WRAPPER_STYLE}">`,
		`<h1 style="${HEADING_STYLE}">${escapeHtml(SITE_NAME)}</h1>`,
		`<p>${escapeHtml(page.description)}</p>`,
		...otherToolLinks(page, "Tools"),
		"</div>",
	].join("");

const bodyFor = (page: PageSeo): string => {
	if (!page.guide) return linkListBody(page);
	const guide = page.guide;

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
		...otherToolLinks(page, "Other tools"),
		"</div>",
	].join("");
};

const headFor = (page: PageSeo): string => {
	const url = canonicalUrl(page.path);
	const image = `${SITE_URL}${OG_IMAGE_PATH}`;

	return [
		`<title>${escapeHtml(page.title)}</title>`,
		`<meta name="description" content="${escapeHtml(page.description)}" />`,
		`<link rel="canonical" href="${url}" />`,
		`<meta property="og:type" content="website" />`,
		`<meta property="og:site_name" content="${escapeHtml(SITE_NAME)}" />`,
		`<meta property="og:title" content="${escapeHtml(page.title)}" />`,
		`<meta property="og:description" content="${escapeHtml(page.description)}" />`,
		`<meta property="og:url" content="${url}" />`,
		`<meta property="og:image" content="${image}" />`,
		`<meta name="twitter:card" content="summary_large_image" />`,
		`<meta name="twitter:title" content="${escapeHtml(page.title)}" />`,
		`<meta name="twitter:description" content="${escapeHtml(page.description)}" />`,
		`<meta name="twitter:image" content="${image}" />`,
		`<script type="application/ld+json">${structuredData(page)}</script>`,
	].join("\n    ");
};

// index.html의 기본 title/description을 페이지별 값으로 갈아끼운다.
const renderHtml = (template: string, page: PageSeo): string =>
	template
		.replace(/<title>[^<]*<\/title>/, "")
		.replace(/<meta\s+name="description"[\s\S]*?\/>/, "")
		.replace("</head>", `  ${headFor(page)}\n  </head>`)
		.replace('<div id="root"></div>', `<div id="root">${bodyFor(page)}</div>`);

const sitemap = (lastModified: string): string =>
	[
		'<?xml version="1.0" encoding="UTF-8"?>',
		'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
		...PAGE_SEO.map((page) =>
			[
				"  <url>",
				`    <loc>${canonicalUrl(page.path)}</loc>`,
				`    <lastmod>${lastModified}</lastmod>`,
				`    <priority>${page.priority}</priority>`,
				"  </url>",
			].join("\n")
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
 * 빌드 후 경로마다 메타데이터를 채운 HTML을 만들어 두면, 색인과 링크 미리보기가
 * 해당 페이지의 제목과 설명을 그대로 사용한다.
 */
export const seoPlugin = (buildDate: string): Plugin => ({
	name: "utilityweb-seo",
	apply: "build",
	async closeBundle(): Promise<void> {
		const outDir = path.resolve("./dist");
		const template = await readFile(path.join(outDir, "index.html"), "utf8");

		for (const page of PAGE_SEO) {
			const html = renderHtml(template, page);
			if (page.path === "/") {
				await writeFile(path.join(outDir, "index.html"), html);
				continue;
			}

			const directory = path.join(outDir, page.path.replace(/^\//, ""));
			await mkdir(directory, { recursive: true });
			await writeFile(path.join(directory, "index.html"), html);
		}

		await writeFile(path.join(outDir, "sitemap.xml"), sitemap(buildDate));
		await writeFile(path.join(outDir, "robots.txt"), robots());
	},
});
