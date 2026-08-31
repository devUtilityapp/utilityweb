import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { FunctionComponent } from "../../common/types";
import { replaceAll, runRegex, splitByMatches } from "../../common/regexTest";
import { Content } from "../../components/ui/Content";
import { PageGuideSection } from "../../components/ui/PageGuideSection";
import { RelatedTools } from "../../components/ui/RelatedTools";
import { ToolTextArea } from "../../components/ui/ToolTextArea";
import { LabeledField } from "../../components/ui/LabeledField";

// 자주 쓰는 것만 남겼다. 나머지는 직접 적어도 그대로 넘어간다.
const FLAGS = [
	{ letter: "g", key: "global" },
	{ letter: "i", key: "ignoreCase" },
	{ letter: "m", key: "multiline" },
	{ letter: "s", key: "dotAll" },
	{ letter: "u", key: "unicode" },
];

export const RegexTester = (): FunctionComponent => {
	const { t } = useTranslation();
	const [pattern, setPattern] = useState<string>("");
	const [flags, setFlags] = useState<string>("g");
	const [input, setInput] = useState<string>("");
	const [replacement, setReplacement] = useState<string>("");
	const [showReplace, setShowReplace] = useState(false);

	const toggleFlag = (letter: string): void => {
		setFlags((previous) =>
			previous.includes(letter)
				? previous.replace(letter, "")
				: previous + letter
		);
	};

	const result = runRegex(pattern, flags, input);
	const pieces = splitByMatches(input, result.matches);
	const replaced = showReplace
		? replaceAll(pattern, flags, input, replacement)
		: null;

	return (
		<Content
			categoryName={t("regexTester.category")}
			title={t("regexTester.title")}
		>
			<p className="text-neutral-15 text-sm lg:text-md">
				{t("regexTester.intro")}
			</p>

			<LabeledField grow label={t("regexTester.pattern")}>
				<div className="flex items-center h-12 border border-neutral-05 rounded-xl px-4 gap-2">
					<span className="text-neutral-15 shrink-0">/</span>
					<input
						className="w-full bg-transparent text-neutral-05 outline-none font-mono"
						id="regex-pattern"
						placeholder="\\d{4}-\\d{2}-\\d{2}"
						spellCheck={false}
						type="text"
						value={pattern}
						onChange={(event) => {
							setPattern(event.target.value);
						}}
					/>
					<span className="text-neutral-15 shrink-0">/{flags}</span>
				</div>
			</LabeledField>

			<div className="flex flex-wrap gap-3">
				{FLAGS.map((flag) => (
					<button
						key={flag.letter}
						title={t(`regexTester.flag.${flag.key}` as never)}
						type="button"
						className={`h-9 px-3 rounded-lg border font-mono text-sm transition-colors ${
							flags.includes(flag.letter)
								? "border-green-05 text-neutral-05 bg-main-05"
								: "border-neutral-50 text-neutral-15 hover:text-neutral-05"
						}`}
						onClick={() => {
							toggleFlag(flag.letter);
						}}
					>
						{flag.letter}
					</button>
				))}
			</div>

			<div className="flex flex-col gap-2">
				<div className="text-neutral-15 text-sm">
					{t("regexTester.testText")}
				</div>
				<ToolTextArea
					mono
					height="h-[220px]"
					id="regex-input"
					placeholder={t("regexTester.testPlaceholder")}
					value={input}
					onChange={setInput}
				/>
			</div>

			{result.error !== null && (
				<div className="border border-neutral-05 rounded-xl p-4 text-neutral-05">
					{result.error}
				</div>
			)}

			{result.error === null && pattern !== "" && (
				<div className="flex flex-col gap-4">
					<div className="text-neutral-10">
						{t("regexTester.matchCount", { count: result.matches.length })}
						{result.truncated && ` · ${t("regexTester.truncated")}`}
					</div>

					{input !== "" && (
						<div
							className="border border-neutral-05 rounded-xl p-4 bg-main-00 font-mono text-sm
								whitespace-pre-wrap break-all leading-relaxed"
						>
							{pieces.map((piece, index) => (
								<span
									key={index}
									className={
										piece.matched
											? "bg-green-00 text-green-05 rounded px-0.5"
											: "text-neutral-10"
									}
								>
									{piece.text}
								</span>
							))}
						</div>
					)}

					{result.matches.length > 0 && (
						<div className="overflow-x-auto">
							<table className="w-full text-left border-collapse">
								<thead>
									<tr className="text-neutral-15 text-sm">
										<th className="py-2 pr-4 font-medium">#</th>
										<th className="py-2 pr-4 font-medium">
											{t("regexTester.match")}
										</th>
										<th className="py-2 pr-4 font-medium">
											{t("regexTester.position")}
										</th>
										<th className="py-2 font-medium">
											{t("regexTester.groups")}
										</th>
									</tr>
								</thead>
								<tbody>
									{result.matches.slice(0, 50).map((match, index) => (
										<tr
											key={`${match.index}-${index}`}
											className="border-t border-neutral-50 text-neutral-05 font-mono text-sm"
										>
											<td className="py-2 pr-4 text-neutral-15">{index + 1}</td>
											<td className="py-2 pr-4 break-all">{match.text}</td>
											<td className="py-2 pr-4 text-neutral-10">
												{match.index}
											</td>
											<td className="py-2 text-neutral-10 break-all">
												{Object.keys(match.named).length > 0
													? JSON.stringify(match.named)
													: match.groups.filter(Boolean).join(", ")}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}
				</div>
			)}

			<div className="flex flex-col gap-4">
				<label
					className="flex items-center gap-3 text-neutral-10 cursor-pointer"
					htmlFor="regex-show-replace"
				>
					<input
						checked={showReplace}
						className="w-4 h-4 accent-green-05"
						id="regex-show-replace"
						type="checkbox"
						onChange={(event) => {
							setShowReplace(event.target.checked);
						}}
					/>
					{t("regexTester.showReplace")}
				</label>

				{showReplace && (
					<>
						<LabeledField grow label={t("regexTester.replacement")}>
							<div className="flex items-center h-12 border border-neutral-05 rounded-xl px-4">
								<input
									className="w-full bg-transparent text-neutral-05 outline-none font-mono"
									id="regex-replacement"
									placeholder="$1"
									spellCheck={false}
									type="text"
									value={replacement}
									onChange={(event) => {
										setReplacement(event.target.value);
									}}
								/>
							</div>
						</LabeledField>
						<ToolTextArea
							mono
							readOnly
							height="h-[180px]"
							id="regex-replaced"
							placeholder={t("regexTester.replacedPlaceholder")}
							value={replaced ?? ""}
						/>
					</>
				)}
			</div>

			<RelatedTools path="/regex-tester" />
			<PageGuideSection path="/regex-tester" />
		</Content>
	);
};
