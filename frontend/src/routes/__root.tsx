import { Outlet, createRootRoute } from "@tanstack/react-router";
import { Header } from "../components/layout/Header/Header";

export const Route = createRootRoute({
	component: () => {
		return (
			<div className="min-h-screen bg-gray-50">
				<Header />
				<main className="mt-16">
					<Outlet />
				</main>
			</div>
		);
	},
});
