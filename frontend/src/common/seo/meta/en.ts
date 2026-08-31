import type { PageMeta } from "../types";

// 검색 결과에 그대로 나오는 제목과 설명.
export const META_EN: Record<string, PageMeta> = {
	"/": {
		title: "Utility web - free online file, image and developer tools",
		description:
			"Free browser based tools: convert, merge, split, compress and organize PDFs, convert images, make QR codes and UUIDs, format JSON, compare text, hash files and convert colors. No upload, no sign up.",
	},
	"/tools": {
		title: "All tools - Utility web",
		description:
			"Browse every Utility web tool: PDF conversion, merging, splitting, compression and page organizing, image conversion, QR codes, UUIDs, base64, hashes, JSON and CSV conversion, text comparison, colour conversion and calculators. Everything runs in your browser.",
	},
	"/pdf-to-pptx": {
		title: "PDF to PPTX converter - free, no upload - Utility web",
		description:
			"Convert one or more PDF files into a single PowerPoint (.pptx) presentation. Pages become slides at 16:9, 4:3 or the original size. Files never leave your browser.",
	},
	"/pptx-viewer": {
		title: "PPTX viewer - open PowerPoint files online - Utility web",
		description:
			"Open a .pptx presentation in your browser and page through the slides with keyboard or buttons. No PowerPoint, no sign up, and the file stays on your device.",
	},
	"/pdf-to-images": {
		title: "PDF to JPG and PNG converter - free, no upload - Utility web",
		description:
			"Turn every page of a PDF into a PNG, JPG or WebP image and download them as a ZIP. The file is rendered in your browser and never uploaded.",
	},
	"/merge-pdf": {
		title: "Merge PDF files online - free, no upload - Utility web",
		description:
			"Combine several PDF files into one document in the order you choose. The merge happens in your browser, so the files never leave your device.",
	},
	"/split-pdf": {
		title: "Split PDF and extract pages - free, no upload - Utility web",
		description:
			"Pull selected pages out of a PDF, or split a document into one file per page. Ranges like 1-3, 7, 10- are supported and nothing is uploaded.",
	},
	"/images-to-pdf": {
		title: "Images to PDF converter - JPG and PNG to PDF - Utility web",
		description:
			"Combine JPG, PNG, WebP or GIF images into a single PDF with A4, Letter or fit-to-image pages. Runs in your browser with no upload.",
	},
	"/image-converter": {
		title: "Image converter and resizer - PNG, JPG, WebP - Utility web",
		description:
			"Convert images between PNG, JPG and WebP, resize them, and compress them to a smaller file. Batch conversion in your browser with no upload.",
	},
	"/qr-code": {
		title: "QR code generator - free, no sign up - Utility web",
		description:
			"Create a QR code for a link, text, Wi-Fi network, email or phone number, and download it as PNG or SVG. Generated in your browser, no tracking.",
	},
	"/json-formatter": {
		title: "JSON formatter and validator - free online - Utility web",
		description:
			"Format, minify and validate JSON in your browser. Errors are reported with the line and column, and nothing you paste is uploaded.",
	},
	"/word-counter": {
		title: "Word counter - words, characters and reading time - Utility web",
		description:
			"Count words, characters with and without spaces, sentences and paragraphs, with reading time and keyword frequency. Nothing you type is uploaded.",
	},
	"/compress-pdf": {
		title: "Compress PDF - make a PDF smaller online - Utility web",
		description:
			"Shrink a PDF that is too large to email or upload. Three compression levels, a before and after size, and the file never leaves your browser.",
	},
	"/organize-pdf": {
		title: "Organize PDF pages - reorder, rotate, delete - Utility web",
		description:
			"See every page of a PDF as a thumbnail, then reorder, rotate or delete pages and save the result. Runs in your browser with no upload.",
	},
	"/base64": {
		title: "Base64 encoder and decoder - text and files - Utility web",
		description:
			"Encode text or a file to base64 and decode it back, with URL-safe output. Everything is processed in your browser and never uploaded.",
	},
	"/hash-generator": {
		title: "SHA-256 hash generator - checksum for text and files - Utility web",
		description:
			"Generate SHA-1, SHA-256, SHA-384 and SHA-512 hashes for text or a file, and compare against an expected checksum. Nothing is uploaded.",
	},
	"/uuid-generator": {
		title: "UUID generator - v4 and v7, bulk - Utility web",
		description:
			"Generate random UUID v4 or time-ordered UUID v7 identifiers, one or thousands at a time, in the format you need. Generated in your browser.",
	},
	"/csv-to-json": {
		title: "CSV to JSON converter - and back - Utility web",
		description:
			"Convert a CSV or TSV file into JSON, or turn a JSON array back into CSV. Quoted fields and custom delimiters are handled, and nothing is uploaded.",
	},
	"/text-diff": {
		title: "Text compare - find the difference between two texts - Utility web",
		description:
			"Compare two versions of a text or a file line by line and see exactly what was added, removed or left alone. Nothing you paste is uploaded.",
	},
	"/color-converter": {
		title: "Color converter - HEX, RGB, HSL, CMYK - Utility web",
		description:
			"Convert a color between HEX, RGB, HSL, HSV and CMYK, check its WCAG contrast, and pull a set of tints and shades. Runs in your browser.",
	},
	"/unit-converter": {
		title: "Unit converter - length, weight, temperature - Utility web",
		description:
			"Convert between metric and imperial units for length, weight, temperature, area, volume, speed, data and time. Free, instant, and it runs in your browser.",
	},
	"/password-generator": {
		title: "Strong password generator - free, nothing stored - Utility web",
		description:
			"Generate a strong random password with the length and character types you choose. Created by your browser's cryptographic generator and never sent anywhere.",
	},
	"/date-calculator": {
		title: "Date calculator - days between dates - Utility web",
		description:
			"Count the days, weeks and business days between two dates, or find the date a set period before or after another. Calendar months and leap years handled.",
	},
	"/timestamp-converter": {
		title: "Unix timestamp converter - epoch to date - Utility web",
		description:
			"Convert a Unix timestamp to a readable date and back again. Seconds and milliseconds are detected automatically, with ISO, UTC and local time side by side.",
	},
	"/regex-tester": {
		title: "Regex tester - test and debug regular expressions - Utility web",
		description:
			"Test a regular expression against your text with every match highlighted, captured groups listed and a replacement preview. Nothing you paste is uploaded.",
	},
	"/jwt-decoder": {
		title: "JWT decoder - read and verify a token - Utility web",
		description:
			"Decode a JSON Web Token to see its header, claims and expiry, and check an HS256 signature against your secret. The token stays in your browser.",
	},
	"/calculator/gcd": {
		title: "Greatest common divisor calculator - Utility web",
		description:
			"Find the greatest common divisor of two or more numbers and see every divisor the numbers share, worked out step by step.",
	},
	"/calculator/lcm": {
		title: "Least common multiple calculator - Utility web",
		description:
			"Find the least common multiple of two or more numbers, with the prime factors and multiples behind the result.",
	},
};
