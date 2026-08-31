import { isYoutubeToolEnabled } from "./features";

export interface ToolEntry {
	/** translations.json의 tools.* 키. 이름과 사이드바용 짧은 이름을 함께 찾는다. */
	key: string;
	to: string;
	search?: Record<string, string>;
	/** 이름에 없는 말로도 찾을 수 있게 하는 검색어. 언어와 무관한 영문 약어. */
	keywords: Array<string>;
}

export interface ToolCategory {
	/** translations.json의 categories.* 키 */
	key: string;
	tools: Array<ToolEntry>;
}

// 도구 목록의 유일한 출처. Tools 페이지와 사이드바가 같은 표를 쓴다.
// 화면에 보이는 이름은 언어마다 다르므로 여기에는 키만 둔다.
const CATEGORIES: Array<ToolCategory> = [
	{
		key: "youtube",
		tools: isYoutubeToolEnabled
			? [
					{
						key: "youtubeVideo",
						to: "/youtube-downloader",
						keywords: ["youtube", "video", "download", "mp4"],
					},
					{
						key: "youtubeTags",
						to: "/youtube-downloader",
						search: { info: "tags" },
						keywords: ["youtube", "tags", "seo", "metadata"],
					},
				]
			: [],
	},
	{
		key: "pdf",
		tools: [
			{
				key: "pdfToPptx",
				to: "/pdf-to-pptx",
				keywords: ["pdf", "pptx", "powerpoint", "slides", "convert"],
			},
			{
				key: "pdfToImages",
				to: "/pdf-to-images",
				keywords: ["pdf", "png", "jpg", "jpeg", "webp", "image", "convert"],
			},
			{
				key: "mergePdf",
				to: "/merge-pdf",
				keywords: ["pdf", "merge", "combine", "join"],
			},
			{
				key: "splitPdf",
				to: "/split-pdf",
				keywords: ["pdf", "split", "extract", "pages", "rotate"],
			},
			{
				key: "compressPdf",
				to: "/compress-pdf",
				keywords: ["pdf", "compress", "smaller", "reduce", "size", "shrink"],
			},
			{
				key: "organizePdf",
				to: "/organize-pdf",
				keywords: ["pdf", "reorder", "rotate", "delete", "pages", "organize"],
			},
		],
	},
	{
		key: "image",
		tools: [
			{
				key: "imagesToPdf",
				to: "/images-to-pdf",
				keywords: ["image", "jpg", "png", "pdf", "scan", "convert"],
			},
			{
				key: "imageConverter",
				to: "/image-converter",
				keywords: [
					"image",
					"png",
					"jpg",
					"webp",
					"resize",
					"compress",
					"convert",
				],
			},
		],
	},
	{
		key: "pptx",
		tools: [
			{
				key: "pptxViewer",
				to: "/pptx-viewer",
				keywords: ["pptx", "powerpoint", "viewer", "open", "slides"],
			},
		],
	},
	{
		key: "generator",
		tools: [
			{
				key: "qrCode",
				to: "/qr-code",
				keywords: ["qr", "code", "wifi", "link", "generator"],
			},
			{
				key: "uuidGenerator",
				to: "/uuid-generator",
				keywords: ["uuid", "guid", "identifier", "v4", "v7", "random"],
			},
			{
				key: "passwordGenerator",
				to: "/password-generator",
				keywords: ["password", "passphrase", "random", "secure", "generator"],
			},
		],
	},
	{
		key: "developer",
		tools: [
			{
				key: "base64",
				to: "/base64",
				keywords: ["base64", "encode", "decode", "data uri"],
			},
			{
				key: "hashGenerator",
				to: "/hash-generator",
				keywords: ["hash", "sha256", "sha", "checksum", "md5", "verify"],
			},
			{
				key: "colorConverter",
				to: "/color-converter",
				keywords: ["color", "colour", "hex", "rgb", "hsl", "cmyk", "contrast"],
			},
			{
				key: "jwtDecoder",
				to: "/jwt-decoder",
				keywords: ["jwt", "token", "decode", "bearer", "claims", "hs256"],
			},
			{
				key: "timestampConverter",
				to: "/timestamp-converter",
				keywords: ["timestamp", "unix", "epoch", "iso", "date", "convert"],
			},
			{
				key: "regexTester",
				to: "/regex-tester",
				keywords: ["regex", "regexp", "pattern", "match", "replace"],
			},
		],
	},
	{
		key: "text",
		tools: [
			{
				key: "jsonFormatter",
				to: "/json-formatter",
				keywords: ["json", "format", "beautify", "minify", "validate"],
			},
			{
				key: "csvToJson",
				to: "/csv-to-json",
				keywords: ["csv", "json", "tsv", "convert", "spreadsheet"],
			},
			{
				key: "textDiff",
				to: "/text-diff",
				keywords: ["diff", "compare", "difference", "text", "changes"],
			},
			{
				key: "wordCounter",
				to: "/word-counter",
				keywords: ["word", "character", "count", "text", "reading time"],
			},
		],
	},
	{
		key: "calculator",
		tools: [
			{
				key: "gcd",
				to: "/calculator/gcd",
				keywords: ["gcd", "divisor", "math", "calculator"],
			},
			{
				key: "lcm",
				to: "/calculator/lcm",
				keywords: ["lcm", "multiple", "math", "calculator"],
			},
			{
				key: "unitConverter",
				to: "/unit-converter",
				keywords: [
					"unit",
					"convert",
					"length",
					"weight",
					"temperature",
					"km",
					"mile",
				],
			},
			{
				key: "dateCalculator",
				to: "/date-calculator",
				keywords: ["date", "days", "between", "difference", "add", "duration"],
			},
		],
	},
];

export const TOOL_CATEGORIES: Array<ToolCategory> = CATEGORIES.filter(
	(category) => category.tools.length > 0
);

/** 경로로 도구를 찾는다. */
export const findTool = (path: string): ToolEntry | undefined =>
	TOOL_CATEGORIES.flatMap((category) => category.tools).find(
		(tool) => tool.to === path
	);

/**
 * 지금 보고 있는 도구 옆에 놓을 만한 도구들.
 * 같은 분류를 먼저 채우고, 모자라면 다른 분류에서 이어 붙인다.
 * 한 도구를 끝낸 사람이 다음에 뭘 할지 찾아 사이드바를 뒤지지 않게 하려는 것이다.
 */
export const relatedTools = (path: string, count = 4): Array<ToolEntry> => {
	const own = TOOL_CATEGORIES.find((category) =>
		category.tools.some((tool) => tool.to === path)
	);

	const sameCategory = (own?.tools ?? []).filter((tool) => tool.to !== path);
	if (sameCategory.length >= count) return sameCategory.slice(0, count);

	const others = TOOL_CATEGORIES.filter(
		(category) => category.key !== own?.key
	).flatMap((category) => category.tools);

	return [...sameCategory, ...others].slice(0, count);
};

/**
 * 이름과 검색어에 질의가 들어간 도구만 남긴다. 빈 카테고리는 지운다.
 * 이름은 언어마다 달라서 화면 쪽에서 번역한 문자열을 넘겨준다.
 */
export const filterCategories = (
	query: string,
	searchTextOf: (category: ToolCategory, tool: ToolEntry) => string
): Array<ToolCategory> => {
	const needle = query.trim().toLowerCase();
	if (needle === "") return TOOL_CATEGORIES;

	return TOOL_CATEGORIES.map((category) => ({
		key: category.key,
		tools: category.tools.filter((tool) =>
			searchTextOf(category, tool).toLowerCase().includes(needle)
		),
	})).filter((category) => category.tools.length > 0);
};
