import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

export const Route = createFileRoute("/$lang/regex-tester")({
	component: lazyRouteComponent(
		async () => import("../../pages/RegexTester/RegexTester"),
		"RegexTester"
	),
});
