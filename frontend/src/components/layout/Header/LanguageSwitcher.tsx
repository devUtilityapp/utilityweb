import { Link } from "@tanstack/react-router";
import type { FunctionComponent } from "../../../common/types";
import {
	LANGUAGES,
	LANGUAGE_NAMES,
	localizePath,
} from "../../../common/languages";
import { useLanguagePath } from "../../../hooks/useLanguage";

/**
 * 지금 보고 있는 페이지의 다른 언어판으로 넘어간다.
 * 언어만 바꾸고 페이지는 그대로 두는 것이 핵심이라 첫 화면으로 보내지 않는다.
 */
export const LanguageSwitcher = (): FunctionComponent => {
	const { language, path } = useLanguagePath();

	return (
		<div className="flex items-center gap-1">
			{LANGUAGES.map((option) => (
				<Link
					key={option}
					hrefLang={option}
					title={LANGUAGE_NAMES[option]}
					// 경로를 실행 중에 조합하므로 라우터가 만든 경로 타입과 맞지 않는다.
					to={localizePath(path, option) as never}
					className={`px-2 py-1 rounded-md text-sm transition-colors ${
						option === language
							? "text-neutral-00 font-medium"
							: "text-neutral-15 hover:text-neutral-05"
					}`}
				>
					{LANGUAGE_NAMES[option]}
				</Link>
			))}
		</div>
	);
};
