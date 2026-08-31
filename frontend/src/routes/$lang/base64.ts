import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

export const Route = createFileRoute("/$lang/base64")({
	component: lazyRouteComponent(
		async () => import("../../pages/Base64/Base64"),
		"Base64"
	),
});
