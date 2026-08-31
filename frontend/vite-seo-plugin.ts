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
		.replace("</head>", `  ${headFor(page)}\n  </head>`);

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

const robots = (): string =>
	[
		"User-agent: *",
		"Allow: /",
		"",
		"# 사용할 수 없는 상태의 도구는 색인하지 않는다",
		"Disallow: /youtube-downloader",
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
			// 정적 호스팅이 디렉터리 색인을 안 쓰는 경우를 위해 파일도 함께 둔다.
			await writeFile(`${directory}.html`, html);
		}

		await writeFile(path.join(outDir, "sitemap.xml"), sitemap(buildDate));
		await writeFile(path.join(outDir, "robots.txt"), robots());
	},
});
