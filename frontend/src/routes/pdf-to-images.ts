import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

export const Route = createFileRoute("/pdf-to-images")({
	component: lazyRouteComponent(
		async () => import("../pages/PdfToImages/PdfToImages"),
		"PdfToImages"
	),
});
