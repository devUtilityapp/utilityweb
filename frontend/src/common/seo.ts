// 검색 노출용 페이지 메타데이터.
// 런타임(SPA 이동 시 head 갱신)과 빌드 시점(경로별 HTML/sitemap 생성)이
// 같은 표를 쓴다.

export const SITE_URL = "https://www.utilityapp.net";
export const SITE_NAME = "Utility web";
export const OG_IMAGE_PATH = "/og-image.png";

export interface PageSeo {
	path: string;
	title: string;
	description: string;
	/** sitemap.xml의 상대 우선순위 */
	priority: string;
}

// 경로를 추가하면 vercel.json의 rewrites에도 같은 경로를 넣어야
// 크롤러가 그 경로의 정적 HTML을 받는다.
export const PAGE_SEO: Array<PageSeo> = [
	{
		path: "/",
		title: "Utility web - free online file and calculator tools",
		description:
			"Free browser based tools: convert PDF files to PowerPoint, view PPTX slides, and calculate the greatest common divisor or least common multiple. No upload, no sign up.",
		priority: "1.0",
	},
	{
		path: "/tools",
		title: "All tools - Utility web",
		description:
			"Browse every Utility web tool: PDF to PPTX conversion, a PPTX viewer, and GCD and LCM calculators. Everything runs in your browser.",
		priority: "0.9",
	},
	{
		path: "/pdf-to-pptx",
		title: "PDF to PPTX converter - free, no upload - Utility web",
		description:
			"Convert one or more PDF files into a single PowerPoint (.pptx) presentation. Pages become slides at 16:9, 4:3 or the original size. Files never leave your browser.",
		priority: "0.9",
	},
	{
		path: "/pptx-viewer",
		title: "PPTX viewer - open PowerPoint files online - Utility web",
		description:
			"Open a .pptx presentation in your browser and page through the slides with keyboard or buttons. No PowerPoint, no sign up, and the file stays on your device.",
		priority: "0.9",
	},
	{
		path: "/calculator/gcd",
		title: "Greatest common divisor calculator - Utility web",
		description:
			"Find the greatest common divisor of two or more numbers and see every divisor the numbers share, worked out step by step.",
		priority: "0.7",
	},
	{
		path: "/calculator/lcm",
		title: "Least common multiple calculator - Utility web",
		description:
			"Find the least common multiple of two or more numbers, with the prime factors and multiples behind the result.",
		priority: "0.7",
	},
];

export const DEFAULT_SEO = PAGE_SEO[0] as PageSeo;

export const findPageSeo = (pathname: string): PageSeo => {
	const normalized =
		pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
	return PAGE_SEO.find((page) => page.path === normalized) ?? DEFAULT_SEO;
};

export const canonicalUrl = (path: string): string =>
	path === "/" ? `${SITE_URL}/` : `${SITE_URL}${path}`;

// 검색엔진이 사이트 성격을 이해하도록 넣는 구조화 데이터.
export const structuredData = (page: PageSeo): string =>
	JSON.stringify({
		"@context": "https://schema.org",
		"@type": "WebApplication",
		name: page.title,
		description: page.description,
		url: canonicalUrl(page.path),
		applicationCategory: "UtilitiesApplication",
		operatingSystem: "Any browser",
		browserRequirements: "Requires JavaScript",
		isAccessibleForFree: true,
		offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
		publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
	});
