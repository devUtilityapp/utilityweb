import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

export const Route = createFileRoute("/$lang/image-converter")({
	component: lazyRouteComponent(
		async () => import("../../pages/ImageConverter/ImageConverter"),
		"ImageConverter"
	),
});
