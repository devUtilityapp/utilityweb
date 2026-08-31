import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

export const Route = createFileRoute("/$lang/compress-pdf")({
	component: lazyRouteComponent(
		async () => import("../../pages/CompressPdf/CompressPdf"),
		"CompressPdf"
	),
});
