import { Outlet, createRootRoute } from "@tanstack/react-router";
import { Header } from "../components/layout/Header/Header";

export const Route = createRootRoute({
	component: () => {
		return (
			<div className="min-h-screen bg-main-00">
				<Header />
				<main className="mt-16 flex">
					<div className="w-1/6"></div>
					<div className="container w-2/3 py-20 px-14 box-border">
						<Outlet />
					</div>
					<div className="w-1/6"></div>
				</main>
			</div>
		);
	},
});
