import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

export const Route = createFileRoute("/$lang/hash-generator")({
	component: lazyRouteComponent(
		async () => import("../../pages/HashGenerator/HashGenerator"),
		"HashGenerator"
	),
});
