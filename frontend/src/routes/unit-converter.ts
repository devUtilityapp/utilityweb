import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

export const Route = createFileRoute("/unit-converter")({
	component: lazyRouteComponent(
		async () => import("../pages/UnitConverter/UnitConverter"),
		"UnitConverter"
	),
});
