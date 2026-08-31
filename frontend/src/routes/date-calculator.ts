import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

export const Route = createFileRoute("/date-calculator")({
	component: lazyRouteComponent(
		async () => import("../pages/DateCalculator/DateCalculator"),
		"DateCalculator"
	),
});
