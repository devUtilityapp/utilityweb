import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

export const Route = createFileRoute("/$lang/timestamp-converter")({
	component: lazyRouteComponent(
		async () => import("../../pages/TimestampConverter/TimestampConverter"),
		"TimestampConverter"
	),
});
