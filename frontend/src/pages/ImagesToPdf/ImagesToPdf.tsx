import { useState } from "react";
import type { TFunction } from "i18next";
import { useTranslation } from "react-i18next";
import { tDynamic } from "../../common/translate";
import { toast } from "react-toastify";
import type { FunctionComponent } from "../../common/types";
import type { PageOrientation, PageSize } from "../../common/imagesToPdf";
import { withExtension } from "../../common/download";
import { Content } from "../../components/ui/Content";
import { PageGuideSection } from "../../components/ui/PageGuideSection";
import { RelatedTools } from "../../components/ui/RelatedTools";
import { FileDropzone } from "../../components/ui/FileDropzone";
import { OrderedFileList } from "../../components/ui/OrderedFileList";
import { Select } from "../../components/ui/Select";
import { ProgressBar } from "../../components/ui/ProgressBar";
import { ToolButton } from "../../components/ui/ToolButton";
import { FileNameInput, LabeledField } from "../../components/ui/LabeledField";
import { useOrderedFiles } from "../../hooks/useOrderedFiles";
import { useProcessLoadingStore } from "../../store/ProcessLoading";

const PAGE_SIZE_KEYS: Record<PageSize, string> = {
	fit: "imagesToPdf.sizeFit",
	a4: "imagesToPdf.sizeA4",
	letter: "imagesToPdf.sizeLetter",
};

const ORIENTATION_KEYS: Record<PageOrientation, string> = {
	auto: "imagesToPdf.orientationAuto",
	portrait: "imagesToPdf.orientationPortrait",
	landscape: "imagesToPdf.orientationLandscape",
};

const MARGIN_KEYS: Record<string, string> = {
	"0": "imagesToPdf.marginNone",
	"0.03": "imagesToPdf.marginSmall",
	"0.06": "imagesToPdf.marginMedium",
	"0.1": "imagesToPdf.marginLarge",
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

const isImageFile = (file: File): boolean => file.type.startsWith("image/");

export const ImagesToPdf = (): FunctionComponent => {
	const { t } = useTranslation();
	const files = useOrderedFiles();
	const [pageSize, setPageSize] = useState<PageSize>("fit");
	const [orientation, setOrientation] = useState<PageOrientation>("auto");
	const [margin, setMargin] = useState<string>("0.03");
	const [fileName, setFileName] = useState<string>(
		t("imagesToPdf.defaultName")
	);
	const [progress, setProgress] = useState({ done: 0, total: 0 });
	const { processLoading, setProcessLoading } = useProcessLoadingStore();

	const addFiles = (added: Array<File>): void => {
		const imageFiles = added.filter((file) => isImageFile(file));
		if (imageFiles.length !== added.length) {
			toast.error(t("common.onlyImages"));
		}
		if (imageFiles.length === 0) return;

		// 크기는 이미지마다 비동기로 읽어 목록에 채운다.
		for (const item of files.add(imageFiles)) {
			createImageBitmap(item.file)
				.then((bitmap) => {
					files.setDetail(item.id, `${bitmap.width} x ${bitmap.height}`);
					bitmap.close();
				})
				.catch(() => {
					toast.error(t("common.cannotReadImage", { name: item.file.name }));
					files.remove(item.id);
				});
		}
	};

	const convert = async (
		event: React.FormEvent<HTMLFormElement>
	): Promise<void> => {
		event.preventDefault();
		if (files.items.length === 0) {
			toast.error(t("common.addImage"));
			return;
		}

		const outputName = withExtension(fileName, "pdf", "images");
		setProcessLoading(true);
		setProgress({ done: 0, total: 0 });

		try {
			const { convertImagesToPdf } = await import("../../common/imagesToPdf");
			const count = await convertImagesToPdf(
				files.items.map((item) => item.file),
				{
					pageSize,
					orientation,
					marginRatio: Number(margin),
					fileName: outputName,
					onProgress: (done, total) => {
						setProgress({ done, total });
					},
				}
			);
			toast.success(t("imagesToPdf.done", { name: outputName, count }));
		} catch (error) {
			console.error(error);
			toast.error(
				error instanceof Error ? error.message : t("imagesToPdf.failed")
			);
		} finally {
			setProcessLoading(false);
			setProgress({ done: 0, total: 0 });
		}
	};

	const pageSizeLabels = labelsOf(PAGE_SIZE_KEYS, t);
	const orientationLabels = labelsOf(ORIENTATION_KEYS, t);
	const marginLabels = labelsOf(MARGIN_KEYS, t);

	return (
		<Content
			categoryName={t("imagesToPdf.category")}
			title={t("imagesToPdf.title")}
		>
			<p className="text-neutral-15 text-sm lg:text-md">
				{t("imagesToPdf.intro")}
			</p>

			<form className="flex flex-col gap-8" onSubmit={convert}>
				<FileDropzone
					multiple
					accept="image/*"
					disabled={processLoading}
					hint={t("common.imageFormats")}
					title={t("common.dropImages")}
					onFilesAdded={addFiles}
				/>

				{files.items.length > 0 && (
					<OrderedFileList
						disabled={processLoading}
						hint={t("common.dragToReorder")}
						items={files.items}
						summary={t("imagesToPdf.pageCount", { count: files.items.length })}
						onClear={files.clear}
						onRemove={files.remove}
						onReorder={files.reorder}
					/>
				)}

				<div className="flex flex-wrap gap-6 items-end">
					<LabeledField label={t("imagesToPdf.pageSize")}>
						<div className="h-12 w-[220px]">
							<Select
								currentValue={pageSizeLabels[pageSize] ?? ""}
								options={Object.values(pageSizeLabels)}
								width="220px"
								onChange={(value) => {
									setPageSize(labelToValue(pageSizeLabels, value, "fit"));
								}}
							/>
						</div>
					</LabeledField>

					{pageSize !== "fit" && (
						<>
							<LabeledField label={t("imagesToPdf.orientation")}>
								<div className="h-12 w-[200px]">
									<Select
										currentValue={orientationLabels[orientation] ?? ""}
										options={Object.values(orientationLabels)}
										width="200px"
										onChange={(value) => {
											setOrientation(
												labelToValue(orientationLabels, value, "auto")
											);
										}}
									/>
								</div>
							</LabeledField>

							<LabeledField label={t("imagesToPdf.margin")}>
								<div className="h-12 w-[160px]">
									<Select
										options={Object.values(marginLabels)}
										width="160px"
										currentValue={
											marginLabels[margin] ?? t("imagesToPdf.marginSmall")
										}
										onChange={(value) => {
											setMargin(labelToValue(marginLabels, value, "0.03"));
										}}
									/>
								</div>
							</LabeledField>
						</>
					)}

					<LabeledField grow label={t("common.fileName")}>
						<FileNameInput
							extension="pdf"
							id="images-pdf-name"
							placeholder={t("imagesToPdf.defaultName")}
							value={fileName}
							onChange={setFileName}
						/>
					</LabeledField>
				</div>

				{processLoading && (
					<ProgressBar
						done={progress.done}
						total={progress.total}
						unit={t("common.images")}
					/>
				)}

				<ToolButton
					disabled={files.items.length === 0}
					label={t("imagesToPdf.action")}
					loading={processLoading}
					loadingLabel={t("imagesToPdf.working")}
				/>
			</form>

			<RelatedTools path="/images-to-pdf" />
			<PageGuideSection path="/images-to-pdf" />
		</Content>
	);
};
