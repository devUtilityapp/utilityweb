import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { FunctionComponent } from "../../common/types";
import {
	filterCategories,
	type ToolCategory,
	type ToolEntry,
} from "../../common/toolCatalog";
import { tDynamic } from "../../common/translate";
import { Content } from "../../components/ui/Content";
import { ToolCard } from "../../components/page/Tools/ToolCard";
import { ToolCards } from "../../components/page/Tools/ToolCards";

export const Tools = (): FunctionComponent => {
	const { t } = useTranslation();
	const [query, setQuery] = useState<string>("");

	// 이름과 분류는 번역된 문구로, 검색어는 영문 약어 그대로 찾을 수 있게 한다.
	const searchTextOf = (category: ToolCategory, tool: ToolEntry): string =>
		[
			tDynamic(t, `tools.${tool.key}.name`),
			tDynamic(t, `categories.${category.key}`),
			...tool.keywords,
		].join(" ");

	const categories = filterCategories(query, searchTextOf);

	return (
		<Content categoryName={t("nav.tools")} title={t("nav.tools")} tools={false}>
			<p className="text-neutral-15 text-sm lg:text-md text-center mb-2">
				{t("toolsPage.intro")}
			</p>

			<div className="flex justify-center">
				<div className="flex items-center h-12 w-full max-w-[420px] border border-neutral-05 rounded-xl px-4">
					<svg
						aria-hidden="true"
						fill="none"
						height="18"
						viewBox="0 0 20 20"
						width="18"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							d="M9 15A6 6 0 1 0 9 3a6 6 0 0 0 0 12ZM17 17l-3.5-3.5"
							stroke="#7C7C6F"
							strokeLinecap="round"
							strokeWidth="1.8"
						/>
					</svg>
					<input
						className="w-full bg-transparent text-neutral-05 outline-none font-medium px-3"
						id="tool-search"
						placeholder={t("toolsPage.searchPlaceholder")}
						type="search"
						value={query}
						onChange={(event) => {
							setQuery(event.target.value);
						}}
					/>
				</div>
			</div>

			{categories.length === 0 ? (
				<div className="text-neutral-15 text-center py-10">
					{t("toolsPage.noResults", { query })}
				</div>
			) : (
				<div className="flex flex-col gap-14">
					{categories.map((category) => (
						<ToolCards
							key={category.key}
							title={tDynamic(t, `categories.${category.key}`)}
						>
							{category.tools.map((tool) => (
								<ToolCard
									key={`${tool.to}-${tool.key}`}
									search={tool.search}
									to={tool.to}
									toolName={tDynamic(t, `tools.${tool.key}.name`)}
								/>
							))}
						</ToolCards>
					))}
				</div>
			)}
		</Content>
	);
};
