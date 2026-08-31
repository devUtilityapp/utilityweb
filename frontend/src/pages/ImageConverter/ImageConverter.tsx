import { useState } from "react";
import type { TFunction } from "i18next";
import { useTranslation } from "react-i18next";
import { tDynamic } from "../../common/translate";
import { toast } from "react-toastify";
import type { FunctionComponent } from "../../common/types";
import type {
	ConvertedImage,
	OutputFormat,
	ResizeMode,
} from "../../common/imageConvert";
import { formatBytes } from "../../common/download";
import { Content } from "../../components/ui/Content";
import { PageGuideSection } from "../../components/ui/PageGuideSection";
import { RelatedTools } from "../../components/ui/RelatedTools";
import { FileDropzone } from "../../components/ui/FileDropzone";
import { OrderedFileList } from "../../components/ui/OrderedFileList";
import { Select } from "../../components/ui/Select";
import { ProgressBar } from "../../components/ui/ProgressBar";
import { ToolButton } from "../../components/ui/ToolButton";
import { LabeledField } from "../../components/ui/LabeledField";
import { useOrderedFiles } from "../../hooks/useOrderedFiles";
import { useProcessLoadingStore } from "../../store/ProcessLoading";

const FORMAT_KEYS: Record<OutputFormat, string> = {
	png: "imageConverter.formatPng",
	jpeg: "imageConverter.formatJpeg",
	webp: "imageConverter.formatWebp",
};

const RESIZE_KEYS: Record<ResizeMode, string> = {
	none: "imageConverter.resizeNone",
	width: "imageConverter.resizeWidth",
	height: "imageConverter.resizeHeight",
	percent: "imageConverter.resizePercent",
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

const sizeChange = (image: ConvertedImage): string => {
	const difference = image.blob.size - image.originalSize;
	const percent = Math.round((difference / image.originalSize) * 100);
	return `${percent > 0 ? "+" : ""}${percent}%`;
};

export const ImageConverter = (): FunctionComponent => {
	const { t } = useTranslation();
	const files = useOrderedFiles();
	const [format, setFormat] = useState<OutputFormat>("webp");
	const [resizeMode, setResizeMode] = useState<ResizeMode>("none");
	const [resizeValue, setResizeValue] = useState<string>("1200");
	const [quality, setQuality] = useState<number>(80);
	const [results, setResults] = useState<Array<ConvertedImage>>([]);
	const [progress, setProgress] = useState({ done: 0, total: 0 });
	const { processLoading, setProcessLoading } = useProcessLoadingStore();

	const addFiles = (added: Array<File>): void => {
		const imageFiles = added.filter((file) => isImageFile(file));
		if (imageFiles.length !== added.length) {
			toast.error(t("common.onlyImages"));
		}
		if (imageFiles.length === 0) return;

		setResults([]);
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

		setProcessLoading(true);
		setProgress({ done: 0, total: 0 });
		setResults([]);

		try {
			const { convertImages, downloadConverted } = await import(
				"../../common/imageConvert"
			);
			const converted = await convertImages(
				files.items.map((item) => item.file),
				{
					format,
					quality: quality / 100,
					resizeMode,
					resizeValue: Number(resizeValue),
					onProgress: (done, total) => {
						setProgress({ done, total });
					},
				}
			);
			setResults(converted);
			await downloadConverted(converted, `converted-images.zip`);
			toast.success(t("imageConverter.done", { count: converted.length }));
		} catch (error) {
			console.error(error);
			toast.error(
				error instanceof Error ? error.message : t("imageConverter.failed")
			);
		} finally {
			setProcessLoading(false);
			setProgress({ done: 0, total: 0 });
		}
	};

	const formatLabels = labelsOf(FORMAT_KEYS, t);
	const resizeLabels = labelsOf(RESIZE_KEYS, t);

	return (
		<Content
			categoryName={t("imageConverter.category")}
			title={t("imageConverter.title")}
		>
			<p className="text-neutral-15 text-sm lg:text-md">
				{t("imageConverter.intro")}
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
						hint={t("imageConverter.sameSettings")}
						items={files.items}
						summary={t("imageConverter.imageCount", {
							count: files.items.length,
						})}
						onClear={files.clear}
						onRemove={files.remove}
						onReorder={files.reorder}
					/>
				)}

				<div className="flex flex-wrap gap-6 items-end">
					<LabeledField label={t("imageConverter.convertTo")}>
						<div className="h-12 w-[200px]">
							<Select
								currentValue={formatLabels[format] ?? ""}
								options={Object.values(formatLabels)}
								width="200px"
								onChange={(value) => {
									setFormat(labelToValue(formatLabels, value, "webp"));
								}}
							/>
						</div>
					</LabeledField>

					<LabeledField label={t("imageConverter.resize")}>
						<div className="h-12 w-[190px]">
							<Select
								currentValue={resizeLabels[resizeMode] ?? ""}
								options={Object.values(resizeLabels)}
								width="190px"
								onChange={(value) => {
									setResizeMode(labelToValue(resizeLabels, value, "none"));
								}}
							/>
						</div>
					</LabeledField>

					{resizeMode !== "none" && (
						<LabeledField
							label={
								resizeMode === "percent"
									? t("imageConverter.percent")
									: t("imageConverter.pixels")
							}
						>
							<div className="flex items-center h-12 w-[140px] border border-neutral-05 rounded-xl px-3">
								<input
									className="w-full bg-transparent text-neutral-05 outline-none font-medium"
									id="resize-value"
									inputMode="numeric"
									min="1"
									type="number"
									value={resizeValue}
									onChange={(event) => {
										setResizeValue(event.target.value);
									}}
								/>
							</div>
						</LabeledField>
					)}

					{format !== "png" && (
						<LabeledField
							label={t("imageConverter.qualityLabel", { value: quality })}
						>
							<div className="flex items-center h-12 w-[200px]">
								<input
									className="w-full accent-green-05"
									id="image-quality"
									max="100"
									min="10"
									type="range"
									value={quality}
									onChange={(event) => {
										setQuality(Number(event.target.value));
									}}
								/>
							</div>
						</LabeledField>
					)}
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
					label={t("imageConverter.action")}
					loading={processLoading}
					loadingLabel={t("imageConverter.working")}
				/>
			</form>

			{results.length > 0 && (
				<div className="flex flex-col gap-4">
					<div className="text-neutral-05 font-medium text-xl lg:text-2xl">
						{t("common.result")}
					</div>
					<div className="overflow-x-auto">
						<table className="w-full text-left border-collapse">
							<thead>
								<tr className="text-neutral-15 text-sm">
									<th className="py-2 pr-4 font-medium">{t("common.file")}</th>
									<th className="py-2 pr-4 font-medium">{t("common.size")}</th>
									<th className="py-2 pr-4 font-medium">
										{t("common.before")}
									</th>
									<th className="py-2 pr-4 font-medium">{t("common.after")}</th>
									<th className="py-2 font-medium">{t("common.change")}</th>
								</tr>
							</thead>
							<tbody>
								{results.map((image) => (
									<tr
										key={image.name}
										className="border-t border-neutral-50 text-neutral-05"
									>
										<td className="py-2 pr-4 truncate max-w-[220px]">
											{image.name}
										</td>
										<td className="py-2 pr-4 text-neutral-10">
											{image.width} x {image.height}
										</td>
										<td className="py-2 pr-4 text-neutral-10">
											{formatBytes(image.originalSize)}
										</td>
										<td className="py-2 pr-4 text-neutral-10">
											{formatBytes(image.blob.size)}
										</td>
										<td
											className={`py-2 font-medium ${
												image.blob.size <= image.originalSize
													? "text-green-05"
													: "text-neutral-10"
											}`}
										>
											{sizeChange(image)}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			)}

			<RelatedTools path="/image-converter" />
			<PageGuideSection path="/image-converter" />
		</Content>
	);
};
