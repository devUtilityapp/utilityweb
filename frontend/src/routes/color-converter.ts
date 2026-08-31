import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

export const Route = createFileRoute("/color-converter")({
	component: lazyRouteComponent(
		async () => import("../pages/ColorConverter/ColorConverter"),
		"ColorConverter"
	),
});
