import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

export const Route = createFileRoute("/pptx-viewer")({
	component: lazyRouteComponent(
		async () => import("../pages/PptxViewer/PptxViewer"),
		"PptxViewer"
	),
});
