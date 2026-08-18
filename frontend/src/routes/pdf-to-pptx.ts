import { createFileRoute } from "@tanstack/react-router";
import { PdfToPptx } from "../pages/PdfToPptx/PdfToPptx";

export const Route = createFileRoute("/pdf-to-pptx")({
	component: PdfToPptx,
});
