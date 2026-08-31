import { useEffect, useRef, useState } from "react";
import type { init as initPreviewer } from "pptx-preview";
import type { FunctionComponent } from "../../../common/types";

// 라이브러리는 픽셀 크기를 받아 슬라이드를 그 안에 맞춰 그린다.
const SLIDE_ASPECT_RATIO = 16 / 9;
const MIN_SLIDE_WIDTH = 320;

type Previewer = ReturnType<typeof initPreviewer>;

export const PptxSlideView = ({
	fileData,
	slideIndex,
	onLoaded,
	onError,
}: {
	fileData: ArrayBuffer;
	slideIndex: number;
	onLoaded: (slideCount: number) => void;
	onError: (message: string) => void;
}): FunctionComponent => {
	const containerRef = useRef<HTMLDivElement>(null);
	const previewerRef = useRef<Previewer | null>(null);
	const [width, setWidth] = useState(0);

	// 컨테이너 폭에 맞춰 렌더 크기를 정한다.
	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;

		const updateWidth = (): void => {
			setWidth(Math.max(MIN_SLIDE_WIDTH, container.clientWidth));
		};

		updateWidth();
		const observer = new ResizeObserver(updateWidth);
		observer.observe(container);
		return (): void => {
			observer.disconnect();
		};
	}, []);

	// 파일이나 렌더 크기가 바뀌면 미리보기를 새로 만든다.
	useEffect(() => {
		const container = containerRef.current;
		if (!container || width === 0) return;

		let cancelled = false;
		container.replaceChildren();

		const render = async (): Promise<void> => {
			// 뷰어 라이브러리는 용량이 커서 실제로 파일을 열 때만 불러온다.
			const [{ init }, { removeDanglingOverrides }] = await Promise.all([
				import("pptx-preview"),
				import("../../../common/pptxPackage"),
			]);
			if (cancelled) return;

			const previewer = init(container, {
				width,
				height: Math.round(width / SLIDE_ASPECT_RATIO),
				mode: "slide",
			});
			previewerRef.current = previewer;

			// preview()는 ArrayBuffer를 소비하므로 복사본을 넘긴다.
			const data = await removeDanglingOverrides(fileData.slice(0));
			if (cancelled) return;

			await previewer.preview(data);
			if (cancelled) return;

			onLoaded(previewer.slideCount);
		};

		render().catch((error: unknown) => {
			if (cancelled) return;
			console.error(error);
			onError(
				error instanceof Error ? error.message : "Failed to open this file"
			);
		});

		return (): void => {
			cancelled = true;
			previewerRef.current?.destroy();
			previewerRef.current = null;
		};
		// onLoaded/onError는 렌더마다 새로 만들어지므로 의존성에서 제외한다.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [fileData, width]);

	// 슬라이드 이동은 미리보기를 다시 만들지 않고 해당 슬라이드만 그린다.
	useEffect(() => {
		previewerRef.current?.renderSingleSlide(slideIndex);
	}, [slideIndex]);

	return (
		<div
			ref={containerRef}
			className="pptx_slide_view w-full overflow-hidden rounded-2xl border border-neutral-05 bg-white"
		/>
	);
};
