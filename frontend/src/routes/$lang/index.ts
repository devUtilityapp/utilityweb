import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

export const Route = createFileRoute("/$lang/")({
	component: lazyRouteComponent(
		async () => import("../../pages/Tools/Tools"),
		"Tools"
	),
});
