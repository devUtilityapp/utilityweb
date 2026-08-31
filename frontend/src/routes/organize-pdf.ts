import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

export const Route = createFileRoute("/organize-pdf")({
	component: lazyRouteComponent(
		async () => import("../pages/OrganizePdf/OrganizePdf"),
		"OrganizePdf"
	),
});
