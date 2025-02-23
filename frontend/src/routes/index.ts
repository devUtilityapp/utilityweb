import { createFileRoute } from "@tanstack/react-router";
// import { Home } from "../pages/Home";
import { Tools } from "../pages/Tools/Tools";

export const Route = createFileRoute("/")({
	component: Tools,
});
