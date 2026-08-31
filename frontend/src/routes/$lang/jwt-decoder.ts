import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

export const Route = createFileRoute("/$lang/jwt-decoder")({
	component: lazyRouteComponent(
		async () => import("../../pages/JwtDecoder/JwtDecoder"),
		"JwtDecoder"
	),
});
