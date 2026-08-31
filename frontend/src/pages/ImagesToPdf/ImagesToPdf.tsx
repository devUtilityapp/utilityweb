import { useState } from "react";
import { toast } from "react-toastify";
import type { FunctionComponent } from "../../common/types";
import type { PageOrientation, PageSize } from "../../common/imagesToPdf";
import { findPageSeo } from "../../common/seo";
import { withExtension } from "../../common/download";
import { Content } from "../../components/ui/Content";
import { PageGuideSection } from "../../components/ui/PageGuideSection";
import { FileDropzone } from "../../components/ui/FileDropzone";
import { OrderedFileList } from "../../components/ui/OrderedFileList";
import { Select } from "../../components/ui/Select";
import { ProgressBar } from "../../components/ui/ProgressBar";
import { ToolButton } from "../../components/ui/ToolButton";
import { FileNameInput, LabeledField } from "../../components/ui/LabeledField";
import { useOrderedFiles } from "../../hooks/useOrderedFiles";
import { useProcessLoadingStore } from "../../store/ProcessLoading";

const PAGE_SIZE_LABELS: Record<PageSize, string> = {
	fit: "Fit to image",
	a4: "A4 (210 x 297 mm)",
	letter: "Letter (8.5 x 11 in)",
};

const ORIENTATION_LABELS: Record<PageOrientation, string> = {
	auto: "Auto (per image)",
	portrait: "Portrait",
	landscape: "Landscape",
};

const MARGIN_LABELS: Record<string, string> = {
	"0": "None",
	"0.03": "Small",
	"0.06": "Medium",
	"0.1": "Large",
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

export const ImagesToPdf = (): FunctionComponent => {
	const files = useOrderedFiles();
	const [pageSize, setPageSize] = useState<PageSize>("fit");
	const [orientation, setOrientation] = useState<PageOrientation>("auto");
	const [margin, setMargin] = useState<string>("0.03");
	const [fileName, setFileName] = useState<string>("images");
	const [progress, setProgress] = useState({ done: 0, total: 0 });
	const { processLoading, setProcessLoading } = useProcessLoadingStore();

	const addFiles = (added: Array<File>): void => {
		const imageFiles = added.filter((file) => isImageFile(file));
		if (imageFiles.length !== added.length) {
			toast.error("Only image files are allowed");
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
			toast.success(`${outputName} downloaded (${count} pages)`);
		} catch (error) {
			console.error(error);
			toast.error(
				error instanceof Error ? error.message : "Failed to create the PDF"
			);
		} finally {
			setProcessLoading(false);
			setProgress({ done: 0, total: 0 });
		}
	};

	const guide = findPageSeo("/images-to-pdf").guide;

	return (
		<Content categoryName="Image" title="IMAGES TO PDF">
			<p className="text-neutral-15 text-sm lg:text-md">
				Put photos, scans or screenshots into a single PDF — one image per page,
				on A4, Letter or pages shaped like the image itself. Nothing is
				uploaded.
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
						hint="Drag the handle to change the page order"
						items={files.items}
						summary={`${files.items.length} pages`}
						onClear={files.clear}
						onRemove={files.remove}
						onReorder={files.reorder}
					/>
				)}

				<div className="flex flex-wrap gap-6 items-end">
					<LabeledField label="Page size">
						<div className="h-12 w-[220px]">
							<Select
								currentValue={PAGE_SIZE_LABELS[pageSize]}
								options={Object.values(PAGE_SIZE_LABELS)}
								width="220px"
								onChange={(value) => {
									setPageSize(labelToValue(PAGE_SIZE_LABELS, value, "fit"));
								}}
							/>
						</div>
					</LabeledField>

					{pageSize !== "fit" && (
						<>
							<LabeledField label="Orientation">
								<div className="h-12 w-[200px]">
									<Select
										currentValue={ORIENTATION_LABELS[orientation]}
										options={Object.values(ORIENTATION_LABELS)}
										width="200px"
										onChange={(value) => {
											setOrientation(
												labelToValue(ORIENTATION_LABELS, value, "auto")
											);
										}}
									/>
								</div>
							</LabeledField>

							<LabeledField label="Margin">
								<div className="h-12 w-[160px]">
									<Select
										currentValue={MARGIN_LABELS[margin] ?? "Small"}
										options={Object.values(MARGIN_LABELS)}
										width="160px"
										onChange={(value) => {
											setMargin(labelToValue(MARGIN_LABELS, value, "0.03"));
										}}
									/>
								</div>
							</LabeledField>
						</>
					)}

					<LabeledField grow label="File name">
						<FileNameInput
							extension="pdf"
							id="images-pdf-name"
							placeholder="images"
							value={fileName}
							onChange={setFileName}
						/>
					</LabeledField>
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
					label="Create PDF"
					loading={processLoading}
					loadingLabel="Creating..."
				/>
			</form>

			{guide && <PageGuideSection guide={guide} />}
		</Content>
	);
};
