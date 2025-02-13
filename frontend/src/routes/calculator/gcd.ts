import { createFileRoute } from "@tanstack/react-router";
import { GCD } from "../../pages/Calculator/GCD";

export const Route = createFileRoute("/calculator/gcd")({
	component: GCD,
});
