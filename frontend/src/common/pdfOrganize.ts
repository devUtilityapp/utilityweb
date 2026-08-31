/* eslint-disable no-await-in-loop -- 페이지는 메모리 사용량을 낮추기 위해 순차 처리한다 */
import { PDFDocument, degrees } from "pdf-lib";
import { loadPdfDocument, renderPdfPage } from "./pdfDocument";
import { downloadBlob } from "./download";

export interface PageItem {
	id: string;
	/** 원본 문서에서의 0부터 시작하는 위치 */
	index: number;
	thumbnail: string;
	rotation: number;
}

// 썸네일은 목록에 여러 장이 한꺼번에 뜨므로 작게 그린다.
const THUMBNAIL_WIDTH = 200;

/** 페이지마다 미리보기 이미지를 만든다. 목록을 눈으로 보고 정리할 수 있게 한다. */
export const renderThumbnails = async (
	file: File,
	onProgress?: (done: number, total: number) => void
): Promise<Array<{ index: number; thumbnail: string }>> => {
	const canvas = document.createElement("canvas");
	const document_ = await loadPdfDocument(file);

	try {
		const total = document_.numPages;
		const thumbnails: Array<{ index: number; thumbnail: string }> = [];

		for (let pageNumber = 1; pageNumber <= total; pageNumber++) {
			const page = await document_.getPage(pageNumber);
			const { width } = page.getViewport({ scale: 1 });
			await renderPdfPage(page, THUMBNAIL_WIDTH / width, canvas);
			page.cleanup();

			thumbnails.push({
				index: pageNumber - 1,
				thumbnail: canvas.toDataURL("image/jpeg", 0.7),
			});
			onProgress?.(pageNumber, total);
		}

		return thumbnails;
	} finally {
		canvas.width = 0;
		canvas.height = 0;
		await document_.loadingTask.destroy();
	}
};

/** 화면에서 정리한 순서와 회전을 그대로 새 PDF로 저장한다. */
export const applyPageChanges = async (
	file: File,
	pages: Array<{ index: number; rotation: number }>,
	fileName: string
): Promise<number> => {
	if (pages.length === 0) {
		throw new Error("At least one page has to stay in the document");
	}

	const source = await PDFDocument.load(await file.arrayBuffer(), {
		ignoreEncryption: true,
	});
	const output = await PDFDocument.create();
	const copied = await output.copyPages(
		source,
		pages.map((page) => page.index)
	);

	for (const [position, page] of copied.entries()) {
		const rotation = pages[position]?.rotation ?? 0;
		// 원래 페이지에 이미 회전이 걸려 있을 수 있으므로 더한다.
		page.setRotation(degrees((page.getRotation().angle + rotation) % 360));
		output.addPage(page);
	}

	output.setProducer("utilityapp.net");
	const bytes = await output.save();
	downloadBlob(
		new Blob([bytes.slice().buffer as ArrayBuffer], {
			type: "application/pdf",
		}),
		fileName
	);

	return pages.length;
};
