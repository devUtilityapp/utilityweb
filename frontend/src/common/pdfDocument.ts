import * as pdfjsLib from "pdfjs-dist";
import PdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?worker";

// 워커는 한 번만 띄운다. pdf를 쓰는 모든 도구가 이 모듈을 거치게 해서
// 페이지마다 워커가 새로 생기는 일을 막는다.
pdfjsLib.GlobalWorkerOptions.workerPort = new PdfWorker();

/** 파일 하나를 pdf.js 문서로 연다. 다 쓰면 loadingTask.destroy()를 불러야 한다. */
export const loadPdfDocument = async (
	file: File
): Promise<pdfjsLib.PDFDocumentProxy> => {
	const data = await file.arrayBuffer();
	return pdfjsLib.getDocument({
		data: new Uint8Array(data),
		// vite.config.ts의 static copy로 배포되는 pdf.js 리소스 위치.
		standardFontDataUrl: "/pdfjs/standard_fonts/",
		cMapUrl: "/pdfjs/cmaps/",
		cMapPacked: true,
	}).promise;
};

export const getPdfPageCount = async (file: File): Promise<number> => {
	const pdfDocument = await loadPdfDocument(file);
	const pageCount = pdfDocument.numPages;
	await pdfDocument.loadingTask.destroy();
	return pageCount;
};

/** 페이지를 캔버스에 그린다. 캔버스를 재사용해 메모리 사용량을 낮춘다. */
export const renderPdfPage = async (
	page: pdfjsLib.PDFPageProxy,
	scale: number,
	canvas: HTMLCanvasElement
): Promise<{ width: number; height: number }> => {
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

	return { width: viewport.width, height: viewport.height };
};

export type { PDFDocumentProxy, PDFPageProxy } from "pdfjs-dist";
