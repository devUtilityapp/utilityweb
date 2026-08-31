import { useState } from "react";
import uuid from "react-uuid";
import { toast } from "react-toastify";
import type { FunctionComponent } from "../../common/types";
import type { PageItem } from "../../common/pdfOrganize";
import { findPageSeo } from "../../common/seo";
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
	const [file, setFile] = useState<File | null>(null);
	const [pages, setPages] = useState<Array<PageItem>>([]);
	const [original, setOriginal] = useState<Array<PageItem>>([]);
	const [reading, setReading] = useState(false);
	const [progress, setProgress] = useState({ done: 0, total: 0 });
	const [fileName, setFileName] = useState<string>("organized");
	const { processLoading, setProcessLoading } = useProcessLoadingStore();

	const addFiles = (files: Array<File>): void => {
		const [first] = files.filter((candidate) => isPdfFile(candidate));
		if (!first) {
			toast.error("Only PDF files are allowed");
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
				toast.error(`Cannot read PDF: ${first.name}`);
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
			toast.error("There are no pages left to save");
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
			toast.success(`${outputName} downloaded (${count} pages)`);
		} catch (error) {
			console.error(error);
			toast.error(
				error instanceof Error ? error.message : "Failed to save the PDF"
			);
		} finally {
			setProcessLoading(false);
		}
	};

	const guide = findPageSeo("/organize-pdf").guide;
	const removed = original.length - pages.length;

	return (
		<Content categoryName="PDF" title="ORGANIZE PDF">
			<p className="text-neutral-15 text-sm lg:text-md">
				See every page as a thumbnail, then reorder, rotate or delete pages and
				save the result. Pages keep their original quality and nothing is
				uploaded.
			</p>

			<form className="flex flex-col gap-8" onSubmit={save}>
				<FileDropzone
					accept="application/pdf,.pdf"
					disabled={reading || processLoading}
					hint="or click to select a file"
					title={file ? file.name : "Drop a PDF file here"}
					onFilesAdded={addFiles}
				/>

				{reading && (
					<ProgressBar
						done={progress.done}
						total={progress.total}
						unit="pages read"
					/>
				)}

				{pages.length > 0 && (
					<>
						<div className="flex items-center justify-between flex-wrap gap-4">
							<div className="text-neutral-05 font-medium text-xl lg:text-2xl">
								Pages ({pages.length})
							</div>
							<div className="flex items-center gap-4">
								{removed > 0 && (
									<div className="text-neutral-15 text-sm">
										{removed} removed
									</div>
								)}
								<ActionButton
									disabled={processLoading}
									label="Reset"
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
					<LabeledField grow label="File name">
						<FileNameInput
							extension="pdf"
							id="organized-file-name"
							placeholder="organized"
							value={fileName}
							onChange={setFileName}
						/>
					</LabeledField>
				</div>

				<ToolButton
					disabled={pages.length === 0}
					label="Save PDF"
					loading={processLoading}
					loadingLabel="Saving..."
				/>
			</form>

			{guide && <PageGuideSection guide={guide} />}
		</Content>
	);
};
