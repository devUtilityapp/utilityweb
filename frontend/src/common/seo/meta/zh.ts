import type { PageMeta } from "../types";

// 直接显示在搜索结果里的标题和描述。
export const META_ZH: Record<string, PageMeta> = {
	"/": {
		title: "Utility web - 免费在线文件、图片与开发工具",
		description:
			"在浏览器里直接使用的免费工具：PDF 转换、合并、拆分、压缩与页面整理，图片转换，二维码与 UUID 生成，JSON 格式化，文本比较，哈希计算，颜色转换。无需上传，无需注册。",
	},
	"/tools": {
		title: "全部工具 - Utility web",
		description:
			"Utility web 的全部工具：PDF 转换、合并、拆分、压缩与页面整理，图片转换，二维码，UUID，Base64，哈希，JSON 与 CSV 互转，文本比较，颜色转换，计算器。全部在浏览器中运行。",
	},
	"/pdf-to-pptx": {
		title: "PDF 转 PPT - 免费、无需上传 - Utility web",
		description:
			"把多个 PDF 合成一份 PowerPoint（.pptx）。每页变成一张幻灯片，可选 16:9、4:3 或原始尺寸。文件不会离开你的浏览器。",
	},
	"/pptx-viewer": {
		title: "PPTX 阅读器 - 在线打开 PowerPoint - Utility web",
		description:
			"在浏览器里打开 .pptx 文件，用键盘或按钮翻页。无需安装 PowerPoint，无需注册，文件始终留在你的设备上。",
	},
	"/pdf-to-images": {
		title: "PDF 转 JPG、PNG - 免费、无需上传 - Utility web",
		description:
			"把 PDF 的每一页转成 PNG、JPG 或 WebP 图片并打包下载。渲染在浏览器里完成，文件不会上传。",
	},
	"/merge-pdf": {
		title: "合并 PDF - 免费、无需上传 - Utility web",
		description:
			"按你选定的顺序把多个 PDF 合成一份文档。处理全在浏览器内完成，文件不会离开你的设备。",
	},
	"/split-pdf": {
		title: "拆分 PDF、提取页面 - 免费、无需上传 - Utility web",
		description:
			"从 PDF 中抽出需要的页，或把文档按页拆成多个文件。支持 1-3, 7, 10- 这样的范围写法，且不会上传。",
	},
	"/compress-pdf": {
		title: "压缩 PDF - 在线免费减小体积 - Utility web",
		description:
			"把超出邮件或上传限制的 PDF 变小。三档压缩强度，压缩前后体积对比，文件不会离开你的浏览器。",
	},
	"/organize-pdf": {
		title: "整理 PDF 页面 - 排序、旋转、删除 - Utility web",
		description:
			"以缩略图查看 PDF 的每一页，调整顺序、旋转或删除后保存。在浏览器中处理，无需上传。",
	},
	"/images-to-pdf": {
		title: "图片转 PDF - JPG、PNG 转 PDF - Utility web",
		description:
			"把 JPG、PNG、WebP、GIF 图片合成一份 PDF。可选 A4、Letter 或与图片同尺寸的页面，且不会上传。",
	},
	"/image-converter": {
		title: "图片转换与缩放 - PNG、JPG、WebP - Utility web",
		description:
			"在 PNG、JPG、WebP 之间转换图片，调整尺寸并压缩体积。可一次处理多张，全在浏览器里完成，无需上传。",
	},
	"/qr-code": {
		title: "二维码生成 - 免费、无需注册 - Utility web",
		description:
			"为链接、文本、Wi-Fi、邮箱或电话号码生成二维码，可下载 PNG 或 SVG。在浏览器中生成，不会统计扫描次数。",
	},
	"/uuid-generator": {
		title: "UUID 生成器 - v4 与 v7、批量生成 - Utility web",
		description:
			"生成随机的 UUID v4 或按时间排序的 v7，一次一个到数千个，格式可选。全部在浏览器里生成。",
	},
	"/base64": {
		title: "Base64 编码与解码 - 文本和文件 - Utility web",
		description:
			"把文本或文件编码为 base64 再解码回来，支持 URL 安全形式。处理全在浏览器内完成，不会上传。",
	},
	"/hash-generator": {
		title: "SHA-256 哈希生成 - 校验文件完整性 - Utility web",
		description:
			"计算文本或文件的 SHA-1、SHA-256、SHA-384、SHA-512，并与公布的校验值比对。无需上传，在你的设备上计算。",
	},
	"/color-converter": {
		title: "颜色转换 - HEX、RGB、HSL、CMYK - Utility web",
		description:
			"把颜色在 HEX、RGB、HSL、HSV、CMYK 之间转换，查看 WCAG 对比度，并取出明暗层次。在浏览器中运行。",
	},
	"/json-formatter": {
		title: "JSON 格式化与校验 - 在线免费 - Utility web",
		description:
			"把 JSON 展开成易读的样子，压回一行，并找出错误所在的行与列。粘贴的内容不会上传。",
	},
	"/csv-to-json": {
		title: "CSV 转 JSON - 也能反向转换 - Utility web",
		description:
			"把 CSV 或 TSV 文件转成 JSON，或把 JSON 数组转回 CSV。带引号的字段和自定义分隔符都能正确处理，且不会上传。",
	},
	"/text-diff": {
		title: "文本比较 - 找出两段文字的差异 - Utility web",
		description:
			"逐行比对两个版本，准确显示新增、删除和未改动的内容。粘贴的文本不会上传。",
	},
	"/word-counter": {
		title: "字数统计 - 词数、字符数与阅读时间 - Utility web",
		description:
			"统计词数、含空格与不含空格的字符数、句数和段落数，并给出阅读时间和最常用的词。写下的内容不会上传。",
	},
	"/calculator/gcd": {
		title: "最大公约数计算器 - Utility web",
		description: "求两个或更多数的最大公约数，并逐一列出它们共有的约数。",
	},
	"/calculator/lcm": {
		title: "最小公倍数计算器 - Utility web",
		description: "求两个或更多数的最小公倍数，并展示推导过程与验算。",
	},
};
