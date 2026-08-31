// 검색 노출용 페이지 메타데이터.
// 런타임(SPA 이동 시 head 갱신)과 빌드 시점(경로별 HTML/sitemap 생성)이
// 같은 표를 쓴다.

export const SITE_URL = "https://www.utilityapp.net";
export const SITE_NAME = "Utility web";
export const OG_IMAGE_PATH = "/og-image.png";

export interface FaqEntry {
	question: string;
	answer: string;
}

export interface PageGuide {
	/** 자바스크립트 실행 전 정적 HTML에 쓰는 제목 */
	heading: string;
	/** 페이지가 무엇을 하는지 한 단락 */
	lead: string;
	stepsTitle: string;
	steps: Array<string>;
	faqTitle: string;
	faq: Array<FaqEntry>;
}

export interface PageSeo {
	path: string;
	title: string;
	description: string;
	/** sitemap.xml의 상대 우선순위 */
	priority: string;
	/** 페이지 본문에 그대로 노출되는 설명. 구조화 데이터와 같은 출처를 쓴다. */
	guide?: PageGuide;
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
		guide: {
			heading: "PDF to PPTX converter",
			lead: "This converter turns each page of a PDF into a slide of a PowerPoint file, so a document you were handed as a PDF can be presented, annotated or edited around in PowerPoint, Keynote or Google Slides. Several PDFs can be merged into one deck in the order you choose. The conversion runs entirely in your browser: the files are read from your device, rendered locally, and the .pptx is assembled in the page. Nothing is uploaded to a server, so there is no queue, no size limit imposed by an upload, and no copy of your document sitting in someone else's storage.",
			stepsTitle: "How to convert a PDF to PPTX",
			steps: [
				"Drop your PDF files onto the box above, or click it to pick them from your device. You can add several files at once — they are sorted by name, and you can drag the handle on each row to reorder them.",
				'Choose the slide size. 16:9 suits most screens, 4:3 matches older projectors, and "Fit to PDF size" keeps the proportions of the original document so nothing is letterboxed.',
				"Pick a render quality. High produces sharper slides and a larger file, Low keeps the file small, and Medium sits between the two.",
				"Name the output file and press Convert to PPTX. The progress bar counts pages as they are rendered, and the .pptx downloads when the last page is done.",
			],
			faqTitle: "Questions about PDF to PPTX conversion",
			faq: [
				{
					question: "Are my files uploaded anywhere?",
					answer:
						"No. The PDF is read with your browser's file API, each page is rendered on a canvas in the page, and the PowerPoint file is built in memory before it is saved to your device. No part of the document is sent over the network.",
				},
				{
					question: "Will the text in the slides be editable in PowerPoint?",
					answer:
						"No. Each page becomes a full-bleed image on its slide, which is what keeps the layout, fonts and vector graphics looking exactly like the original PDF. If you need editable text boxes, a converter that re-flows the document is a better fit, at the cost of layout accuracy.",
				},
				{
					question: "Can I merge several PDFs into one presentation?",
					answer:
						"Yes. Add as many PDFs as you like; every page of every file becomes a slide, following the order shown in the file list. Drag a row by its handle, or use the up and down buttons, to change that order before converting.",
				},
				{
					question: "Is there a page or file size limit?",
					answer:
						"There is no limit imposed by us, because nothing is uploaded. The practical ceiling is your device's memory: a very long document at High quality holds many rendered page images at once, so choose Medium or Low quality for large files.",
				},
				{
					question: "Which slide size should I pick?",
					answer:
						'Choose 16:9 for modern screens and video calls, 4:3 for older projectors and printed handouts, and "Fit to PDF size" when the PDF is an unusual shape — A4 portrait, a poster, a scanned form — and you want the slide to match it rather than adding empty margins.',
				},
				{
					question: "Do the converted files open in Keynote and Google Slides?",
					answer:
						"Yes. The output is a standard .pptx package, and because every slide is a single image it renders the same way in PowerPoint, Keynote, Google Slides and LibreOffice Impress.",
				},
			],
		},
	},
	{
		path: "/pptx-viewer",
		title: "PPTX viewer - open PowerPoint files online - Utility web",
		description:
			"Open a .pptx presentation in your browser and page through the slides with keyboard or buttons. No PowerPoint, no sign up, and the file stays on your device.",
		priority: "0.9",
		guide: {
			heading: "PPTX viewer",
			lead: "This viewer opens a PowerPoint file in your browser so you can read it without installing Office, signing into a cloud account, or converting the deck to something else first. It is meant for the moment you are handed a .pptx and only need to look at it: an attachment on a borrowed laptop, a deck on a machine where you cannot install software, or a file you would rather not upload to a stranger's server. The file is read on your device and rendered in the page — it is never sent anywhere.",
			stepsTitle: "How to open a PPTX file online",
			steps: [
				"Drop the .pptx file onto the box above, or click it to choose one from your device.",
				"Wait a moment while the slides are prepared. Larger decks with many images take longer, since everything is rendered locally.",
				"Move through the deck with the Prev and Next buttons, the left and right arrow keys, or by typing a slide number into the field between them.",
				'Press Fullscreen to fill the screen for reading or presenting, and use "Open another file" when you want to load a different deck.',
			],
			faqTitle: "Questions about the PPTX viewer",
			faq: [
				{
					question: "Is my presentation uploaded to a server?",
					answer:
						"No. The file is opened with your browser's file API and rendered in the page. It stays on your device, which also means the viewer works with no network connection once the page has loaded.",
				},
				{
					question: "Does it look exactly like PowerPoint?",
					answer:
						"Close, but not identical. Text, images, basic shapes and tables render well. Charts, SmartArt, animations, slide transitions and fonts that are not installed on your device can differ from what PowerPoint shows. For a pixel-exact review, open the file in PowerPoint itself.",
				},
				{
					question: "Can I open .ppt files from older versions?",
					answer:
						"No. The legacy binary .ppt format is not supported — only the .pptx package used by PowerPoint 2007 and later. Opening the old file in PowerPoint or Google Slides once and saving it as .pptx is enough to make it readable here.",
				},
				{
					question: "Can I edit the slides here?",
					answer:
						"No, this is a viewer. It renders the deck for reading and presenting; it does not change the file. Nothing you do in the page is written back to your document.",
				},
				{
					question: "Why do some decks render better than others?",
					answer:
						"Presentations built from images — for example a deck produced by our PDF to PPTX converter — render exactly, because each slide is a single picture. Decks that rely on charts, embedded objects or unusual fonts depend on how faithfully those features can be redrawn in a browser.",
				},
			],
		},
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
// FAQ/HowTo는 요즘 리치 결과로 노출되는 경우가 드물지만, 페이지 주제를 명확히
// 전달하는 값은 남아 있다. 본문에 실제로 보이는 문장과 같은 데이터를 쓴다.
export const structuredData = (page: PageSeo): string => {
	const url = canonicalUrl(page.path);

	const application = {
		"@type": "WebApplication",
		"@id": `${url}#app`,
		name: page.title,
		description: page.description,
		url,
		applicationCategory: "UtilitiesApplication",
		operatingSystem: "Any browser",
		browserRequirements: "Requires JavaScript",
		isAccessibleForFree: true,
		offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
		publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
	};

	const graph: Array<unknown> = [application];

	if (page.guide) {
		graph.push({
			"@type": "HowTo",
			"@id": `${url}#howto`,
			name: page.guide.stepsTitle,
			description: page.description,
			step: page.guide.steps.map((text, index) => ({
				"@type": "HowToStep",
				position: index + 1,
				text,
			})),
		});

		graph.push({
			"@type": "FAQPage",
			"@id": `${url}#faq`,
			mainEntity: page.guide.faq.map((entry) => ({
				"@type": "Question",
				name: entry.question,
				acceptedAnswer: { "@type": "Answer", text: entry.answer },
			})),
		});
	}

	return JSON.stringify({ "@context": "https://schema.org", "@graph": graph });
};
