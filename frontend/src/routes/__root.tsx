import { Outlet, createRootRoute } from "@tanstack/react-router";
import { Header } from "../components/layout/Header/Header";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useEffect } from "react";
import type { FunctionComponent } from "../common/types";
import { Sidebar } from "../components/layout/Sidebar/Sidebar";

function RootComponent(): FunctionComponent {
	const setSidebarHeight = (): void => {
		const header = document.getElementById("header");
		const sidebar = document.getElementById("sidebar");
		if (header && sidebar) {
			sidebar.style.height = `${window.innerHeight - header.clientHeight + 1}px`;
		}
	};

	useEffect(() => {
		setSidebarHeight();
	}, []);

	return (
		<div className="min-h-screen bg-main-00">
			<Header />
			<main className="mt-16 flex">
				<Sidebar />
				<div className="w-1/6"></div>
				<div className="container w-2/3 py-20 px-14 box-border">
					<Outlet />
				</div>
				<div className="w-1/6"></div>
			</main>

			<ToastContainer />
		</div>
	);
}

export const Route = createRootRoute({
	component: RootComponent,
});
