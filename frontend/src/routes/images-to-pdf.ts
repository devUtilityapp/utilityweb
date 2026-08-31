import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

export const Route = createFileRoute("/images-to-pdf")({
	component: lazyRouteComponent(
		async () => import("../pages/ImagesToPdf/ImagesToPdf"),
		"ImagesToPdf"
	),
});
