import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import type { FunctionComponent } from "../../common/types";
import {
	collapseUnchanged,
	diffLines,
	type DiffChunk,
	type DiffResult,
} from "../../common/textDiff";
import { Content } from "../../components/ui/Content";
import { PageGuideSection } from "../../components/ui/PageGuideSection";
import { RelatedTools } from "../../components/ui/RelatedTools";
import { ToolTextArea } from "../../components/ui/ToolTextArea";
import { ActionButton } from "../../components/ui/ActionButton";

const CONTEXT_LINES = 3;

const MARKS = { equal: " ", add: "+", remove: "-" } as const;

const ROW_STYLES = {
	equal: "text-neutral-10",
	add: "text-green-05 bg-green-00",
	remove: "text-neutral-05 bg-main-05",
} as const;

export const TextDiff = (): FunctionComponent => {
	const { t } = useTranslation();
	const [left, setLeft] = useState<string>("");
	const [right, setRight] = useState<string>("");
	const [ignoreCase, setIgnoreCase] = useState(false);
	const [ignoreWhitespace, setIgnoreWhitespace] = useState(false);
	const [result, setResult] = useState<DiffResult | null>(null);
	const [chunks, setChunks] = useState<Array<DiffChunk>>([]);

	const compare = (): void => {
		if (left === "" && right === "") {
			toast.error(t("textDiff.pasteFirst"));
			return;
		}

		const diff = diffLines(left, right, { ignoreCase, ignoreWhitespace });
		setResult(diff);
		setChunks(collapseUnchanged(diff.lines, CONTEXT_LINES));

		if (diff.added === 0 && diff.removed === 0) {
			toast.success(t("textDiff.identical"));
		}
	};

	return (
		<Content categoryName={t("textDiff.category")} title={t("textDiff.title")}>
			<p className="text-neutral-15 text-sm lg:text-md">
				{t("textDiff.intro")}
			</p>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<div className="flex flex-col gap-2">
					<div className="text-neutral-15 text-sm">
						{t("textDiff.originalLabel")}
					</div>
					<ToolTextArea
						id="diff-left"
						placeholder={t("textDiff.originalPlaceholder")}
						value={left}
						onChange={setLeft}
					/>
				</div>
				<div className="flex flex-col gap-2">
					<div className="text-neutral-15 text-sm">
						{t("textDiff.changedLabel")}
					</div>
					<ToolTextArea
						id="diff-right"
						placeholder={t("textDiff.changedPlaceholder")}
						value={right}
						onChange={setRight}
					/>
				</div>
			</div>

			<div className="flex flex-wrap gap-6 items-center">
				<label
					className="flex items-center gap-3 text-neutral-10 cursor-pointer"
					htmlFor="diff-case"
				>
					<input
						checked={ignoreCase}
						className="w-4 h-4 accent-green-05"
						id="diff-case"
						type="checkbox"
						onChange={(event) => {
							setIgnoreCase(event.target.checked);
						}}
					/>
					{t("textDiff.ignoreCase")}
				</label>
				<label
					className="flex items-center gap-3 text-neutral-10 cursor-pointer"
					htmlFor="diff-whitespace"
				>
					<input
						checked={ignoreWhitespace}
						className="w-4 h-4 accent-green-05"
						id="diff-whitespace"
						type="checkbox"
						onChange={(event) => {
							setIgnoreWhitespace(event.target.checked);
						}}
					/>
					{t("textDiff.ignoreWhitespace")}
				</label>

				<div className="flex gap-4 flex-wrap">
					<ActionButton label={t("textDiff.compare")} onClick={compare} />
					<ActionButton
						disabled={left === "" && right === ""}
						label={t("common.clear")}
						onClick={() => {
							setLeft("");
							setRight("");
							setResult(null);
							setChunks([]);
						}}
					/>
				</div>
			</div>

			{result && (
				<div className="flex flex-col gap-4">
					<div className="flex flex-wrap gap-6 text-neutral-10">
						<span>
							<span className="text-green-05 font-medium">+{result.added}</span>{" "}
							{t("textDiff.added")}
						</span>
						<span>
							<span className="text-neutral-05 font-medium">
								−{result.removed}
							</span>{" "}
							{t("textDiff.removed")}
						</span>
						<span>{t("textDiff.unchanged", { count: result.unchanged })}</span>
					</div>

					<div className="border border-neutral-05 rounded-xl overflow-x-auto">
						{chunks.map((chunk, chunkIndex) => (
							<div key={`chunk-${chunkIndex}`}>
								{chunk.skipped > 0 && (
									<div className="text-neutral-15 text-sm px-4 py-2 border-y border-neutral-50 bg-main-00">
										{t("textDiff.hidden", { count: chunk.skipped })}
									</div>
								)}
								{chunk.lines.map((line, lineIndex) => (
									<div
										key={`${chunkIndex}-${lineIndex}`}
										className={`flex gap-3 font-mono text-sm px-4 py-1 ${ROW_STYLES[line.type]}`}
									>
										<span className="w-10 shrink-0 text-right text-neutral-15">
											{line.leftNumber ?? ""}
										</span>
										<span className="w-10 shrink-0 text-right text-neutral-15">
											{line.rightNumber ?? ""}
										</span>
										<span className="w-3 shrink-0">{MARKS[line.type]}</span>
										<span className="whitespace-pre-wrap break-all">
											{line.text === "" ? " " : line.text}
										</span>
									</div>
								))}
							</div>
						))}
					</div>
				</div>
			)}

			<RelatedTools path="/text-diff" />
			<PageGuideSection path="/text-diff" />
		</Content>
	);
};
