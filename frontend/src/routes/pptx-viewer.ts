import { createFileRoute } from "@tanstack/react-router";
import { PptxViewer } from "../pages/PptxViewer/PptxViewer";

export const Route = createFileRoute("/pptx-viewer")({
	component: PptxViewer,
});
