import { useState } from "react";
import type { TFunction } from "i18next";
import { useTranslation } from "react-i18next";
import { tDynamic } from "../../common/translate";
import { toast } from "react-toastify";
import type { FunctionComponent } from "../../common/types";
import type { ImageFormat, RenderQuality } from "../../common/pdfToImages";
import { stripExtension } from "../../common/download";
import { Content } from "../../components/ui/Content";
import { PageGuideSection } from "../../components/ui/PageGuideSection";
import { FileDropzone } from "../../components/ui/FileDropzone";
import { Select } from "../../components/ui/Select";
import { ProgressBar } from "../../components/ui/ProgressBar";
import { ToolButton } from "../../components/ui/ToolButton";
import { LabeledField } from "../../components/ui/LabeledField";
import { useProcessLoadingStore } from "../../store/ProcessLoading";

const FORMAT_KEYS: Record<ImageFormat, string> = {
	png: "pdfToImages.formatPng",
	jpeg: "pdfToImages.formatJpeg",
	webp: "pdfToImages.formatWebp",
};

const QUALITY_KEYS: Record<RenderQuality, string> = {
	high: "pdfToImages.qualityHigh",
	medium: "pdfToImages.qualityMedium",
	low: "pdfToImages.qualityLow",
};

/** Select는 문구만 주고받으므로, 고른 문구를 원래 값으로 되돌린다. */
const labelToValue = <T extends string>(
	labels: Record<string, string>,
	label: string,
	fallback: T
): T => {
	const entry = Object.entries(labels).find(([, text]) => text === label);
	return entry ? (entry[0] as T) : fallback;
};

/** 번역된 선택지 문구를 값과 짝지어 만든다. */
const labelsOf = (
	keys: Record<string, string>,
	t: TFunction
): Record<string, string> =>
	Object.fromEntries(
		Object.entries(keys).map(([value, key]) => [value, tDynamic(t, key)])
	);

const isPdfFile = (file: File): boolean =>
	file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");

export const PdfToImages = (): FunctionComponent => {
	const { t } = useTranslation();
	const [file, setFile] = useState<File | null>(null);
	const [format, setFormat] = useState<ImageFormat>("png");
	const [quality, setQuality] = useState<RenderQuality>("medium");
	const [baseName, setBaseName] = useState<string>("");
	const [progress, setProgress] = useState({ done: 0, total: 0 });
	const { processLoading, setProcessLoading } = useProcessLoadingStore();

	const addFiles = (files: Array<File>): void => {
		const [first] = files.filter((candidate) => isPdfFile(candidate));
		if (!first) {
			toast.error(t("common.onlyPdf"));
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
			toast.error(t("common.addPdf"));
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
			toast.success(t("common.downloaded", { name: result.fileName }));
		} catch (error) {
			console.error(error);
			toast.error(
				error instanceof Error ? error.message : t("pdfToImages.failed")
			);
		} finally {
			setProcessLoading(false);
			setProgress({ done: 0, total: 0 });
		}
	};

	const formatLabels = labelsOf(FORMAT_KEYS, t);
	const qualityLabels = labelsOf(QUALITY_KEYS, t);

	return (
		<Content
			categoryName={t("pdfToImages.category")}
			title={t("pdfToImages.title")}
		>
			<p className="text-neutral-15 text-sm lg:text-md">
				{t("pdfToImages.intro")}
			</p>

			<form className="flex flex-col gap-8" onSubmit={convert}>
				<FileDropzone
					accept="application/pdf,.pdf"
					disabled={processLoading}
					hint={t("common.clickToSelectFile")}
					title={file ? file.name : t("common.dropPdf")}
					onFilesAdded={addFiles}
				/>

				<div className="flex flex-wrap gap-6 items-end">
					<LabeledField label={t("common.format")}>
						<div className="h-12 w-[220px]">
							<Select
								currentValue={formatLabels[format] ?? ""}
								options={Object.values(formatLabels)}
								width="220px"
								onChange={(value) => {
									setFormat(labelToValue(formatLabels, value, "png"));
								}}
							/>
						</div>
					</LabeledField>

					<LabeledField label={t("pdfToImages.resolution")}>
						<div className="h-12 w-[220px]">
							<Select
								currentValue={qualityLabels[quality] ?? ""}
								options={Object.values(qualityLabels)}
								width="220px"
								onChange={(value) => {
									setQuality(labelToValue(qualityLabels, value, "medium"));
								}}
							/>
						</div>
					</LabeledField>

					<LabeledField grow label={t("pdfToImages.name")}>
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
						unit={t("common.pages")}
					/>
				)}

				<ToolButton
					disabled={!file}
					label={t("pdfToImages.action")}
					loading={processLoading}
					loadingLabel={t("pdfToImages.working")}
				/>
			</form>

			<PageGuideSection path="/pdf-to-images" />
		</Content>
	);
};
