import { Outlet, createRootRoute } from "@tanstack/react-router";
import type { FunctionComponent } from "../common/types";
import { AppLayout } from "../components/layout/AppLayout";
import { NotFound } from "../pages/NotFound/NotFound";

export const Route = createRootRoute({
	component: (): FunctionComponent => (
		<AppLayout>
			<Outlet />
		</AppLayout>
	),
	// 루트의 notFoundComponent는 component를 통째로 대신하므로 껍데기를 다시 씌운다.
	notFoundComponent: (): FunctionComponent => (
		<AppLayout>
			<NotFound />
		</AppLayout>
	),
});
