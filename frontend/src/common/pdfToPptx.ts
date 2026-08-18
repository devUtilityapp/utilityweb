/* eslint-disable no-await-in-loop -- 페이지 렌더링은 메모리 사용량을 낮추기 위해 순차 처리한다 */
import * as pdfjsLib from "pdfjs-dist";
import PdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?worker";
import PptxGenJS from "pptxgenjs";

pdfjsLib.GlobalWorkerOptions.workerPort = new PdfWorker();

export type SlideSize = "16:9" | "4:3" | "fit";
export type RenderQuality = "high" | "medium" | "low";

const RENDER_SCALES: Record<RenderQuality, number> = {
	high: 2,
	medium: 1.5,
	low: 1,
};

// 슬라이드 가로 길이(inch). 높이는 비율에 맞춰 계산한다.
const SLIDE_WIDTH_INCH = 10;
const SLIDE_RATIOS: Record<Exclude<SlideSize, "fit">, number> = {
	"16:9": 16 / 9,
	"4:3": 4 / 3,
};

const JPEG_QUALITY = 0.85;

export interface ConvertOptions {
	slideSize: SlideSize;
	quality: RenderQuality;
	fileName: string;
	onProgress?: (rendered: number, total: number) => void;
}

const readFileAsArrayBuffer = async (file: File): Promise<ArrayBuffer> =>
	file.arrayBuffer();

const loadDocument = async (file: File): Promise<pdfjsLib.PDFDocumentProxy> => {
	const data = await readFileAsArrayBuffer(file);
	return pdfjsLib.getDocument({ data: new Uint8Array(data) }).promise;
};

export const getPdfPageCount = async (file: File): Promise<number> => {
	const pdfDocument = await loadDocument(file);
	const pageCount = pdfDocument.numPages;
	await pdfDocument.loadingTask.destroy();
	return pageCount;
};

interface RenderedPage {
	dataUrl: string;
	width: number;
	height: number;
}

const renderPage = async (
	page: pdfjsLib.PDFPageProxy,
	scale: number,
	canvas: HTMLCanvasElement
): Promise<RenderedPage> => {
	const viewport = page.getViewport({ scale });
	const context = canvas.getContext("2d");
	if (!context) {
		throw new Error("Canvas 2D context is not available");
	}

	canvas.width = Math.floor(viewport.width);
	canvas.height = Math.floor(viewport.height);
	context.fillStyle = "#ffffff";
	context.fillRect(0, 0, canvas.width, canvas.height);

	await page.render({ canvas, canvasContext: context, viewport }).promise;

	return {
		dataUrl: canvas.toDataURL("image/jpeg", JPEG_QUALITY),
		width: viewport.width,
		height: viewport.height,
	};
};

// 슬라이드 안에 원본 비율 그대로(letterbox) 들어가도록 위치와 크기를 계산한다.
const fitToSlide = (
	page: RenderedPage,
	slideWidth: number,
	slideHeight: number
): { x: number; y: number; w: number; h: number } => {
	const scale = Math.min(slideWidth / page.width, slideHeight / page.height);
	const width = page.width * scale;
	const height = page.height * scale;

	return {
		x: (slideWidth - width) / 2,
		y: (slideHeight - height) / 2,
		w: width,
		h: height,
	};
};

export const convertPdfsToPptx = async (
	files: Array<File>,
	{ slideSize, quality, fileName, onProgress }: ConvertOptions
): Promise<void> => {
	if (files.length === 0) {
		throw new Error("No PDF files selected");
	}

	const scale = RENDER_SCALES[quality];
	const canvas = document.createElement("canvas");
	const documents: Array<pdfjsLib.PDFDocumentProxy> = [];

	try {
		for (const file of files) {
			documents.push(await loadDocument(file));
		}

		const totalPages = documents.reduce(
			(total, pdfDocument) => total + pdfDocument.numPages,
			0
		);

		const pptx = new PptxGenJS();
		const slideWidth = SLIDE_WIDTH_INCH;
		let slideHeight = SLIDE_WIDTH_INCH / SLIDE_RATIOS["16:9"];
		let layoutDefined = false;

		if (slideSize !== "fit") {
			slideHeight = SLIDE_WIDTH_INCH / SLIDE_RATIOS[slideSize];
			pptx.defineLayout({
				name: `PDF_${slideSize.replace(":", "x")}`,
				width: slideWidth,
				height: slideHeight,
			});
			pptx.layout = `PDF_${slideSize.replace(":", "x")}`;
			layoutDefined = true;
		}

		let rendered = 0;

		for (const pdfDocument of documents) {
			for (
				let pageNumber = 1;
				pageNumber <= pdfDocument.numPages;
				pageNumber++
			) {
				const page = await pdfDocument.getPage(pageNumber);
				const renderedPage = await renderPage(page, scale, canvas);
				page.cleanup();

				// "fit" 모드는 첫 페이지 비율을 슬라이드 크기로 사용한다.
				if (!layoutDefined) {
					slideHeight =
						(SLIDE_WIDTH_INCH * renderedPage.height) / renderedPage.width;
					pptx.defineLayout({
						name: "PDF_FIT",
						width: slideWidth,
						height: slideHeight,
					});
					pptx.layout = "PDF_FIT";
					layoutDefined = true;
				}

				const slide = pptx.addSlide();
				slide.background = { color: "FFFFFF" };
				slide.addImage({
					data: renderedPage.dataUrl,
					...fitToSlide(renderedPage, slideWidth, slideHeight),
				});

				rendered++;
				onProgress?.(rendered, totalPages);
			}
		}

		await pptx.writeFile({ fileName, compression: true });
	} finally {
		canvas.width = 0;
		canvas.height = 0;
		for (const pdfDocument of documents) {
			await pdfDocument.loadingTask.destroy();
		}
	}
};
