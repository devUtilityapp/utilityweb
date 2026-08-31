/* eslint-disable no-await-in-loop -- 페이지는 메모리 사용량을 낮추기 위해 순차 처리한다 */
import { loadPdfDocument, renderPdfPage } from "./pdfDocument";
import { downloadBlob, stripExtension } from "./download";

export type ImageFormat = "png" | "jpeg" | "webp";
export type RenderQuality = "high" | "medium" | "low";

const RENDER_SCALES: Record<RenderQuality, number> = {
	high: 3,
	medium: 2,
	low: 1,
};

// 저장할 때 쓰는 확장자. jpeg는 관례대로 jpg로 적는다.
const EXTENSIONS: Record<ImageFormat, string> = {
	png: "png",
	jpeg: "jpg",
	webp: "webp",
};

const MIME_TYPES: Record<ImageFormat, string> = {
	png: "image/png",
	jpeg: "image/jpeg",
	webp: "image/webp",
};

const LOSSY_QUALITY = 0.9;

export interface PdfToImagesOptions {
	format: ImageFormat;
	quality: RenderQuality;
	/** 여러 장일 때 zip 이름, 한 장일 때 이미지 이름의 앞부분 */
	baseName?: string;
	onProgress?: (rendered: number, total: number) => void;
}

const canvasToBlob = async (
	canvas: HTMLCanvasElement,
	format: ImageFormat
): Promise<Blob> =>
	new Promise((resolve, reject) => {
		canvas.toBlob(
			(blob) => {
				if (blob) resolve(blob);
				else reject(new Error("Failed to encode the rendered page"));
			},
			MIME_TYPES[format],
			format === "png" ? undefined : LOSSY_QUALITY
		);
	});

/**
 * PDF의 각 페이지를 이미지로 렌더링해 내려받는다.
 * 페이지가 둘 이상이면 zip 하나로 묶는다.
 */
export const convertPdfToImages = async (
	file: File,
	{ format, quality, baseName, onProgress }: PdfToImagesOptions
): Promise<{ pageCount: number; fileName: string }> => {
	const name = baseName?.trim() || stripExtension(file.name) || "pages";
	const scale = RENDER_SCALES[quality];
	const canvas = document.createElement("canvas");
	const pdfDocument = await loadPdfDocument(file);

	try {
		const total = pdfDocument.numPages;
		// 페이지 번호 자리수를 맞춰야 파일 탐색기에서 순서대로 정렬된다.
		const padding = String(total).length;
		const images: Array<{ name: string; blob: Blob }> = [];

		for (let pageNumber = 1; pageNumber <= total; pageNumber++) {
			const page = await pdfDocument.getPage(pageNumber);
			await renderPdfPage(page, scale, canvas);
			page.cleanup();

			images.push({
				name: `${name}-${String(pageNumber).padStart(padding, "0")}.${EXTENSIONS[format]}`,
				blob: await canvasToBlob(canvas, format),
			});
			onProgress?.(pageNumber, total);
		}

		const [single] = images;
		if (images.length === 1 && single) {
			downloadBlob(single.blob, single.name);
			return { pageCount: 1, fileName: single.name };
		}

		const { default: JSZip } = await import("jszip");
		const zip = new JSZip();
		for (const image of images) {
			zip.file(image.name, image.blob);
		}
		const archive = await zip.generateAsync({ type: "blob" });
		const zipName = `${name}.zip`;
		downloadBlob(archive, zipName);

		return { pageCount: images.length, fileName: zipName };
	} finally {
		canvas.width = 0;
		canvas.height = 0;
		await pdfDocument.loadingTask.destroy();
	}
};
