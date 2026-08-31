/* eslint-disable no-await-in-loop -- 이미지는 메모리 사용량을 낮추기 위해 순차 처리한다 */
import { PDFDocument } from "pdf-lib";
import { downloadBlob } from "./download";

export type PageSize = "fit" | "a4" | "letter";
export type PageOrientation = "auto" | "portrait" | "landscape";

// pdf 단위는 포인트(1/72 inch).
const PAGE_SIZES: Record<Exclude<PageSize, "fit">, [number, number]> = {
	a4: [595.28, 841.89],
	letter: [612, 792],
};

const JPEG_QUALITY = 0.92;

export interface ImagesToPdfOptions {
	pageSize: PageSize;
	orientation: PageOrientation;
	/** 용지 짧은 변 기준 여백 비율(0-0.25) */
	marginRatio: number;
	fileName: string;
	onProgress?: (done: number, total: number) => void;
}

interface EmbeddableImage {
	bytes: ArrayBuffer;
	type: "png" | "jpeg";
}

const loadBitmap = async (file: File): Promise<ImageBitmap> => {
	try {
		return await createImageBitmap(file);
	} catch {
		throw new Error(`Cannot read the image: ${file.name}`);
	}
};

/**
 * pdf-lib은 PNG와 JPEG만 그대로 넣을 수 있다.
 * WebP·AVIF·GIF 등은 캔버스로 한 번 그려서 JPEG으로 바꾼다.
 */
const toEmbeddable = async (file: File): Promise<EmbeddableImage> => {
	if (file.type === "image/png") {
		return { bytes: await file.arrayBuffer(), type: "png" };
	}
	if (file.type === "image/jpeg") {
		return { bytes: await file.arrayBuffer(), type: "jpeg" };
	}

	const bitmap = await loadBitmap(file);
	const canvas = document.createElement("canvas");
	canvas.width = bitmap.width;
	canvas.height = bitmap.height;
	const context = canvas.getContext("2d");
	if (!context) throw new Error("Canvas 2D context is not available");
	// 투명 배경을 그대로 JPEG으로 바꾸면 검게 나오므로 흰색을 깔아준다.
	context.fillStyle = "#ffffff";
	context.fillRect(0, 0, canvas.width, canvas.height);
	context.drawImage(bitmap, 0, 0);
	bitmap.close();

	const blob = await new Promise<Blob | null>((resolve) => {
		canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY);
		// toBlob은 캔버스 내용을 즉시 붙잡으므로 여기서 바로 비워도 안전하다.
		canvas.width = 0;
		canvas.height = 0;
	});
	if (!blob) throw new Error(`Cannot convert the image: ${file.name}`);

	return { bytes: await blob.arrayBuffer(), type: "jpeg" };
};

/** 이미지 여러 장을 한 장씩 한 페이지에 담아 PDF로 내려받는다. */
export const convertImagesToPdf = async (
	files: Array<File>,
	{
		pageSize,
		orientation,
		marginRatio,
		fileName,
		onProgress,
	}: ImagesToPdfOptions
): Promise<number> => {
	if (files.length === 0) {
		throw new Error("Please add at least one image");
	}

	const pdf = await PDFDocument.create();

	for (const [index, file] of files.entries()) {
		const source = await toEmbeddable(file);
		const image =
			source.type === "png"
				? await pdf.embedPng(source.bytes)
				: await pdf.embedJpg(source.bytes);

		if (pageSize === "fit") {
			// 이미지 크기를 그대로 페이지 크기로 쓴다. 여백도 잘림도 없다.
			const page = pdf.addPage([image.width, image.height]);
			page.drawImage(image, {
				x: 0,
				y: 0,
				width: image.width,
				height: image.height,
			});
		} else {
			const [shortSide, longSide] = PAGE_SIZES[pageSize];
			const landscape =
				orientation === "landscape" ||
				(orientation === "auto" && image.width > image.height);
			const pageWidth = landscape ? longSide : shortSide;
			const pageHeight = landscape ? shortSide : longSide;

			const margin = Math.min(pageWidth, pageHeight) * marginRatio;
			const boxWidth = pageWidth - margin * 2;
			const boxHeight = pageHeight - margin * 2;
			const scale = Math.min(
				boxWidth / image.width,
				boxHeight / image.height,
				// 작은 이미지를 억지로 늘리면 흐려지므로 원본보다 키우지 않는다.
				1
			);
			const width = image.width * scale;
			const height = image.height * scale;

			const page = pdf.addPage([pageWidth, pageHeight]);
			page.drawImage(image, {
				x: (pageWidth - width) / 2,
				y: (pageHeight - height) / 2,
				width,
				height,
			});
		}

		onProgress?.(index + 1, files.length);
	}

	pdf.setProducer("utilityapp.net");
	const bytes = await pdf.save();
	downloadBlob(
		new Blob([bytes.slice().buffer as ArrayBuffer], {
			type: "application/pdf",
		}),
		fileName
	);

	return files.length;
};
