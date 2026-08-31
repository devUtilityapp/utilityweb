import { createRouter } from "@tanstack/react-router";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import { routeTree } from "./routeTree.gen.ts";
import "./styles/tailwind.css";
import "./common/i18n";

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
	interface Register {
		// This infers the type of our router and registers it across your entire project
		router: typeof router;
	}
}

const rootElement = document.querySelector("#root") as Element;

// 빌드 시점에 넣어둔 정적 SEO 본문이 들어 있을 수 있다(vite-seo-plugin.ts).
// 비운 뒤 앱을 그린다. 이미 마운트된 뒤에는 다시 그리지 않는다.
if (!rootElement.hasAttribute("data-mounted")) {
	rootElement.setAttribute("data-mounted", "true");
	rootElement.innerHTML = "";

	const root = ReactDOM.createRoot(rootElement);
	root.render(
		<React.StrictMode>
			<React.Suspense fallback="loading">
				<App router={router} />
			</React.Suspense>
		</React.StrictMode>
	);
}
