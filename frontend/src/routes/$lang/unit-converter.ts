import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

export const Route = createFileRoute("/$lang/unit-converter")({
	component: lazyRouteComponent(
		async () => import("../../pages/UnitConverter/UnitConverter"),
		"UnitConverter"
	),
});
