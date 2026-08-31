import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

export const Route = createFileRoute("/$lang/word-counter")({
	component: lazyRouteComponent(
		async () => import("../../pages/WordCounter/WordCounter"),
		"WordCounter"
	),
});
