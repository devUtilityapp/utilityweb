import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

export const Route = createFileRoute("/uuid-generator")({
	component: lazyRouteComponent(
		async () => import("../pages/UuidGenerator/UuidGenerator"),
		"UuidGenerator"
	),
});
