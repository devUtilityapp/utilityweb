import { TanStackRouterVite } from "@tanstack/router-plugin/vite"
import react from "@vitejs/plugin-react-swc";
import path from "node:path";
import { normalizePath } from "vite";
import { viteStaticCopy } from "vite-plugin-static-copy";
import { defineConfig } from "vitest/config";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react(), TanStackRouterVite(), 
		viteStaticCopy({
		targets: [
		  {
			src: normalizePath(path.resolve('./src/assets/locales')),
			dest: normalizePath(path.resolve('./dist'))
		  },
		  // pdf.js가 표준 폰트와 CJK cmap을 런타임에 받아간다. 없으면 404가 뜨고
		  // 한글 등 일부 PDF의 글자가 깨진 채로 렌더링된다.
		  {
			src: normalizePath(path.resolve('./node_modules/pdfjs-dist/standard_fonts')),
			dest: 'pdfjs'
		  },
		  {
			src: normalizePath(path.resolve('./node_modules/pdfjs-dist/cmaps')),
			dest: 'pdfjs'
		  }
		]
	  })],
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
