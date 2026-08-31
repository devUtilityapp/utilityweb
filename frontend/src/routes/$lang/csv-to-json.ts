import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

export const Route = createFileRoute("/$lang/csv-to-json")({
	component: lazyRouteComponent(
		async () => import("../../pages/CsvToJson/CsvToJson"),
		"CsvToJson"
	),
});
