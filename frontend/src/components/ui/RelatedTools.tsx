import { useTranslation } from "react-i18next";
import type { FunctionComponent } from "../../common/types";
import { relatedTools } from "../../common/toolCatalog";
import { tDynamic } from "../../common/translate";
import { LocalizedLink } from "./LocalizedLink";

/**
 * 도구 페이지 아래에 붙는 다음 도구 목록.
 * 하나를 끝낸 사람이 사이드바를 열지 않고도 이어서 쓸 것을 찾게 한다.
 */
export const RelatedTools = ({ path }: { path: string }): FunctionComponent => {
	const { t } = useTranslation();
	const tools = relatedTools(path);

	if (tools.length === 0) return null;

	return (
		<section className="flex flex-col gap-4 border-t border-neutral-50 pt-10 mt-4">
			<h2 className="text-neutral-05 font-medium text-xl lg:text-2xl">
				{t("common.relatedTools")}
			</h2>
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
				{tools.map((tool) => (
					<LocalizedLink
						key={tool.to}
						search={tool.search}
						to={tool.to}
						className="flex items-center justify-center text-center px-3 py-4 rounded-xl
							border border-neutral-50 text-neutral-10 hover:text-neutral-05
							hover:border-neutral-15 transition-colors"
					>
						{tDynamic(t, `tools.${tool.key}.name`)}
					</LocalizedLink>
				))}
			</div>
		</section>
	);
};
