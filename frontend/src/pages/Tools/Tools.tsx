import { useState } from "react";
import type { FunctionComponent } from "../../common/types";
import { filterCategories } from "../../common/toolCatalog";
import { Content } from "../../components/ui/Content";
import { ToolCard } from "../../components/page/Tools/ToolCard";
import { ToolCards } from "../../components/page/Tools/ToolCards";

export const Tools = (): FunctionComponent => {
	const [query, setQuery] = useState<string>("");
	const categories = filterCategories(query);

	return (
		<Content categoryName="Tools" title="Tools" tools={false}>
			<p className="text-neutral-15 text-sm lg:text-md text-center mb-2">
				Free tools that run entirely in your browser — files are never uploaded
				to a server.
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
						placeholder="Search tools — pdf, image, qr, json..."
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
					No tool matches “{query}”.
				</div>
			) : (
				<div className="flex flex-col gap-14">
					{categories.map((category) => (
						<ToolCards key={category.title} title={category.title}>
							{category.tools.map((tool) => (
								<ToolCard
									key={`${tool.to}-${tool.name}`}
									search={tool.search}
									to={tool.to}
									toolName={tool.name}
								/>
							))}
						</ToolCards>
					))}
				</div>
			)}
		</Content>
	);
};
