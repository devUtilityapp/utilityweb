import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

export const Route = createFileRoute("/$lang/calculator/lcm")({
	component: lazyRouteComponent(
		async () => import("../../../pages/Calculator/LCM"),
		"LCM"
	),
});
