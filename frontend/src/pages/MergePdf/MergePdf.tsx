import { useState } from "react";
import { toast } from "react-toastify";
import type { FunctionComponent } from "../../common/types";
import { findPageSeo } from "../../common/seo";
import { withExtension } from "../../common/download";
import { Content } from "../../components/ui/Content";
import { PageGuideSection } from "../../components/ui/PageGuideSection";
import { FileDropzone } from "../../components/ui/FileDropzone";
import { OrderedFileList } from "../../components/ui/OrderedFileList";
import { ProgressBar } from "../../components/ui/ProgressBar";
import { ToolButton } from "../../components/ui/ToolButton";
import { FileNameInput, LabeledField } from "../../components/ui/LabeledField";
import { useOrderedFiles } from "../../hooks/useOrderedFiles";
import { useProcessLoadingStore } from "../../store/ProcessLoading";

const isPdfFile = (file: File): boolean =>
	file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");

export const MergePdf = (): FunctionComponent => {
	const files = useOrderedFiles();
	const [fileName, setFileName] = useState<string>("merged");
	const [progress, setProgress] = useState({ done: 0, total: 0 });
	const { processLoading, setProcessLoading } = useProcessLoadingStore();

	const addFiles = (added: Array<File>): void => {
		const pdfFiles = added.filter((file) => isPdfFile(file));
		if (pdfFiles.length !== added.length) {
			toast.error("Only PDF files are allowed");
		}
		if (pdfFiles.length === 0) return;

		// 페이지 수는 파일마다 비동기로 읽어 목록에 채운다.
		for (const item of files.add(pdfFiles)) {
			import("../../common/pdfDocument")
				.then(async ({ getPdfPageCount }) => getPdfPageCount(item.file))
				.then((pageCount) => {
					files.setDetail(item.id, `${pageCount} pages`);
				})
				.catch(() => {
					toast.error(`Cannot read PDF: ${item.file.name}`);
					files.remove(item.id);
				});
		}
	};

	const merge = async (
		event: React.FormEvent<HTMLFormElement>
	): Promise<void> => {
		event.preventDefault();
		if (files.items.length < 2) {
			toast.error("Please add at least two PDF files");
			return;
		}

		const outputName = withExtension(fileName, "pdf", "merged");
		setProcessLoading(true);
		setProgress({ done: 0, total: 0 });

		try {
			const { mergePdfs } = await import("../../common/pdfEdit");
			const pageCount = await mergePdfs(
				files.items.map((item) => item.file),
				{
					fileName: outputName,
					onProgress: (done, total) => {
						setProgress({ done, total });
					},
				}
			);
			toast.success(`${outputName} downloaded (${pageCount} pages)`);
		} catch (error) {
			console.error(error);
			toast.error(
				error instanceof Error ? error.message : "Failed to merge the PDF files"
			);
		} finally {
			setProcessLoading(false);
			setProgress({ done: 0, total: 0 });
		}
	};

	const guide = findPageSeo("/merge-pdf").guide;

	return (
		<Content categoryName="PDF" title="MERGE PDF">
			<p className="text-neutral-15 text-sm lg:text-md">
				Join several PDF files into one document, in the order you choose. Pages
				are copied without being re-encoded, and nothing is uploaded.
			</p>

			<form className="flex flex-col gap-8" onSubmit={merge}>
				<FileDropzone
					multiple
					accept="application/pdf,.pdf"
					disabled={processLoading}
					hint="or click to select files (multiple files supported)"
					title="Drop PDF files here"
					onFilesAdded={addFiles}
				/>

				{files.items.length > 0 && (
					<OrderedFileList
						disabled={processLoading}
						hint="Drag the handle to change the page order"
						items={files.items}
						summary={`${files.items.length} files`}
						onClear={files.clear}
						onRemove={files.remove}
						onReorder={files.reorder}
					/>
				)}

				<div className="flex flex-wrap gap-6 items-end">
					<LabeledField grow label="File name">
						<FileNameInput
							extension="pdf"
							id="merged-file-name"
							placeholder="merged"
							value={fileName}
							onChange={setFileName}
						/>
					</LabeledField>
				</div>

				{processLoading && (
					<ProgressBar
						done={progress.done}
						total={progress.total}
						unit="files"
					/>
				)}

				<ToolButton
					disabled={files.items.length < 2}
					label="Merge PDFs"
					loading={processLoading}
					loadingLabel="Merging..."
				/>
			</form>

			{guide && <PageGuideSection guide={guide} />}
		</Content>
	);
};
