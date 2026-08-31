/* eslint-disable no-await-in-loop -- 페이지는 메모리 사용량을 낮추기 위해 순차 처리한다 */
import { PDFDocument } from "pdf-lib";
import { loadPdfDocument, renderPdfPage } from "./pdfDocument";
import { downloadBlob } from "./download";

export type CompressionLevel = "light" | "balanced" | "strong";

interface Preset {
	/** 원본 크기 대비 렌더 배율. 1보다 작으면 해상도를 줄인다. */
	scale: number;
	quality: number;
}

const PRESETS: Record<CompressionLevel, Preset> = {
	light: { scale: 1.5, quality: 0.82 },
	balanced: { scale: 1, quality: 0.7 },
	strong: { scale: 0.7, quality: 0.55 },
};

export interface CompressOptions {
	level: CompressionLevel;
	fileName: string;
	onProgress?: (done: number, total: number) => void;
}

export interface CompressResult {
	before: number;
	after: number;
	pages: number;
}

const canvasToJpeg = async (
	canvas: HTMLCanvasElement,
	quality: number
): Promise<ArrayBuffer> => {
	const blob = await new Promise<Blob | null>((resolve) => {
		canvas.toBlob(resolve, "image/jpeg", quality);
	});
	if (!blob) throw new Error("Failed to encode a page");
	return blob.arrayBuffer();
};

/**
 * 페이지를 JPEG으로 다시 그려 새 PDF를 만든다.
 * 스캔본처럼 이미지가 대부분인 문서에서 크게 줄어드는 대신,
 * 글자는 이미지가 되므로 더 이상 선택하거나 검색할 수 없다.
 */
export const compressPdf = async (
	file: File,
	{ level, fileName, onProgress }: CompressOptions
): Promise<CompressResult> => {
	const preset = PRESETS[level];
	const canvas = document.createElement("canvas");
	const source = await loadPdfDocument(file);

	try {
		const total = source.numPages;
		const output = await PDFDocument.create();

		for (let pageNumber = 1; pageNumber <= total; pageNumber++) {
			const page = await source.getPage(pageNumber);
			// 페이지의 원래 크기(포인트)를 유지해야 인쇄 크기가 달라지지 않는다.
			const { width, height } = page.getViewport({ scale: 1 });
			await renderPdfPage(page, preset.scale, canvas);
			page.cleanup();

			const image = await output.embedJpg(
				await canvasToJpeg(canvas, preset.quality)
			);
			const target = output.addPage([width, height]);
			target.drawImage(image, { x: 0, y: 0, width, height });

			onProgress?.(pageNumber, total);
		}

		output.setProducer("utilityapp.net");
		const bytes = await output.save();
		downloadBlob(
			new Blob([bytes.slice().buffer as ArrayBuffer], {
				type: "application/pdf",
			}),
			fileName
		);

		return { before: file.size, after: bytes.length, pages: total };
	} finally {
		canvas.width = 0;
		canvas.height = 0;
		await source.loadingTask.destroy();
	}
};
