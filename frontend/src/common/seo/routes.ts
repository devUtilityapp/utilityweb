import { localizePath, type Language } from "../languages";

export const SITE_URL = "https://www.utilityapp.net";
export const SITE_NAME = "Utility web";
export const OG_IMAGE_PATH = "/og-image.png";

export interface SeoRoute {
	path: string;
	/** sitemap.xml의 상대 우선순위 */
	priority: string;
}

// 경로를 추가하면 vercel.json의 rewrites에도 같은 경로를 언어마다 넣어야
// 크롤러가 그 경로의 정적 HTML을 받는다.
export const SEO_ROUTES: Array<SeoRoute> = [
	{ path: "/", priority: "1.0" },
	{ path: "/tools", priority: "0.9" },
	{ path: "/pdf-to-pptx", priority: "0.9" },
	{ path: "/pptx-viewer", priority: "0.9" },
	{ path: "/pdf-to-images", priority: "0.9" },
	{ path: "/merge-pdf", priority: "0.9" },
	{ path: "/split-pdf", priority: "0.9" },
	{ path: "/images-to-pdf", priority: "0.9" },
	{ path: "/image-converter", priority: "0.9" },
	{ path: "/qr-code", priority: "0.9" },
	{ path: "/json-formatter", priority: "0.8" },
	{ path: "/word-counter", priority: "0.8" },
	{ path: "/compress-pdf", priority: "0.9" },
	{ path: "/organize-pdf", priority: "0.9" },
	{ path: "/base64", priority: "0.8" },
	{ path: "/hash-generator", priority: "0.8" },
	{ path: "/uuid-generator", priority: "0.8" },
	{ path: "/csv-to-json", priority: "0.8" },
	{ path: "/text-diff", priority: "0.8" },
	{ path: "/color-converter", priority: "0.8" },
	{ path: "/calculator/gcd", priority: "0.7" },
	{ path: "/calculator/lcm", priority: "0.7" },
];

export const canonicalUrl = (path: string, language: Language): string => {
	const localized = localizePath(path, language);
	return localized === "/" ? `${SITE_URL}/` : `${SITE_URL}${localized}`;
};
