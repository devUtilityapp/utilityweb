import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

export const Route = createFileRoute("/$lang/calculator/gcd")({
	component: lazyRouteComponent(
		async () => import("../../../pages/Calculator/GCD"),
		"GCD"
	),
});
