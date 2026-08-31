import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

export const Route = createFileRoute("/timestamp-converter")({
	component: lazyRouteComponent(
		async () => import("../pages/TimestampConverter/TimestampConverter"),
		"TimestampConverter"
	),
});
