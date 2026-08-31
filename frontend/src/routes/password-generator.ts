import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

export const Route = createFileRoute("/password-generator")({
	component: lazyRouteComponent(
		async () => import("../pages/PasswordGenerator/PasswordGenerator"),
		"PasswordGenerator"
	),
});
