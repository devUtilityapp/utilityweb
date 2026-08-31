import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import type { FunctionComponent } from "../../common/types";
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
	const { t } = useTranslation();
	const files = useOrderedFiles();
	const [fileName, setFileName] = useState<string>(t("mergePdf.defaultName"));
	const [progress, setProgress] = useState({ done: 0, total: 0 });
	const { processLoading, setProcessLoading } = useProcessLoadingStore();

	const addFiles = (added: Array<File>): void => {
		const pdfFiles = added.filter((file) => isPdfFile(file));
		if (pdfFiles.length !== added.length) {
			toast.error(t("common.onlyPdf"));
		}
		if (pdfFiles.length === 0) return;

		// 페이지 수는 파일마다 비동기로 읽어 목록에 채운다.
		for (const item of files.add(pdfFiles)) {
			import("../../common/pdfDocument")
				.then(async ({ getPdfPageCount }) => getPdfPageCount(item.file))
				.then((pageCount) => {
					files.setDetail(item.id, t("common.pages", { count: pageCount }));
				})
				.catch(() => {
					toast.error(t("common.cannotReadPdf", { name: item.file.name }));
					files.remove(item.id);
				});
		}
	};

	const merge = async (
		event: React.FormEvent<HTMLFormElement>
	): Promise<void> => {
		event.preventDefault();
		if (files.items.length < 2) {
			toast.error(t("mergePdf.addTwo"));
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
			toast.success(t("mergePdf.done", { name: outputName, count: pageCount }));
		} catch (error) {
			console.error(error);
			toast.error(
				error instanceof Error ? error.message : t("mergePdf.failed")
			);
		} finally {
			setProcessLoading(false);
			setProgress({ done: 0, total: 0 });
		}
	};

	return (
		<Content categoryName={t("mergePdf.category")} title={t("mergePdf.title")}>
			<p className="text-neutral-15 text-sm lg:text-md">
				{t("mergePdf.intro")}
			</p>

			<form className="flex flex-col gap-8" onSubmit={merge}>
				<FileDropzone
					multiple
					accept="application/pdf,.pdf"
					disabled={processLoading}
					hint={t("common.clickToSelectFiles")}
					title={t("common.dropPdfs")}
					onFilesAdded={addFiles}
				/>

				{files.items.length > 0 && (
					<OrderedFileList
						disabled={processLoading}
						hint={t("common.dragToReorder")}
						items={files.items}
						summary={t("mergePdf.fileCount", { count: files.items.length })}
						onClear={files.clear}
						onRemove={files.remove}
						onReorder={files.reorder}
					/>
				)}

				<div className="flex flex-wrap gap-6 items-end">
					<LabeledField grow label={t("common.fileName")}>
						<FileNameInput
							extension="pdf"
							id="merged-file-name"
							placeholder={t("mergePdf.defaultName")}
							value={fileName}
							onChange={setFileName}
						/>
					</LabeledField>
				</div>

				{processLoading && (
					<ProgressBar
						done={progress.done}
						total={progress.total}
						unit={t("common.files")}
					/>
				)}

				<ToolButton
					disabled={files.items.length < 2}
					label={t("mergePdf.action")}
					loading={processLoading}
					loadingLabel={t("mergePdf.working")}
				/>
			</form>

			<PageGuideSection path="/merge-pdf" />
		</Content>
	);
};
