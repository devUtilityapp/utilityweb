import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

export const Route = createFileRoute("/$lang/split-pdf")({
	component: lazyRouteComponent(
		async () => import("../../pages/SplitPdf/SplitPdf"),
		"SplitPdf"
	),
});
