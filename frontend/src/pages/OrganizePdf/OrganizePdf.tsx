import { useState } from "react";
import { useTranslation } from "react-i18next";
import uuid from "react-uuid";
import { toast } from "react-toastify";
import type { FunctionComponent } from "../../common/types";
import type { PageItem } from "../../common/pdfOrganize";
import { stripExtension, withExtension } from "../../common/download";
import { Content } from "../../components/ui/Content";
import { PageGuideSection } from "../../components/ui/PageGuideSection";
import { FileDropzone } from "../../components/ui/FileDropzone";
import { ProgressBar } from "../../components/ui/ProgressBar";
import { ToolButton } from "../../components/ui/ToolButton";
import { ActionButton } from "../../components/ui/ActionButton";
import { FileNameInput, LabeledField } from "../../components/ui/LabeledField";
import { PageGrid } from "../../components/page/OrganizePdf/PageGrid";
import { useProcessLoadingStore } from "../../store/ProcessLoading";

const isPdfFile = (file: File): boolean =>
	file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");

export const OrganizePdf = (): FunctionComponent => {
	const { t } = useTranslation();
	const [file, setFile] = useState<File | null>(null);
	const [pages, setPages] = useState<Array<PageItem>>([]);
	const [original, setOriginal] = useState<Array<PageItem>>([]);
	const [reading, setReading] = useState(false);
	const [progress, setProgress] = useState({ done: 0, total: 0 });
	const [fileName, setFileName] = useState<string>(
		t("organizePdf.defaultName")
	);
	const { processLoading, setProcessLoading } = useProcessLoadingStore();

	const addFiles = (files: Array<File>): void => {
		const [first] = files.filter((candidate) => isPdfFile(candidate));
		if (!first) {
			toast.error(t("common.onlyPdf"));
			return;
		}

		setFile(first);
		setFileName(`${stripExtension(first.name)}-organized`);
		setPages([]);
		setOriginal([]);
		setReading(true);
		setProgress({ done: 0, total: 0 });

		import("../../common/pdfOrganize")
			.then(async ({ renderThumbnails }) =>
				renderThumbnails(first, (done, total) => {
					setProgress({ done, total });
				})
			)
			.then((thumbnails) => {
				const items = thumbnails.map((entry) => ({
					id: uuid(),
					index: entry.index,
					thumbnail: entry.thumbnail,
					rotation: 0,
				}));
				setPages(items);
				setOriginal(items);
			})
			.catch((error: unknown) => {
				console.error(error);
				toast.error(t("common.cannotReadPdf", { name: first.name }));
				setFile(null);
			})
			.finally(() => {
				setReading(false);
			});
	};

	const movePage = (fromIndex: number, toIndex: number): void => {
		setPages((previous) => {
			if (toIndex < 0 || toIndex >= previous.length) return previous;
			const next = [...previous];
			const [moved] = next.splice(fromIndex, 1);
			if (!moved) return previous;
			next.splice(toIndex, 0, moved);
			return next;
		});
	};

	const rotatePage = (id: string): void => {
		setPages((previous) =>
			previous.map((page) =>
				page.id === id
					? { ...page, rotation: (page.rotation + 90) % 360 }
					: page
			)
		);
	};

	const removePage = (id: string): void => {
		setPages((previous) => previous.filter((page) => page.id !== id));
	};

	const save = async (
		event: React.FormEvent<HTMLFormElement>
	): Promise<void> => {
		event.preventDefault();
		if (!file || pages.length === 0) {
			toast.error(t("organizePdf.noPages"));
			return;
		}

		const outputName = withExtension(fileName, "pdf", "organized");
		setProcessLoading(true);

		try {
			const { applyPageChanges } = await import("../../common/pdfOrganize");
			const count = await applyPageChanges(
				file,
				pages.map((page) => ({ index: page.index, rotation: page.rotation })),
				outputName
			);
			toast.success(t("organizePdf.done", { name: outputName, count }));
		} catch (error) {
			console.error(error);
			toast.error(
				error instanceof Error ? error.message : t("organizePdf.failed")
			);
		} finally {
			setProcessLoading(false);
		}
	};

	const removed = original.length - pages.length;

	return (
		<Content
			categoryName={t("organizePdf.category")}
			title={t("organizePdf.title")}
		>
			<p className="text-neutral-15 text-sm lg:text-md">
				{t("organizePdf.intro")}
			</p>

			<form className="flex flex-col gap-8" onSubmit={save}>
				<FileDropzone
					accept="application/pdf,.pdf"
					disabled={reading || processLoading}
					hint={t("common.clickToSelectFile")}
					title={file ? file.name : t("common.dropPdf")}
					onFilesAdded={addFiles}
				/>

				{reading && (
					<ProgressBar
						done={progress.done}
						total={progress.total}
						unit={t("organizePdf.pagesRead")}
					/>
				)}

				{pages.length > 0 && (
					<>
						<div className="flex items-center justify-between flex-wrap gap-4">
							<div className="text-neutral-05 font-medium text-xl lg:text-2xl">
								{t("organizePdf.pageHeading", { count: pages.length })}
							</div>
							<div className="flex items-center gap-4">
								{removed > 0 && (
									<div className="text-neutral-15 text-sm">
										{t("organizePdf.removed", { count: removed })}
									</div>
								)}
								<ActionButton
									disabled={processLoading}
									label={t("organizePdf.reset")}
									onClick={() => {
										setPages(original);
									}}
								/>
							</div>
						</div>

						<PageGrid
							disabled={processLoading}
							pages={pages}
							onMove={movePage}
							onRemove={removePage}
							onRotate={rotatePage}
						/>
					</>
				)}

				<div className="flex flex-wrap gap-6 items-end">
					<LabeledField grow label={t("common.fileName")}>
						<FileNameInput
							extension="pdf"
							id="organized-file-name"
							placeholder={t("organizePdf.defaultName")}
							value={fileName}
							onChange={setFileName}
						/>
					</LabeledField>
				</div>

				<ToolButton
					disabled={pages.length === 0}
					label={t("organizePdf.action")}
					loading={processLoading}
					loadingLabel={t("organizePdf.working")}
				/>
			</form>

			<PageGuideSection path="/organize-pdf" />
		</Content>
	);
};
