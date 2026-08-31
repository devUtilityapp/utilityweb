import { useState } from "react";
import { toast } from "react-toastify";
import type { FunctionComponent } from "../../common/types";
import type { SplitMode } from "../../common/pdfEdit";
import { findPageSeo } from "../../common/seo";
import { stripExtension } from "../../common/download";
import { Content } from "../../components/ui/Content";
import { PageGuideSection } from "../../components/ui/PageGuideSection";
import { FileDropzone } from "../../components/ui/FileDropzone";
import { Select } from "../../components/ui/Select";
import { ToolButton } from "../../components/ui/ToolButton";
import { LabeledField } from "../../components/ui/LabeledField";
import { useProcessLoadingStore } from "../../store/ProcessLoading";

const MODE_LABELS: Record<SplitMode, string> = {
	range: "Selected pages (one PDF)",
	each: "One file per page (ZIP)",
};

const ROTATION_LABELS: Record<string, string> = {
	"0": "Keep as is",
	"90": "Rotate 90° right",
	"180": "Rotate 180°",
	"270": "Rotate 90° left",
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

export const SplitPdf = (): FunctionComponent => {
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
			toast.error("Only PDF files are allowed");
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
				toast.error(`Cannot read PDF: ${first.name}`);
				setFile(null);
			});
	};

	const split = async (
		event: React.FormEvent<HTMLFormElement>
	): Promise<void> => {
		event.preventDefault();
		if (!file) {
			toast.error("Please add a PDF file");
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
				`${result.fileName} downloaded (${result.pageCount} pages)`
			);
		} catch (error) {
			console.error(error);
			toast.error(
				error instanceof Error ? error.message : "Failed to split the PDF"
			);
		} finally {
			setProcessLoading(false);
		}
	};

	const guide = findPageSeo("/split-pdf").guide;

	return (
		<Content categoryName="PDF" title="SPLIT PDF">
			<p className="text-neutral-15 text-sm lg:text-md">
				Extract the pages you need into a new PDF, or break a document into one
				file per page. Pages keep their original quality and nothing is
				uploaded.
			</p>

			<form className="flex flex-col gap-8" onSubmit={split}>
				<FileDropzone
					accept="application/pdf,.pdf"
					disabled={processLoading}
					hint="or click to select a file"
					title={file ? file.name : "Drop a PDF file here"}
					onFilesAdded={addFiles}
				/>

				{file && (
					<div className="text-neutral-15 text-sm">
						{pageCount === null
							? "Reading the document..."
							: `${pageCount} pages in this document`}
					</div>
				)}

				<div className="flex flex-wrap gap-6 items-end">
					<LabeledField label="Output">
						<div className="h-12 w-[240px]">
							<Select
								currentValue={MODE_LABELS[mode]}
								options={Object.values(MODE_LABELS)}
								width="240px"
								onChange={(value) => {
									setMode(labelToValue(MODE_LABELS, value, "range"));
								}}
							/>
						</div>
					</LabeledField>

					{mode === "range" && (
						<LabeledField grow label="Pages">
							<div className="flex items-center h-12 border border-neutral-05 rounded-xl px-3">
								<input
									className="w-full bg-transparent text-neutral-05 outline-none font-medium"
									id="split-ranges"
									placeholder="1-3, 7, 10-"
									type="text"
									value={ranges}
									onChange={(event) => {
										setRanges(event.target.value);
									}}
								/>
							</div>
						</LabeledField>
					)}

					<LabeledField label="Rotation">
						<div className="h-12 w-[200px]">
							<Select
								currentValue={ROTATION_LABELS[rotation] ?? "Keep as is"}
								options={Object.values(ROTATION_LABELS)}
								width="200px"
								onChange={(value) => {
									setRotation(labelToValue(ROTATION_LABELS, value, "0"));
								}}
							/>
						</div>
					</LabeledField>
				</div>

				<ToolButton
					disabled={!file || pageCount === null}
					label="Split PDF"
					loading={processLoading}
					loadingLabel="Splitting..."
				/>
			</form>

			{guide && <PageGuideSection guide={guide} />}
		</Content>
	);
};
