import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

export const Route = createFileRoute("/text-diff")({
	component: lazyRouteComponent(
		async () => import("../pages/TextDiff/TextDiff"),
		"TextDiff"
	),
});
