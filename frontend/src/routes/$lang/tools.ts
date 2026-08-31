import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

export const Route = createFileRoute("/$lang/tools")({
	component: lazyRouteComponent(
		async () => import("../../pages/Tools/Tools"),
		"Tools"
	),
});
