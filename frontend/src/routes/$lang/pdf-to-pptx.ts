import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

export const Route = createFileRoute("/$lang/pdf-to-pptx")({
	component: lazyRouteComponent(
		async () => import("../../pages/PdfToPptx/PdfToPptx"),
		"PdfToPptx"
	),
});
