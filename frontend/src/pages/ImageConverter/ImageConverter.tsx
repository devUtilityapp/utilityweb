import { useState } from "react";
import { toast } from "react-toastify";
import type { FunctionComponent } from "../../common/types";
import type {
	ConvertedImage,
	OutputFormat,
	ResizeMode,
} from "../../common/imageConvert";
import { findPageSeo } from "../../common/seo";
import { formatBytes } from "../../common/download";
import { Content } from "../../components/ui/Content";
import { PageGuideSection } from "../../components/ui/PageGuideSection";
import { FileDropzone } from "../../components/ui/FileDropzone";
import { OrderedFileList } from "../../components/ui/OrderedFileList";
import { Select } from "../../components/ui/Select";
import { ProgressBar } from "../../components/ui/ProgressBar";
import { ToolButton } from "../../components/ui/ToolButton";
import { LabeledField } from "../../components/ui/LabeledField";
import { useOrderedFiles } from "../../hooks/useOrderedFiles";
import { useProcessLoadingStore } from "../../store/ProcessLoading";

const FORMAT_LABELS: Record<OutputFormat, string> = {
	png: "PNG (lossless)",
	jpeg: "JPG (universal)",
	webp: "WebP (smallest)",
};

const RESIZE_LABELS: Record<ResizeMode, string> = {
	none: "Keep original",
	width: "Fit width (px)",
	height: "Fit height (px)",
	percent: "Scale (%)",
};

const labelToValue = <T extends string>(
	labels: Record<T, string>,
	label: string,
	fallback: T
): T => {
	const entry = Object.entries(labels).find(([, text]) => text === label);
	return entry ? (entry[0] as T) : fallback;
};

const isImageFile = (file: File): boolean => file.type.startsWith("image/");

const sizeChange = (image: ConvertedImage): string => {
	const difference = image.blob.size - image.originalSize;
	const percent = Math.round((difference / image.originalSize) * 100);
	return `${percent > 0 ? "+" : ""}${percent}%`;
};

export const ImageConverter = (): FunctionComponent => {
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
			toast.error("Only image files are allowed");
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
					toast.error(`Cannot read image: ${item.file.name}`);
					files.remove(item.id);
				});
		}
	};

	const convert = async (
		event: React.FormEvent<HTMLFormElement>
	): Promise<void> => {
		event.preventDefault();
		if (files.items.length === 0) {
			toast.error("Please add at least one image");
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
			toast.success(`${converted.length} images converted`);
		} catch (error) {
			console.error(error);
			toast.error(
				error instanceof Error ? error.message : "Failed to convert the images"
			);
		} finally {
			setProcessLoading(false);
			setProgress({ done: 0, total: 0 });
		}
	};

	const guide = findPageSeo("/image-converter").guide;

	return (
		<Content categoryName="Image" title="IMAGE CONVERTER">
			<p className="text-neutral-15 text-sm lg:text-md">
				Convert images between PNG, JPG and WebP, resize them, and compress them
				to a smaller file. Several at once, all in your browser.
			</p>

			<form className="flex flex-col gap-8" onSubmit={convert}>
				<FileDropzone
					multiple
					accept="image/*"
					disabled={processLoading}
					hint="JPG, PNG, WebP, GIF, BMP and AVIF · multiple files supported"
					title="Drop images here"
					onFilesAdded={addFiles}
				/>

				{files.items.length > 0 && (
					<OrderedFileList
						disabled={processLoading}
						hint="Every image is converted with the same settings"
						items={files.items}
						summary={`${files.items.length} images`}
						onClear={files.clear}
						onRemove={files.remove}
						onReorder={files.reorder}
					/>
				)}

				<div className="flex flex-wrap gap-6 items-end">
					<LabeledField label="Convert to">
						<div className="h-12 w-[200px]">
							<Select
								currentValue={FORMAT_LABELS[format]}
								options={Object.values(FORMAT_LABELS)}
								width="200px"
								onChange={(value) => {
									setFormat(labelToValue(FORMAT_LABELS, value, "webp"));
								}}
							/>
						</div>
					</LabeledField>

					<LabeledField label="Resize">
						<div className="h-12 w-[190px]">
							<Select
								currentValue={RESIZE_LABELS[resizeMode]}
								options={Object.values(RESIZE_LABELS)}
								width="190px"
								onChange={(value) => {
									setResizeMode(labelToValue(RESIZE_LABELS, value, "none"));
								}}
							/>
						</div>
					</LabeledField>

					{resizeMode !== "none" && (
						<LabeledField
							label={resizeMode === "percent" ? "Percent" : "Pixels"}
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
						<LabeledField label={`Quality (${quality}%)`}>
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
						unit="images"
					/>
				)}

				<ToolButton
					disabled={files.items.length === 0}
					label="Convert images"
					loading={processLoading}
					loadingLabel="Converting..."
				/>
			</form>

			{results.length > 0 && (
				<div className="flex flex-col gap-4">
					<div className="text-neutral-05 font-medium text-xl lg:text-2xl">
						Result
					</div>
					<div className="overflow-x-auto">
						<table className="w-full text-left border-collapse">
							<thead>
								<tr className="text-neutral-15 text-sm">
									<th className="py-2 pr-4 font-medium">File</th>
									<th className="py-2 pr-4 font-medium">Size</th>
									<th className="py-2 pr-4 font-medium">Before</th>
									<th className="py-2 pr-4 font-medium">After</th>
									<th className="py-2 font-medium">Change</th>
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

			{guide && <PageGuideSection guide={guide} />}
		</Content>
	);
};
