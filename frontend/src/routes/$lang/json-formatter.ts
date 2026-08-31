import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

export const Route = createFileRoute("/$lang/json-formatter")({
	component: lazyRouteComponent(
		async () => import("../../pages/JsonFormatter/JsonFormatter"),
		"JsonFormatter"
	),
});
