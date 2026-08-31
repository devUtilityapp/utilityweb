import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

export const Route = createFileRoute("/image-converter")({
	component: lazyRouteComponent(
		async () => import("../pages/ImageConverter/ImageConverter"),
		"ImageConverter"
	),
});
