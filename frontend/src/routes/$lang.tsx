import { Outlet, createFileRoute, notFound } from "@tanstack/react-router";
import type { FunctionComponent } from "../common/types";
import { DEFAULT_LANGUAGE, isLanguage } from "../common/languages";
import { NotFound } from "../pages/NotFound/NotFound";

/**
 * 언어 접두사가 붙은 주소(/ko, /ja, /zh)를 받는 자리.
 * 기본 언어인 영어는 접두사 없이 기존 주소를 그대로 쓰므로 여기 오지 않는다.
 */
export const Route = createFileRoute("/$lang")({
	beforeLoad: ({ params }): void => {
		if (params.lang === DEFAULT_LANGUAGE || !isLanguage(params.lang)) {
			// /fr/merge-pdf 같은 주소를 첫 화면으로 돌리면 없는 페이지가 있는 것처럼 보인다.
			// TanStack Router는 notFound 객체를 throw하는 방식으로 알린다.
			// eslint-disable-next-line @typescript-eslint/only-throw-error
			throw notFound();
		}
	},
	component: (): FunctionComponent => <Outlet />,
	// 언어 접두사 아래에서 경로가 맞지 않을 때도 같은 404 화면을 쓴다.
	// 껍데기는 루트가 이미 씌웠으므로 본문만 바꾼다.
	notFoundComponent: NotFound,
});
