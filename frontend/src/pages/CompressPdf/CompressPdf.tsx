import { useState } from "react";
import { useTranslation } from "react-i18next";
import { tDynamic } from "../../common/translate";
import { toast } from "react-toastify";
import type { FunctionComponent } from "../../common/types";
import type {
	CompressionLevel,
	CompressResult,
} from "../../common/pdfCompress";
import {
	formatBytes,
	stripExtension,
	withExtension,
} from "../../common/download";
import { Content } from "../../components/ui/Content";
import { PageGuideSection } from "../../components/ui/PageGuideSection";
import { RelatedTools } from "../../components/ui/RelatedTools";
import { FileDropzone } from "../../components/ui/FileDropzone";
import { Select } from "../../components/ui/Select";
import { ProgressBar } from "../../components/ui/ProgressBar";
import { ToolButton } from "../../components/ui/ToolButton";
import { FileNameInput, LabeledField } from "../../components/ui/LabeledField";
import { useProcessLoadingStore } from "../../store/ProcessLoading";

const LEVEL_KEYS: Record<CompressionLevel, string> = {
	light: "compressPdf.levelLight",
	balanced: "compressPdf.levelBalanced",
	strong: "compressPdf.levelStrong",
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

const isPdfFile = (file: File): boolean =>
	file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");

export const CompressPdf = (): FunctionComponent => {
	const { t } = useTranslation();
	const [file, setFile] = useState<File | null>(null);
	const [level, setLevel] = useState<CompressionLevel>("balanced");
	const [fileName, setFileName] = useState<string>(
		t("compressPdf.defaultName")
	);
	const [progress, setProgress] = useState({ done: 0, total: 0 });
	const [result, setResult] = useState<CompressResult | null>(null);
	const { processLoading, setProcessLoading } = useProcessLoadingStore();

	const addFiles = (files: Array<File>): void => {
		const [first] = files.filter((candidate) => isPdfFile(candidate));
		if (!first) {
			toast.error(t("common.onlyPdf"));
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
			toast.error(t("common.addPdf"));
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
			toast.success(t("common.downloaded", { name: outputName }));
		} catch (error) {
			console.error(error);
			toast.error(
				error instanceof Error ? error.message : t("compressPdf.failed")
			);
		} finally {
			setProcessLoading(false);
			setProgress({ done: 0, total: 0 });
		}
	};

	const levelLabels: Record<string, string> = Object.fromEntries(
		Object.entries(LEVEL_KEYS).map(([value, key]) => [value, tDynamic(t, key)])
	);
	const saved =
		result === null
			? 0
			: Math.round(((result.before - result.after) / result.before) * 100);

	return (
		<Content
			categoryName={t("compressPdf.category")}
			title={t("compressPdf.title")}
		>
			<p className="text-neutral-15 text-sm lg:text-md">
				{t("compressPdf.intro")}
			</p>

			<form className="flex flex-col gap-8" onSubmit={compress}>
				<FileDropzone
					accept="application/pdf,.pdf"
					disabled={processLoading}
					hint={t("common.clickToSelectFile")}
					title={file ? file.name : t("common.dropPdf")}
					onFilesAdded={addFiles}
				/>

				{file && (
					<div className="text-neutral-15 text-sm">
						{t("compressPdf.currentSize", { size: formatBytes(file.size) })}
					</div>
				)}

				<div className="flex flex-wrap gap-6 items-end">
					<LabeledField label={t("compressPdf.compression")}>
						<div className="h-12 w-[220px]">
							<Select
								currentValue={levelLabels[level] ?? ""}
								options={Object.values(levelLabels)}
								width="220px"
								onChange={(value) => {
									setLevel(
										labelToValue(
											levelLabels,
											value,
											"balanced"
										) as CompressionLevel
									);
								}}
							/>
						</div>
					</LabeledField>

					<LabeledField grow label={t("common.fileName")}>
						<FileNameInput
							extension="pdf"
							id="compressed-file-name"
							placeholder={t("compressPdf.defaultName")}
							value={fileName}
							onChange={setFileName}
						/>
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
					label={t("compressPdf.action")}
					loading={processLoading}
					loadingLabel={t("compressPdf.working")}
				/>
			</form>

			{result && (
				<div className="flex flex-col gap-3 border border-neutral-05 rounded-xl p-5">
					<div className="text-neutral-05 font-medium text-xl">
						{t("compressPdf.resultPages", { count: result.pages })}
					</div>
					<div className="text-neutral-10">
						{formatBytes(result.before)} → {formatBytes(result.after)}{" "}
						<span
							className={
								saved > 0 ? "text-green-05 font-medium" : "text-neutral-15"
							}
						>
							{saved > 0
								? t("compressPdf.smaller", { percent: saved })
								: t("compressPdf.larger", { percent: -saved })}
						</span>
					</div>
					{saved <= 0 && (
						<div className="text-neutral-15 text-sm">
							{t("compressPdf.alreadySmall")}
						</div>
					)}
				</div>
			)}

			<RelatedTools path="/compress-pdf" />
			<PageGuideSection path="/compress-pdf" />
		</Content>
	);
};
