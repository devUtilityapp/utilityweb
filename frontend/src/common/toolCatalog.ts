import { isYoutubeToolEnabled } from "./features";

export interface ToolEntry {
	name: string;
	/** 사이드바에 쓰는 짧은 이름 */
	shortName: string;
	to: string;
	search?: Record<string, string>;
	/** 이름에 없는 말로도 찾을 수 있게 하는 검색어 */
	keywords: Array<string>;
}

export interface ToolCategory {
	title: string;
	tools: Array<ToolEntry>;
}

// 도구 목록의 유일한 출처. Tools 페이지와 사이드바가 같은 표를 쓴다.
const CATEGORIES: Array<ToolCategory> = [
	{
		title: "Youtube",
		tools: isYoutubeToolEnabled
			? [
					{
						name: "Video Downloader",
						shortName: "video downloader",
						to: "/youtube-downloader",
						keywords: ["youtube", "video", "download", "mp4"],
					},
					{
						name: "Tags Extractor",
						shortName: "tag explorer",
						to: "/youtube-downloader",
						search: { info: "tags" },
						keywords: ["youtube", "tags", "seo", "metadata"],
					},
				]
			: [],
	},
	{
		title: "PDF",
		tools: [
			{
				name: "PDF to PPTX",
				shortName: "pdf to pptx",
				to: "/pdf-to-pptx",
				keywords: ["pdf", "pptx", "powerpoint", "slides", "convert"],
			},
			{
				name: "PDF to Images",
				shortName: "pdf to images",
				to: "/pdf-to-images",
				keywords: ["pdf", "png", "jpg", "jpeg", "webp", "image", "convert"],
			},
			{
				name: "Merge PDF",
				shortName: "merge pdf",
				to: "/merge-pdf",
				keywords: ["pdf", "merge", "combine", "join"],
			},
			{
				name: "Split PDF",
				shortName: "split pdf",
				to: "/split-pdf",
				keywords: ["pdf", "split", "extract", "pages", "rotate"],
			},
			{
				name: "Compress PDF",
				shortName: "compress pdf",
				to: "/compress-pdf",
				keywords: ["pdf", "compress", "smaller", "reduce", "size", "shrink"],
			},
			{
				name: "Organize PDF",
				shortName: "organize pdf",
				to: "/organize-pdf",
				keywords: ["pdf", "reorder", "rotate", "delete", "pages", "organize"],
			},
		],
	},
	{
		title: "Image",
		tools: [
			{
				name: "Images to PDF",
				shortName: "images to pdf",
				to: "/images-to-pdf",
				keywords: ["image", "jpg", "png", "pdf", "scan", "convert"],
			},
			{
				name: "Image Converter",
				shortName: "image converter",
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
		title: "PPTX",
		tools: [
			{
				name: "PPTX Viewer",
				shortName: "pptx viewer",
				to: "/pptx-viewer",
				keywords: ["pptx", "powerpoint", "viewer", "open", "slides"],
			},
		],
	},
	{
		title: "Generator",
		tools: [
			{
				name: "QR Code",
				shortName: "qr code",
				to: "/qr-code",
				keywords: ["qr", "code", "wifi", "link", "generator"],
			},
			{
				name: "UUID Generator",
				shortName: "uuid generator",
				to: "/uuid-generator",
				keywords: ["uuid", "guid", "identifier", "v4", "v7", "random"],
			},
		],
	},
	{
		title: "Developer",
		tools: [
			{
				name: "Base64",
				shortName: "base64",
				to: "/base64",
				keywords: ["base64", "encode", "decode", "data uri"],
			},
			{
				name: "Hash Generator",
				shortName: "hash generator",
				to: "/hash-generator",
				keywords: ["hash", "sha256", "sha", "checksum", "md5", "verify"],
			},
			{
				name: "Color Converter",
				shortName: "color converter",
				to: "/color-converter",
				keywords: ["color", "colour", "hex", "rgb", "hsl", "cmyk", "contrast"],
			},
		],
	},
	{
		title: "Text",
		tools: [
			{
				name: "JSON Formatter",
				shortName: "json formatter",
				to: "/json-formatter",
				keywords: ["json", "format", "beautify", "minify", "validate"],
			},
			{
				name: "CSV to JSON",
				shortName: "csv to json",
				to: "/csv-to-json",
				keywords: ["csv", "json", "tsv", "convert", "spreadsheet"],
			},
			{
				name: "Text Compare",
				shortName: "text compare",
				to: "/text-diff",
				keywords: ["diff", "compare", "difference", "text", "changes"],
			},
			{
				name: "Word Counter",
				shortName: "word counter",
				to: "/word-counter",
				keywords: ["word", "character", "count", "text", "reading time"],
			},
		],
	},
	{
		title: "Calculator",
		tools: [
			{
				name: "Greatest Common Divisor",
				shortName: "greatest common divisor",
				to: "/calculator/gcd",
				keywords: ["gcd", "divisor", "math", "calculator"],
			},
			{
				name: "Least Common Multiple",
				shortName: "least common multiple",
				to: "/calculator/lcm",
				keywords: ["lcm", "multiple", "math", "calculator"],
			},
		],
	},
];

export const TOOL_CATEGORIES: Array<ToolCategory> = CATEGORIES.filter(
	(category) => category.tools.length > 0
);

/** 이름과 검색어에 질의가 들어간 도구만 남긴다. 빈 카테고리는 지운다. */
export const filterCategories = (query: string): Array<ToolCategory> => {
	const needle = query.trim().toLowerCase();
	if (needle === "") return TOOL_CATEGORIES;

	return TOOL_CATEGORIES.map((category) => ({
		title: category.title,
		tools: category.tools.filter((tool) =>
			[tool.name, category.title, ...tool.keywords]
				.join(" ")
				.toLowerCase()
				.includes(needle)
		),
	})).filter((category) => category.tools.length > 0);
};
