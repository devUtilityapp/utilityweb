import { Outlet, createRootRoute } from "@tanstack/react-router";
import { Header } from "../components/layout/Header/Header";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import type { FunctionComponent } from "../common/types";
import { Sidebar } from "../components/layout/Sidebar/Sidebar";

function RootComponent(): FunctionComponent {
	return (
		<div className="min-h-screen bg-main-00">
			<Header />
			<main className="mt-16 flex justify-center">
				<Sidebar />
				<div className="lg:w-1/6 lg:block sm:hidden"></div>
				<div className="container lg:py-20 py-10 lg:px-14 px-8 box-border lg:w-2/3 sm:w-full">
					<Outlet />
				</div>
				<div className="lg:w-1/6 lg:block sm:hidden"></div>
			</main>

			<ToastContainer />
		</div>
	);
}

export const Route = createRootRoute({
	component: RootComponent,
});
