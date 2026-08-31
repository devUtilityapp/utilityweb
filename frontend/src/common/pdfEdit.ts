/* eslint-disable no-await-in-loop -- 문서는 메모리 사용량을 낮추기 위해 순차 처리한다 */
import { PDFDocument, degrees } from "pdf-lib";
import { downloadBlob, stripExtension } from "./download";

const PDF_MIME = "application/pdf";

const toPdfBlob = (bytes: Uint8Array): Blob =>
	// Blob은 ArrayBuffer만 받으므로 뷰가 아닌 실제 버퍼를 잘라 넘긴다.
	new Blob([bytes.slice().buffer as ArrayBuffer], { type: PDF_MIME });

/** 암호가 걸린 PDF도 페이지 구조만 읽을 수 있으면 다루도록 허용한다. */
const openPdf = async (file: File): Promise<PDFDocument> =>
	PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: true });

export interface MergeOptions {
	fileName: string;
	onProgress?: (done: number, total: number) => void;
}

/** 여러 PDF를 순서대로 이어 붙여 하나로 내려받는다. */
export const mergePdfs = async (
	files: Array<File>,
	{ fileName, onProgress }: MergeOptions
): Promise<number> => {
	if (files.length < 2) {
		throw new Error("Please add at least two PDF files to merge");
	}

	const merged = await PDFDocument.create();
	let copied = 0;

	for (const [index, file] of files.entries()) {
		const source = await openPdf(file);
		const pages = await merged.copyPages(source, source.getPageIndices());
		for (const page of pages) {
			merged.addPage(page);
		}
		copied += pages.length;
		onProgress?.(index + 1, files.length);
	}

	merged.setProducer("utilityapp.net");
	downloadBlob(toPdfBlob(await merged.save()), fileName);
	return copied;
};

/**
 * "1-3, 5, 8-" 같은 표기를 0부터 시작하는 페이지 번호 배열로 바꾼다.
 * 범위가 겹쳐도 한 번만 담고, 적은 순서대로 유지한다.
 */
export const parsePageRanges = (
	input: string,
	pageCount: number
): Array<number> => {
	const indices: Array<number> = [];
	const seen = new Set<number>();

	for (const rawPart of input.split(",")) {
		const part = rawPart.trim();
		if (part === "") continue;

		const match = /^(\d+)?\s*(-)?\s*(\d+)?$/.exec(part);
		if (!match || (!match[1] && !match[3])) {
			throw new Error(`Cannot read the page range "${part}"`);
		}

		const isRange = match[2] === "-";
		const start = match[1] ? Number(match[1]) : 1;
		const end = isRange ? (match[3] ? Number(match[3]) : pageCount) : start;

		if (start < 1 || end < 1 || start > pageCount || end > pageCount) {
			throw new Error(
				`Page ${start > pageCount ? start : end} is outside this document (1-${pageCount})`
			);
		}
		if (start > end) {
			throw new Error(`"${part}" starts after it ends`);
		}

		for (let pageNumber = start; pageNumber <= end; pageNumber++) {
			if (!seen.has(pageNumber)) {
				seen.add(pageNumber);
				indices.push(pageNumber - 1);
			}
		}
	}

	if (indices.length === 0) {
		throw new Error("Please enter at least one page or range");
	}
	return indices;
};

export type SplitMode = "range" | "each";

export interface SplitOptions {
	mode: SplitMode;
	/** mode가 "range"일 때만 쓴다 */
	ranges: string;
	baseName?: string;
	rotation?: number;
}

/**
 * 페이지를 골라 새 PDF로 뽑는다.
 * mode "each"는 페이지마다 파일 하나씩 만들어 zip으로 묶는다.
 */
export const splitPdf = async (
	file: File,
	{ mode, ranges, baseName, rotation = 0 }: SplitOptions
): Promise<{ fileName: string; pageCount: number }> => {
	const source = await openPdf(file);
	const pageCount = source.getPageCount();
	const name = baseName?.trim() || stripExtension(file.name) || "pages";

	const indices =
		mode === "each"
			? source.getPageIndices()
			: parsePageRanges(ranges, pageCount);

	const applyRotation = (target: PDFDocument): void => {
		if (rotation === 0) return;
		for (const page of target.getPages()) {
			page.setRotation(degrees((page.getRotation().angle + rotation) % 360));
		}
	};

	if (mode === "range") {
		const output = await PDFDocument.create();
		const pages = await output.copyPages(source, indices);
		for (const page of pages) {
			output.addPage(page);
		}
		applyRotation(output);

		const fileName = `${name}-pages.pdf`;
		downloadBlob(toPdfBlob(await output.save()), fileName);
		return { fileName, pageCount: indices.length };
	}

	const { default: JSZip } = await import("jszip");
	const zip = new JSZip();
	const padding = String(pageCount).length;

	for (const index of indices) {
		const output = await PDFDocument.create();
		const [page] = await output.copyPages(source, [index]);
		if (page) output.addPage(page);
		applyRotation(output);
		zip.file(
			`${name}-${String(index + 1).padStart(padding, "0")}.pdf`,
			await output.save()
		);
	}

	const fileName = `${name}-split.zip`;
	downloadBlob(await zip.generateAsync({ type: "blob" }), fileName);
	return { fileName, pageCount: indices.length };
};
