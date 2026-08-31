import { useState } from "react";
import uuid from "react-uuid";
import { toast } from "react-toastify";
import type { FunctionComponent } from "../../common/types";
import type { RenderQuality, SlideSize } from "../../common/pdfToPptx";
import { Content } from "../../components/ui/Content";
import { PageGuideSection } from "../../components/ui/PageGuideSection";
import { findPageSeo } from "../../common/seo";
import { Select } from "../../components/ui/Select";
import { FileDropzone } from "../../components/ui/FileDropzone";
import {
	PdfFileList,
	type PdfItem,
} from "../../components/page/PdfToPptx/PdfFileList";
import { useProcessLoadingStore } from "../../store/ProcessLoading";

const SLIDE_SIZE_LABELS: Record<SlideSize, string> = {
	"16:9": "16:9 (Widescreen)",
	"4:3": "4:3 (Standard)",
	fit: "Fit to PDF size",
};

const QUALITY_LABELS: Record<RenderQuality, string> = {
	high: "High (slow, large)",
	medium: "Medium",
	low: "Low (fast, small)",
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

// 한 번에 추가된 파일은 이름 오름차순으로 정렬한다.
// 파일명 안의 숫자는 숫자 크기로 비교한다(file2 < file10).
const sortFilesByName = (files: Array<File>): Array<File> =>
	[...files].sort((first, second) =>
		first.name.localeCompare(second.name, undefined, {
			numeric: true,
			sensitivity: "base",
		})
	);

export const PdfToPptx = (): FunctionComponent => {
	const [items, setItems] = useState<Array<PdfItem>>([]);
	const [slideSize, setSlideSize] = useState<SlideSize>("16:9");
	const [quality, setQuality] = useState<RenderQuality>("medium");
	const [fileName, setFileName] = useState<string>("converted");
	const [progress, setProgress] = useState<{ done: number; total: number }>({
		done: 0,
		total: 0,
	});
	const { processLoading, setProcessLoading } = useProcessLoadingStore();

	const addFiles = (files: Array<File>): void => {
		const pdfFiles = files.filter((file) => isPdfFile(file));
		if (pdfFiles.length !== files.length) {
			toast.error("Only PDF files are allowed");
		}
		if (pdfFiles.length === 0) return;

		const newItems: Array<PdfItem> = sortFilesByName(pdfFiles).map((file) => ({
			id: uuid(),
			file,
			pageCount: null,
		}));
		setItems((previousItems) => [...previousItems, ...newItems]);

		// 페이지 수는 파일마다 비동기로 읽어 목록에 채운다.
		// pdfjs/pptxgenjs는 용량이 커서 필요한 시점에만 동적으로 불러온다.
		for (const item of newItems) {
			import("../../common/pdfToPptx")
				.then(async ({ getPdfPageCount }) => getPdfPageCount(item.file))
				.then((pageCount) => {
					setItems((previousItems) =>
						previousItems.map((previousItem) =>
							previousItem.id === item.id
								? { ...previousItem, pageCount }
								: previousItem
						)
					);
				})
				.catch(() => {
					toast.error(`Cannot read PDF: ${item.file.name}`);
					setItems((previousItems) =>
						previousItems.filter((previousItem) => previousItem.id !== item.id)
					);
				});
		}
	};

	const reorderItems = (fromIndex: number, toIndex: number): void => {
		setItems((previousItems) => {
			if (
				fromIndex === toIndex ||
				fromIndex < 0 ||
				toIndex < 0 ||
				fromIndex >= previousItems.length ||
				toIndex >= previousItems.length
			) {
				return previousItems;
			}
			const nextItems = [...previousItems];
			const [moved] = nextItems.splice(fromIndex, 1);
			if (!moved) return previousItems;
			nextItems.splice(toIndex, 0, moved);
			return nextItems;
		});
	};

	const removeItem = (id: string): void => {
		setItems((previousItems) =>
			previousItems.filter((previousItem) => previousItem.id !== id)
		);
	};

	const convert = async (
		event: React.FormEvent<HTMLFormElement>
	): Promise<void> => {
		event.preventDefault();

		if (items.length === 0) {
			toast.error("Please add at least one PDF file");
			return;
		}
		if (items.some((item) => item.pageCount === null)) {
			toast.error("Still reading PDF files. Please wait a moment");
			return;
		}

		const trimmedName = fileName.trim() || "converted";
		const outputName = trimmedName.toLowerCase().endsWith(".pptx")
			? trimmedName
			: `${trimmedName}.pptx`;

		setProcessLoading(true);
		setProgress({ done: 0, total: 0 });

		try {
			const { convertPdfsToPptx } = await import("../../common/pdfToPptx");
			await convertPdfsToPptx(
				items.map((item) => item.file),
				{
					slideSize,
					quality,
					fileName: outputName,
					onProgress: (done, total) => {
						setProgress({ done, total });
					},
				}
			);
			toast.success(`${outputName} downloaded`);
		} catch (error) {
			console.error(error);
			toast.error(
				error instanceof Error ? error.message : "Failed to convert PDF files"
			);
		} finally {
			setProcessLoading(false);
			setProgress({ done: 0, total: 0 });
		}
	};

	const guide = findPageSeo("/pdf-to-pptx").guide;

	const progressPercent =
		progress.total > 0 ? Math.round((progress.done / progress.total) * 100) : 0;

	return (
		<Content categoryName="PDF" title="PDF TO PPTX">
			<p className="text-neutral-15 text-sm lg:text-md">
				Turn PDF files into a PowerPoint presentation. Every page becomes a
				slide, several PDFs can be merged into one deck, and the conversion runs
				in your browser — nothing is uploaded.
			</p>

			<form className="flex flex-col gap-8" onSubmit={convert}>
				<FileDropzone
					multiple
					accept="application/pdf,.pdf"
					disabled={processLoading}
					hint="or click to select files (multiple files supported)"
					title="Drop PDF files here"
					onFilesAdded={addFiles}
				/>

				{items.length > 0 && (
					<PdfFileList
						disabled={processLoading}
						items={items}
						onRemove={removeItem}
						onReorder={reorderItems}
						onClear={() => {
							setItems([]);
						}}
					/>
				)}

				<div className="flex flex-wrap gap-6 items-end">
					<div className="flex flex-col gap-2">
						<div className="text-neutral-15 text-sm">Slide size</div>
						<div className="h-12 w-[220px]">
							<Select
								currentValue={SLIDE_SIZE_LABELS[slideSize]}
								options={Object.values(SLIDE_SIZE_LABELS)}
								width="220px"
								onChange={(value) => {
									setSlideSize(labelToValue(SLIDE_SIZE_LABELS, value, "16:9"));
								}}
							/>
						</div>
					</div>

					<div className="flex flex-col gap-2">
						<div className="text-neutral-15 text-sm">Quality</div>
						<div className="h-12 w-[200px]">
							<Select
								currentValue={QUALITY_LABELS[quality]}
								options={Object.values(QUALITY_LABELS)}
								width="200px"
								onChange={(value) => {
									setQuality(labelToValue(QUALITY_LABELS, value, "medium"));
								}}
							/>
						</div>
					</div>

					<div className="flex flex-col gap-2 flex-1 min-w-[200px]">
						<div className="text-neutral-15 text-sm">File name</div>
						<div className="flex items-center h-12 border border-neutral-05 rounded-xl px-3">
							<input
								className="w-full bg-transparent text-neutral-05 outline-none font-medium"
								id="pptx-file-name"
								placeholder="converted"
								type="text"
								value={fileName}
								onChange={(event) => {
									setFileName(event.target.value);
								}}
							/>
							<div className="text-neutral-15">.pptx</div>
						</div>
					</div>
				</div>

				{processLoading && progress.total > 0 && (
					<div className="flex flex-col gap-2">
						<div className="w-full h-3 bg-main-05 rounded-full overflow-hidden">
							<div
								className="h-full bg-green-05 transition-all duration-200"
								style={{ width: `${progressPercent}%` }}
							></div>
						</div>
						<div className="text-neutral-15 text-sm text-right">
							{progress.done} / {progress.total} pages ({progressPercent}%)
						</div>
					</div>
				)}

				<button
					disabled={processLoading || items.length === 0}
					type="submit"
					className={`w-full lg:w-1/3 self-end min-w-[150px] border-2 border-neutral-05 flex justify-center items-center
						text-neutral-05 h-16 lg:h-20 lg:rounded-2xl rounded-xl lg:text-2xl text-xl
						${
							processLoading || items.length === 0
								? "bg-neutral-50 cursor-not-allowed"
								: "bg-main-05 hover:bg-main-10"
						}`}
				>
					{processLoading ? "Converting..." : "Convert to PPTX"}
				</button>
			</form>

			{guide && <PageGuideSection guide={guide} />}
		</Content>
	);
};
