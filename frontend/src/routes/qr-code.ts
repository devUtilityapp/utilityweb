import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

export const Route = createFileRoute("/qr-code")({
	component: lazyRouteComponent(
		async () => import("../pages/QrCode/QrCode"),
		"QrCode"
	),
});
