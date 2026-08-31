import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

export const Route = createFileRoute("/$lang/date-calculator")({
	component: lazyRouteComponent(
		async () => import("../../pages/DateCalculator/DateCalculator"),
		"DateCalculator"
	),
});
