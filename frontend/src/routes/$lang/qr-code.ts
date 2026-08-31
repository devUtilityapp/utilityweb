import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

export const Route = createFileRoute("/$lang/qr-code")({
	component: lazyRouteComponent(
		async () => import("../../pages/QrCode/QrCode"),
		"QrCode"
	),
});
