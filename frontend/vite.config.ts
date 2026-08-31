import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react-swc";
import path from "node:path";
import { normalizePath } from "vite";
import { viteStaticCopy } from "vite-plugin-static-copy";
import { defineConfig } from "vitest/config";
import { seoPlugin } from "./vite-seo-plugin";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		react(),
		TanStackRouterVite(),
		seoPlugin(new Date().toISOString().slice(0, 10)),
		// 도구가 전부 브라우저 안에서 도는 만큼, 한 번 열어본 도구는
		// 네트워크가 없어도 다시 쓸 수 있어야 한다.
		VitePWA({
			registerType: "autoUpdate",
			includeAssets: ["favicon.svg", "og-image.png"],
			manifest: {
				name: "Utility web",
				short_name: "Utility web",
				description:
					"Free browser based file, image and developer tools. Nothing is uploaded.",
				start_url: "/",
				scope: "/",
				display: "standalone",
				background_color: "#171110",
				theme_color: "#171110",
				icons: [
					{ src: "/icon-192.png", sizes: "192x192", type: "image/png" },
					{ src: "/icon-512.png", sizes: "512x512", type: "image/png" },
					{
						src: "/icon-512.png",
						sizes: "512x512",
						type: "image/png",
						purpose: "maskable",
					},
				],
			},
			workbox: {
				// 앱 껍데기와 작은 청크만 미리 받는다. pdf.js 워커나 pptx 뷰어처럼
				// 큰 파일까지 미리 받으면 첫 방문에 몇 MB를 쓰게 된다.
				globPatterns: ["**/*.{css,html,svg,png,ico,woff2}", "assets/*.js"],
				globIgnores: [
					"**/pdf.worker*",
					"**/pptx-preview*",
					"**/pdfDocument*",
					"**/PDFButton*",
					"pdfjs/**",
					"**/vite-react-boilerplate.png",
				],
				maximumFileSizeToCacheInBytes: 600_000,
				// SPA 경로는 앱 껍데기가 받아서 그린다.
				navigateFallback: "/index.html",
				navigateFallbackDenylist: [/^\/pdfjs\//, /^\/locales\//],
				cleanupOutdatedCaches: true,
				runtimeCaching: [
					{
						// 미리 받지 않은 무거운 청크(pdf.js 등)는 한 번 쓰면 남겨둔다.
						urlPattern: /\/(assets|pdfjs)\/.*\.(js|mjs|bcmap|pfb|ttf)$/,
						handler: "CacheFirst",
						options: {
							cacheName: "heavy-assets",
							expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 30 },
						},
					},
					{
						urlPattern: /\/locales\/.*\.json$/,
						handler: "StaleWhileRevalidate",
						options: { cacheName: "locales" },
					},
				],
			},
		}),
		viteStaticCopy({
			targets: [
				{
					src: normalizePath(path.resolve("./src/assets/locales")),
					dest: normalizePath(path.resolve("./dist")),
				},
				// pdf.js가 표준 폰트와 CJK cmap을 런타임에 받아간다. 없으면 404가 뜨고
				// 한글 등 일부 PDF의 글자가 깨진 채로 렌더링된다.
				{
					src: normalizePath(
						path.resolve("./node_modules/pdfjs-dist/standard_fonts")
					),
					dest: "pdfjs",
				},
				{
					src: normalizePath(path.resolve("./node_modules/pdfjs-dist/cmaps")),
					dest: "pdfjs",
				},
			],
		}),
	],
	server: {
		host: true,
		strictPort: true,
	},
	test: {
		environment: "jsdom",
		setupFiles: ["./vitest.setup.ts"],
		css: true,
	},
});
