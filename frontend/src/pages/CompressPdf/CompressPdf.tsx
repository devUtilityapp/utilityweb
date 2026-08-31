import { useState } from "react";
import { toast } from "react-toastify";
import type { FunctionComponent } from "../../common/types";
import type {
	CompressionLevel,
	CompressResult,
} from "../../common/pdfCompress";
import { findPageSeo } from "../../common/seo";
import {
	formatBytes,
	stripExtension,
	withExtension,
} from "../../common/download";
import { Content } from "../../components/ui/Content";
import { PageGuideSection } from "../../components/ui/PageGuideSection";
import { FileDropzone } from "../../components/ui/FileDropzone";
import { Select } from "../../components/ui/Select";
import { ProgressBar } from "../../components/ui/ProgressBar";
import { ToolButton } from "../../components/ui/ToolButton";
import { FileNameInput, LabeledField } from "../../components/ui/LabeledField";
import { useProcessLoadingStore } from "../../store/ProcessLoading";

const LEVEL_LABELS: Record<CompressionLevel, string> = {
	light: "Light (sharpest)",
	balanced: "Balanced",
	strong: "Strong (smallest)",
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

export const CompressPdf = (): FunctionComponent => {
	const [file, setFile] = useState<File | null>(null);
	const [level, setLevel] = useState<CompressionLevel>("balanced");
	const [fileName, setFileName] = useState<string>("compressed");
	const [progress, setProgress] = useState({ done: 0, total: 0 });
	const [result, setResult] = useState<CompressResult | null>(null);
	const { processLoading, setProcessLoading } = useProcessLoadingStore();

	const addFiles = (files: Array<File>): void => {
		const [first] = files.filter((candidate) => isPdfFile(candidate));
		if (!first) {
			toast.error("Only PDF files are allowed");
			return;
		}
		setFile(first);
		setFileName(`${stripExtension(first.name)}-compressed`);
		setResult(null);
	};

	const compress = async (
		event: React.FormEvent<HTMLFormElement>
	): Promise<void> => {
		event.preventDefault();
		if (!file) {
			toast.error("Please add a PDF file");
			return;
		}

		const outputName = withExtension(fileName, "pdf", "compressed");
		setProcessLoading(true);
		setProgress({ done: 0, total: 0 });
		setResult(null);

		try {
			const { compressPdf } = await import("../../common/pdfCompress");
			const compressed = await compressPdf(file, {
				level,
				fileName: outputName,
				onProgress: (done, total) => {
					setProgress({ done, total });
				},
			});
			setResult(compressed);
			toast.success(`${outputName} downloaded`);
		} catch (error) {
			console.error(error);
			toast.error(
				error instanceof Error ? error.message : "Failed to compress the PDF"
			);
		} finally {
			setProcessLoading(false);
			setProgress({ done: 0, total: 0 });
		}
	};

	const guide = findPageSeo("/compress-pdf").guide;
	const saved =
		result === null
			? 0
			: Math.round(((result.before - result.after) / result.before) * 100);

	return (
		<Content categoryName="PDF" title="COMPRESS PDF">
			<p className="text-neutral-15 text-sm lg:text-md">
				Make a PDF small enough to email or upload. Pages are re-drawn as
				compressed images, so scans shrink a lot — and nothing is uploaded.
			</p>

			<form className="flex flex-col gap-8" onSubmit={compress}>
				<FileDropzone
					accept="application/pdf,.pdf"
					disabled={processLoading}
					hint="or click to select a file"
					title={file ? file.name : "Drop a PDF file here"}
					onFilesAdded={addFiles}
				/>

				{file && (
					<div className="text-neutral-15 text-sm">
						Current size: {formatBytes(file.size)}
					</div>
				)}

				<div className="flex flex-wrap gap-6 items-end">
					<LabeledField label="Compression">
						<div className="h-12 w-[220px]">
							<Select
								currentValue={LEVEL_LABELS[level]}
								options={Object.values(LEVEL_LABELS)}
								width="220px"
								onChange={(value) => {
									setLevel(labelToValue(LEVEL_LABELS, value, "balanced"));
								}}
							/>
						</div>
					</LabeledField>

					<LabeledField grow label="File name">
						<FileNameInput
							extension="pdf"
							id="compressed-file-name"
							placeholder="compressed"
							value={fileName}
							onChange={setFileName}
						/>
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
					label="Compress PDF"
					loading={processLoading}
					loadingLabel="Compressing..."
				/>
			</form>

			{result && (
				<div className="flex flex-col gap-3 border border-neutral-05 rounded-xl p-5">
					<div className="text-neutral-05 font-medium text-xl">
						{result.pages} pages compressed
					</div>
					<div className="text-neutral-10">
						{formatBytes(result.before)} → {formatBytes(result.after)}{" "}
						<span
							className={
								saved > 0 ? "text-green-05 font-medium" : "text-neutral-15"
							}
						>
							({saved > 0 ? `${saved}% smaller` : `${-saved}% larger`})
						</span>
					</div>
					{saved <= 0 && (
						<div className="text-neutral-15 text-sm">
							This document was already efficient — it is mostly text rather
							than images, so turning the pages into pictures does not help.
							Keep the original.
						</div>
					)}
				</div>
			)}

			{guide && <PageGuideSection guide={guide} />}
		</Content>
	);
};
