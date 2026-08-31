import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

export const Route = createFileRoute("/$lang/password-generator")({
	component: lazyRouteComponent(
		async () => import("../../pages/PasswordGenerator/PasswordGenerator"),
		"PasswordGenerator"
	),
});
