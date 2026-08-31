/* eslint-disable no-await-in-loop -- 이미지는 메모리 사용량을 낮추기 위해 순차 처리한다 */
import { downloadBlob, stripExtension } from "./download";

export type OutputFormat = "png" | "jpeg" | "webp";
export type ResizeMode = "none" | "width" | "height" | "percent";

const MIME_TYPES: Record<OutputFormat, string> = {
	png: "image/png",
	jpeg: "image/jpeg",
	webp: "image/webp",
};

export interface ConvertImagesOptions {
	format: OutputFormat;
	/** 0.1-1.0. png는 무손실이라 무시된다. */
	quality: number;
	resizeMode: ResizeMode;
	/** resizeMode에 따라 픽셀 값 또는 퍼센트 값 */
	resizeValue: number;
	onProgress?: (done: number, total: number) => void;
}

export interface ConvertedImage {
	name: string;
	blob: Blob;
	width: number;
	height: number;
	originalSize: number;
}

const targetSize = (
	width: number,
	height: number,
	mode: ResizeMode,
	value: number
): { width: number; height: number } => {
	if (mode === "none" || !Number.isFinite(value) || value <= 0) {
		return { width, height };
	}
	// 비율은 항상 유지한다. 한 변만 지정하면 나머지는 따라 온다.
	if (mode === "width") {
		return { width: value, height: Math.round((height * value) / width) };
	}
	if (mode === "height") {
		return { width: Math.round((width * value) / height), height: value };
	}
	const ratio = value / 100;
	return {
		width: Math.max(1, Math.round(width * ratio)),
		height: Math.max(1, Math.round(height * ratio)),
	};
};

/** 이미지 하나를 원하는 형식과 크기로 다시 그린다. */
export const convertImage = async (
	file: File,
	{ format, quality, resizeMode, resizeValue }: ConvertImagesOptions
): Promise<ConvertedImage> => {
	let bitmap: ImageBitmap;
	try {
		bitmap = await createImageBitmap(file);
	} catch {
		throw new Error(`Cannot read the image: ${file.name}`);
	}

	const size = targetSize(bitmap.width, bitmap.height, resizeMode, resizeValue);
	const canvas = document.createElement("canvas");
	canvas.width = Math.max(1, size.width);
	canvas.height = Math.max(1, size.height);

	const context = canvas.getContext("2d");
	if (!context) throw new Error("Canvas 2D context is not available");

	// JPEG에는 투명도가 없다. 흰 배경을 깔지 않으면 투명한 부분이 검게 나온다.
	if (format === "jpeg") {
		context.fillStyle = "#ffffff";
		context.fillRect(0, 0, canvas.width, canvas.height);
	}
	context.imageSmoothingEnabled = true;
	context.imageSmoothingQuality = "high";
	context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
	bitmap.close();

	const blob = await new Promise<Blob | null>((resolve) => {
		canvas.toBlob(
			resolve,
			MIME_TYPES[format],
			format === "png" ? undefined : quality
		);
	});
	const width = canvas.width;
	const height = canvas.height;
	canvas.width = 0;
	canvas.height = 0;

	if (!blob) throw new Error(`Cannot convert the image: ${file.name}`);

	return {
		name: `${stripExtension(file.name)}.${format === "jpeg" ? "jpg" : format}`,
		blob,
		width,
		height,
		originalSize: file.size,
	};
};

/** 여러 장을 변환한다. 두 장 이상이면 zip으로 묶어 내려받는다. */
export const convertImages = async (
	files: Array<File>,
	options: ConvertImagesOptions
): Promise<Array<ConvertedImage>> => {
	if (files.length === 0) {
		throw new Error("Please add at least one image");
	}

	const results: Array<ConvertedImage> = [];
	for (const [index, file] of files.entries()) {
		results.push(await convertImage(file, options));
		options.onProgress?.(index + 1, files.length);
	}
	return results;
};

export const downloadConverted = async (
	images: Array<ConvertedImage>,
	zipName: string
): Promise<void> => {
	const [single] = images;
	if (images.length === 1 && single) {
		downloadBlob(single.blob, single.name);
		return;
	}

	const { default: JSZip } = await import("jszip");
	const zip = new JSZip();
	// 이름이 겹치면 zip 안에서 덮어써지므로 뒤에 번호를 붙인다.
	const used = new Map<string, number>();
	for (const image of images) {
		const count = used.get(image.name) ?? 0;
		used.set(image.name, count + 1);
		const name =
			count === 0
				? image.name
				: image.name.replace(/(\.[^.]+)$/, `-${count + 1}$1`);
		zip.file(name, image.blob);
	}
	downloadBlob(await zip.generateAsync({ type: "blob" }), zipName);
};
