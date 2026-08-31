import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

export const Route = createFileRoute("/$lang/merge-pdf")({
	component: lazyRouteComponent(
		async () => import("../../pages/MergePdf/MergePdf"),
		"MergePdf"
	),
});
