import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";
import type { FunctionComponent } from "../common/types";
import { DEFAULT_LANGUAGE, isLanguage } from "../common/languages";

/**
 * 언어 접두사가 붙은 주소(/ko, /ja, /zh)를 받는 자리.
 * 기본 언어인 영어는 접두사 없이 기존 주소를 그대로 쓰므로 여기 오지 않는다.
 */
export const Route = createFileRoute("/$lang")({
	beforeLoad: ({ params }): void => {
		if (params.lang === DEFAULT_LANGUAGE || !isLanguage(params.lang)) {
			// 지원하지 않는 접두사는 영어 첫 화면으로 보낸다.
			// TanStack Router는 redirect 객체를 throw하는 방식으로 이동시킨다.
			// eslint-disable-next-line @typescript-eslint/only-throw-error
			throw redirect({ to: "/" });
		}
	},
	component: (): FunctionComponent => <Outlet />,
});
