import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import type { FunctionComponent } from "../../common/types";
import { Content } from "../../components/ui/Content";
import { FileDropzone } from "../../components/ui/FileDropzone";
import { PageGuideSection } from "../../components/ui/PageGuideSection";
import { RelatedTools } from "../../components/ui/RelatedTools";
import { PptxSlideView } from "../../components/page/PptxViewer/PptxSlideView";

interface LoadedFile {
	name: string;
	data: ArrayBuffer;
}

const isPptxFile = (file: File): boolean =>
	file.name.toLowerCase().endsWith(".pptx") ||
	file.type ===
		"application/vnd.openxmlformats-officedocument.presentationml.presentation";

export const PptxViewer = (): FunctionComponent => {
	const { t } = useTranslation();
	const [file, setFile] = useState<LoadedFile | null>(null);
	const [slideCount, setSlideCount] = useState(0);
	const [slideIndex, setSlideIndex] = useState(0);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const viewerRef = useRef<HTMLDivElement>(null);

	const openFiles = (files: Array<File>): void => {
		const pptxFile = files.find((candidate) => isPptxFile(candidate));
		if (!pptxFile) {
			toast.error(t("pptxViewer.onlyPptx"));
			return;
		}

		setLoading(true);
		setError(null);
		setSlideCount(0);
		setSlideIndex(0);

		pptxFile
			.arrayBuffer()
			.then((data) => {
				setFile({ name: pptxFile.name, data });
			})
			.catch(() => {
				setLoading(false);
				toast.error(`Cannot read ${pptxFile.name}`);
			});
	};

	const handleLoaded = useCallback((count: number): void => {
		setSlideCount(count);
		setLoading(false);
		if (count === 0) {
			setError("This file has no slides");
		}
	}, []);

	const handleError = useCallback((message: string): void => {
		setLoading(false);
		setError(message);
		toast.error(message);
	}, []);

	const goToSlide = useCallback(
		(index: number): void => {
			if (slideCount === 0) return;
			setSlideIndex(Math.min(Math.max(index, 0), slideCount - 1));
		},
		[slideCount]
	);

	// 좌우 방향키로도 넘길 수 있게 한다.
	useEffect(() => {
		if (slideCount === 0) return;

		const handleKeyDown = (event: KeyboardEvent): void => {
			const target = event.target as HTMLElement | null;
			if (target?.tagName === "INPUT" || target?.tagName === "TEXTAREA") return;

			if (event.key === "ArrowRight" || event.key === "PageDown") {
				setSlideIndex((previousIndex) =>
					Math.min(previousIndex + 1, slideCount - 1)
				);
			} else if (event.key === "ArrowLeft" || event.key === "PageUp") {
				setSlideIndex((previousIndex) => Math.max(previousIndex - 1, 0));
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return (): void => {
			window.removeEventListener("keydown", handleKeyDown);
		};
	}, [slideCount]);

	const toggleFullscreen = async (): Promise<void> => {
		const element = viewerRef.current;
		if (!element) return;

		try {
			if (document.fullscreenElement) {
				await document.exitFullscreen();
			} else {
				await element.requestFullscreen();
			}
		} catch (fullscreenError) {
			console.error(fullscreenError);
			toast.error(t("pptxViewer.fullscreenFailed"));
		}
	};

	const closeFile = (): void => {
		setFile(null);
		setSlideCount(0);
		setSlideIndex(0);
		setError(null);
		setLoading(false);
	};

	return (
		<Content
			categoryName={t("pptxViewer.category")}
			title={t("pptxViewer.title")}
		>
			<div className="flex flex-col gap-8">
				<p className="text-neutral-15 text-sm lg:text-md">
					{t("pptxViewer.intro")}
				</p>

				{!file && (
					<FileDropzone
						accept=".pptx,application/vnd.openxmlformats-officedocument.presentationml.presentation"
						hint={t("pptxViewer.hint")}
						title={t("pptxViewer.drop")}
						onFilesAdded={openFiles}
					/>
				)}

				{error && (
					<div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
						{error}
					</div>
				)}

				{file && (
					<div className="flex flex-col gap-4">
						<div className="flex flex-wrap items-center justify-between gap-4">
							<div className="text-neutral-05 font-medium truncate min-w-0">
								{file.name}
							</div>
							<div className="flex items-center gap-3">
								<button
									className="text-neutral-15 text-sm underline hover:text-neutral-05"
									type="button"
									onClick={closeFile}
								>
									{t("pptxViewer.openAnother")}
								</button>
							</div>
						</div>

						<div ref={viewerRef} className="bg-main-00">
							<PptxSlideView
								fileData={file.data}
								slideIndex={slideIndex}
								onError={handleError}
								onLoaded={handleLoaded}
							/>
						</div>

						{loading && (
							<div className="text-neutral-15 text-sm">
								{t("pptxViewer.rendering")}
							</div>
						)}

						{slideCount > 0 && (
							<div className="flex flex-wrap items-center justify-center gap-4">
								<button
									className="px-4 h-10 rounded-xl border border-neutral-05 text-neutral-05 disabled:opacity-30 hover:bg-main-05"
									disabled={slideIndex === 0}
									type="button"
									onClick={() => {
										goToSlide(slideIndex - 1);
									}}
								>
									← Prev
								</button>

								<div className="flex items-center gap-2 text-neutral-05">
									<input
										aria-label={t("pptxViewer.slideNumber")}
										className="w-16 h-10 text-center bg-main-00 border border-neutral-05 rounded-xl outline-none"
										max={slideCount}
										min={1}
										type="number"
										value={slideIndex + 1}
										onChange={(event) => {
											const value = Number(event.target.value);
											if (!Number.isNaN(value)) goToSlide(value - 1);
										}}
									/>
									<span className="text-neutral-15">/ {slideCount}</span>
								</div>

								<button
									className="px-4 h-10 rounded-xl border border-neutral-05 text-neutral-05 disabled:opacity-30 hover:bg-main-05"
									disabled={slideIndex === slideCount - 1}
									type="button"
									onClick={() => {
										goToSlide(slideIndex + 1);
									}}
								>
									Next →
								</button>

								<button
									className="px-4 h-10 rounded-xl border border-neutral-05 text-neutral-05 hover:bg-main-05"
									type="button"
									onClick={() => {
										void toggleFullscreen();
									}}
								>
									{t("pptxViewer.fullscreen")}
								</button>
							</div>
						)}

						<div className="text-neutral-15 text-sm text-center">
							Use ← → keys to move between slides. Rendering is an approximation
							— complex charts, SmartArt and animations may differ from
							PowerPoint.
						</div>
					</div>
				)}

				<RelatedTools path="/pptx-viewer" />
				<PageGuideSection path="/pptx-viewer" />
			</div>
		</Content>
	);
};
