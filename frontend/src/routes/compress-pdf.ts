import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

export const Route = createFileRoute("/compress-pdf")({
	component: lazyRouteComponent(
		async () => import("../pages/CompressPdf/CompressPdf"),
		"CompressPdf"
	),
});
