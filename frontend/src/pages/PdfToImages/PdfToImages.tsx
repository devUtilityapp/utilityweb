import { useState } from "react";
import { toast } from "react-toastify";
import type { FunctionComponent } from "../../common/types";
import type { ImageFormat, RenderQuality } from "../../common/pdfToImages";
import { findPageSeo } from "../../common/seo";
import { stripExtension } from "../../common/download";
import { Content } from "../../components/ui/Content";
import { PageGuideSection } from "../../components/ui/PageGuideSection";
import { FileDropzone } from "../../components/ui/FileDropzone";
import { Select } from "../../components/ui/Select";
import { ProgressBar } from "../../components/ui/ProgressBar";
import { ToolButton } from "../../components/ui/ToolButton";
import { LabeledField } from "../../components/ui/LabeledField";
import { useProcessLoadingStore } from "../../store/ProcessLoading";

const FORMAT_LABELS: Record<ImageFormat, string> = {
	png: "PNG (sharp, lossless)",
	jpeg: "JPG (small, universal)",
	webp: "WebP (smallest)",
};

const QUALITY_LABELS: Record<RenderQuality, string> = {
	high: "High (3x, print)",
	medium: "Medium (2x, screen)",
	low: "Low (1x, small)",
};

const labelToValue = <T extends string>(
	labels: Record<T, string>,
	label: string,
	fallback: T
): T => {
	const entry = Object.entries(labels).find(([, text]) => text === label);
	return entry ? (entry[0] as T) : fallback;
};

const isPdfFile = (file: File): boolean =>
	file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");

export const PdfToImages = (): FunctionComponent => {
	const [file, setFile] = useState<File | null>(null);
	const [format, setFormat] = useState<ImageFormat>("png");
	const [quality, setQuality] = useState<RenderQuality>("medium");
	const [baseName, setBaseName] = useState<string>("");
	const [progress, setProgress] = useState({ done: 0, total: 0 });
	const { processLoading, setProcessLoading } = useProcessLoadingStore();

	const addFiles = (files: Array<File>): void => {
		const [first] = files.filter((candidate) => isPdfFile(candidate));
		if (!first) {
			toast.error("Only PDF files are allowed");
			return;
		}
		setFile(first);
		setBaseName(stripExtension(first.name));
	};

	const convert = async (
		event: React.FormEvent<HTMLFormElement>
	): Promise<void> => {
		event.preventDefault();
		if (!file) {
			toast.error("Please add a PDF file");
			return;
		}

		setProcessLoading(true);
		setProgress({ done: 0, total: 0 });

		try {
			const { convertPdfToImages } = await import("../../common/pdfToImages");
			const result = await convertPdfToImages(file, {
				format,
				quality,
				baseName,
				onProgress: (done, total) => {
					setProgress({ done, total });
				},
			});
			toast.success(`${result.fileName} downloaded`);
		} catch (error) {
			console.error(error);
			toast.error(
				error instanceof Error ? error.message : "Failed to convert the PDF"
			);
		} finally {
			setProcessLoading(false);
			setProgress({ done: 0, total: 0 });
		}
	};

	const guide = findPageSeo("/pdf-to-images").guide;

	return (
		<Content categoryName="PDF" title="PDF TO IMAGES">
			<p className="text-neutral-15 text-sm lg:text-md">
				Render every page of a PDF as a PNG, JPG or WebP image. One page
				downloads on its own, more than one arrives as a ZIP — and the file
				never leaves your browser.
			</p>

			<form className="flex flex-col gap-8" onSubmit={convert}>
				<FileDropzone
					accept="application/pdf,.pdf"
					disabled={processLoading}
					hint="or click to select a file"
					title={file ? file.name : "Drop a PDF file here"}
					onFilesAdded={addFiles}
				/>

				<div className="flex flex-wrap gap-6 items-end">
					<LabeledField label="Format">
						<div className="h-12 w-[220px]">
							<Select
								currentValue={FORMAT_LABELS[format]}
								options={Object.values(FORMAT_LABELS)}
								width="220px"
								onChange={(value) => {
									setFormat(labelToValue(FORMAT_LABELS, value, "png"));
								}}
							/>
						</div>
					</LabeledField>

					<LabeledField label="Resolution">
						<div className="h-12 w-[220px]">
							<Select
								currentValue={QUALITY_LABELS[quality]}
								options={Object.values(QUALITY_LABELS)}
								width="220px"
								onChange={(value) => {
									setQuality(labelToValue(QUALITY_LABELS, value, "medium"));
								}}
							/>
						</div>
					</LabeledField>

					<LabeledField grow label="Name">
						<div className="flex items-center h-12 border border-neutral-05 rounded-xl px-3">
							<input
								className="w-full bg-transparent text-neutral-05 outline-none font-medium"
								id="image-base-name"
								placeholder="pages"
								type="text"
								value={baseName}
								onChange={(event) => {
									setBaseName(event.target.value);
								}}
							/>
							<div className="text-neutral-15">
								-01.{format === "jpeg" ? "jpg" : format}
							</div>
						</div>
					</LabeledField>
				</div>

				{processLoading && (
					<ProgressBar
						done={progress.done}
						total={progress.total}
						unit="pages"
					/>
				)}

				<ToolButton
					disabled={!file}
					label="Convert to images"
					loading={processLoading}
					loadingLabel="Converting..."
				/>
			</form>

			{guide && <PageGuideSection guide={guide} />}
		</Content>
	);
};
