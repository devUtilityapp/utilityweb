import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

export const Route = createFileRoute("/jwt-decoder")({
	component: lazyRouteComponent(
		async () => import("../pages/JwtDecoder/JwtDecoder"),
		"JwtDecoder"
	),
});
