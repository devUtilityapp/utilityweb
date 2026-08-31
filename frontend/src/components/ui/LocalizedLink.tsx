import { Link } from "@tanstack/react-router";
import type { FunctionComponent } from "../../common/types";
import { localizePath } from "../../common/languages";
import { useLanguage } from "../../hooks/useLanguage";

/**
 * 지금 보고 있는 언어를 유지한 채 이동하는 링크.
 * 경로는 언어 접두사가 없는 형태(/merge-pdf)로 넘기면 된다.
 */
export const LocalizedLink = ({
	to,
	search,
	className,
	activeClassName,
	children,
	onClick,
}: {
	to: string;
	search?: Record<string, string>;
	className?: string;
	activeClassName?: string;
	children: React.ReactNode;
	onClick?: () => void;
}): FunctionComponent => {
	const language = useLanguage();

	return (
		<Link
			className={className}
			// 경로와 마찬가지로 실행 중에 정해지므로 라우터 타입과 맞지 않는다.
			search={search as never}
			// 경로를 실행 중에 조합하므로 라우터가 만든 경로 타입과 맞지 않는다.
			to={localizePath(to, language) as never}
			{...(activeClassName
				? { activeProps: { className: activeClassName } }
				: {})}
			onClick={onClick}
		>
			{children}
		</Link>
	);
};
