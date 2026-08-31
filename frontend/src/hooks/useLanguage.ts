import { useRouterState } from "@tanstack/react-router";
import { splitLanguagePath, type Language } from "../common/languages";

/** 지금 주소가 가리키는 언어와, 언어 접두사를 뗀 경로. */
export const useLanguagePath = (): { language: Language; path: string } => {
	const pathname = useRouterState({
		select: (state) => state.location.pathname,
	});
	return splitLanguagePath(pathname);
};

export const useLanguage = (): Language => useLanguagePath().language;
