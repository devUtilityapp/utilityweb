import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

export const Route = createFileRoute("/merge-pdf")({
	component: lazyRouteComponent(
		async () => import("../pages/MergePdf/MergePdf"),
		"MergePdf"
	),
});
