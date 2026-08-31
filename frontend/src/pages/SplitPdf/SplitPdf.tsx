import { useState } from "react";
import type { TFunction } from "i18next";
import { useTranslation } from "react-i18next";
import { tDynamic } from "../../common/translate";
import { toast } from "react-toastify";
import type { FunctionComponent } from "../../common/types";
import type { SplitMode } from "../../common/pdfEdit";
import { stripExtension } from "../../common/download";
import { Content } from "../../components/ui/Content";
import { PageGuideSection } from "../../components/ui/PageGuideSection";
import { RelatedTools } from "../../components/ui/RelatedTools";
import { FileDropzone } from "../../components/ui/FileDropzone";
import { Select } from "../../components/ui/Select";
import { ToolButton } from "../../components/ui/ToolButton";
import { LabeledField } from "../../components/ui/LabeledField";
import { useProcessLoadingStore } from "../../store/ProcessLoading";

const MODE_KEYS: Record<SplitMode, string> = {
	range: "splitPdf.modeRange",
	each: "splitPdf.modeEach",
};

const ROTATION_KEYS: Record<string, string> = {
	"0": "splitPdf.rotate0",
	"90": "splitPdf.rotate90",
	"180": "splitPdf.rotate180",
	"270": "splitPdf.rotate270",
};

/** 번역된 문구를 다시 값으로 되돌린다. Select가 문자열만 주고받기 때문이다. */
const labelsOf = (
	keys: Record<string, string>,
	t: TFunction
): Record<string, string> =>
	Object.fromEntries(
		Object.entries(keys).map(([value, key]) => [value, tDynamic(t, key)])
	);

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

export const SplitPdf = (): FunctionComponent => {
	const { t } = useTranslation();
	const [file, setFile] = useState<File | null>(null);
	const [pageCount, setPageCount] = useState<number | null>(null);
	const [mode, setMode] = useState<SplitMode>("range");
	const [ranges, setRanges] = useState<string>("");
	const [rotation, setRotation] = useState<string>("0");
	const [baseName, setBaseName] = useState<string>("");
	const { processLoading, setProcessLoading } = useProcessLoadingStore();

	const addFiles = (files: Array<File>): void => {
		const [first] = files.filter((candidate) => isPdfFile(candidate));
		if (!first) {
			toast.error(t("common.onlyPdf"));
			return;
		}

		setFile(first);
		setBaseName(stripExtension(first.name));
		setPageCount(null);

		import("../../common/pdfDocument")
			.then(async ({ getPdfPageCount }) => getPdfPageCount(first))
			.then((count) => {
				setPageCount(count);
				setRanges((previous) => previous || `1-${count}`);
			})
			.catch(() => {
				toast.error(t("common.cannotReadPdf", { name: first.name }));
				setFile(null);
			});
	};

	const split = async (
		event: React.FormEvent<HTMLFormElement>
	): Promise<void> => {
		event.preventDefault();
		if (!file) {
			toast.error(t("common.addPdf"));
			return;
		}

		setProcessLoading(true);
		try {
			const { splitPdf } = await import("../../common/pdfEdit");
			const result = await splitPdf(file, {
				mode,
				ranges,
				baseName,
				rotation: Number(rotation),
			});
			toast.success(
				t("splitPdf.done", {
					name: result.fileName,
					count: result.pageCount,
				})
			);
		} catch (error) {
			console.error(error);
			toast.error(
				error instanceof Error ? error.message : t("splitPdf.failed")
			);
		} finally {
			setProcessLoading(false);
		}
	};

	const modeLabels = labelsOf(MODE_KEYS, t);
	const rotationLabels = labelsOf(ROTATION_KEYS, t);

	return (
		<Content categoryName={t("splitPdf.category")} title={t("splitPdf.title")}>
			<p className="text-neutral-15 text-sm lg:text-md">
				{t("splitPdf.intro")}
			</p>

			<form className="flex flex-col gap-8" onSubmit={split}>
				<FileDropzone
					accept="application/pdf,.pdf"
					disabled={processLoading}
					hint={t("common.clickToSelectFile")}
					title={file ? file.name : t("common.dropPdf")}
					onFilesAdded={addFiles}
				/>

				{file && (
					<div className="text-neutral-15 text-sm">
						{pageCount === null
							? t("splitPdf.reading")
							: t("splitPdf.pageCount", { count: pageCount })}
					</div>
				)}

				<div className="flex flex-wrap gap-6 items-end">
					<LabeledField label={t("splitPdf.output")}>
						<div className="h-12 w-[240px]">
							<Select
								currentValue={modeLabels[mode] ?? ""}
								options={Object.values(modeLabels)}
								width="240px"
								onChange={(value) => {
									setMode(
										labelToValue(modeLabels, value, "range") as SplitMode
									);
								}}
							/>
						</div>
					</LabeledField>

					{mode === "range" && (
						<LabeledField grow label={t("splitPdf.pages")}>
							<div className="flex items-center h-12 border border-neutral-05 rounded-xl px-3">
								<input
									className="w-full bg-transparent text-neutral-05 outline-none font-medium"
									id="split-ranges"
									placeholder={t("splitPdf.pagesPlaceholder")}
									type="text"
									value={ranges}
									onChange={(event) => {
										setRanges(event.target.value);
									}}
								/>
							</div>
						</LabeledField>
					)}

					<LabeledField label={t("splitPdf.rotation")}>
						<div className="h-12 w-[200px]">
							<Select
								currentValue={rotationLabels[rotation] ?? t("splitPdf.rotate0")}
								options={Object.values(rotationLabels)}
								width="200px"
								onChange={(value) => {
									setRotation(labelToValue(rotationLabels, value, "0"));
								}}
							/>
						</div>
					</LabeledField>
				</div>

				<ToolButton
					disabled={!file || pageCount === null}
					label={t("splitPdf.action")}
					loading={processLoading}
					loadingLabel={t("splitPdf.working")}
				/>
			</form>

			<RelatedTools path="/split-pdf" />
			<PageGuideSection path="/split-pdf" />
		</Content>
	);
};
