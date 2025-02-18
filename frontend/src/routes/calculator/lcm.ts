import { createFileRoute } from "@tanstack/react-router";
import { LCM } from "../../pages/Calculator/LCM";

export const Route = createFileRoute("/calculator/lcm")({
	component: LCM,
});
