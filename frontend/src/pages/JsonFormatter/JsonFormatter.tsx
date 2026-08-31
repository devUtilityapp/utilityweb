import { useState } from "react";
import { useTranslation } from "react-i18next";
import { tDynamic } from "../../common/translate";
import { toast } from "react-toastify";
import type { FunctionComponent } from "../../common/types";
import {
	countNodes,
	formatJson,
	minifyJson,
	type IndentStyle,
	type JsonError,
} from "../../common/jsonFormat";
import { downloadBlob, formatBytes } from "../../common/download";
import { Content } from "../../components/ui/Content";
import { PageGuideSection } from "../../components/ui/PageGuideSection";
import { RelatedTools } from "../../components/ui/RelatedTools";
import { Select } from "../../components/ui/Select";
import { LabeledField } from "../../components/ui/LabeledField";
import { ActionButton } from "../../components/ui/ActionButton";

const INDENT_KEYS: Record<IndentStyle, string> = {
	"2": "jsonFormatter.indent2",
	"4": "jsonFormatter.indent4",
	tab: "jsonFormatter.indentTab",
};

const labelToValue = <T extends string>(
	labels: Record<string, string>,
	label: string,
	fallback: T
): T => {
	const entry = Object.entries(labels).find(([, text]) => text === label);
	return entry ? (entry[0] as T) : fallback;
};

export const JsonFormatter = (): FunctionComponent => {
	const { t } = useTranslation();
	const [input, setInput] = useState<string>("");
	const [output, setOutput] = useState<string>("");
	const [error, setError] = useState<JsonError | null>(null);
	const [indent, setIndent] = useState<IndentStyle>("2");
	const [sort, setSort] = useState<boolean>(false);

	const apply = (transform: "format" | "minify"): void => {
		if (input.trim() === "") {
			toast.error(t("jsonFormatter.pasteFirst"));
			return;
		}

		const result =
			transform === "format"
				? formatJson(input, { indent, sort })
				: minifyJson(input, { sort });

		setError(result.error);
		setOutput(result.output);
		if (result.error) {
			toast.error(
				result.error.line === null
					? t("jsonFormatter.invalid")
					: t("jsonFormatter.invalidAt", { line: result.error.line })
			);
		}
	};

	const loadFile = (file: File | undefined): void => {
		if (!file) return;
		file
			.text()
			.then((content) => {
				setInput(content);
				setOutput("");
				setError(null);
			})
			.catch(() => {
				toast.error(t("common.cannotReadFile"));
			});
	};

	const copyOutput = (): void => {
		navigator.clipboard
			.writeText(output)
			.then(() => {
				toast.success(t("common.copied"));
			})
			.catch(() => {
				toast.error(t("common.clipboardFailed"));
			});
	};

	const indentLabels: Record<string, string> = Object.fromEntries(
		Object.entries(INDENT_KEYS).map(([value, key]) => [value, tDynamic(t, key)])
	);
	const nodes = output === "" ? null : countNodes(output);
	return (
		<Content
			categoryName={t("jsonFormatter.category")}
			title={t("jsonFormatter.title")}
		>
			<p className="text-neutral-15 text-sm lg:text-md">
				{t("jsonFormatter.intro")}
			</p>

			<div className="flex flex-wrap gap-6 items-end">
				<LabeledField label={t("jsonFormatter.indent")}>
					<div className="h-12 w-[160px]">
						<Select
							currentValue={indentLabels[indent] ?? ""}
							options={Object.values(indentLabels)}
							width="160px"
							onChange={(value) => {
								setIndent(labelToValue(indentLabels, value, "2"));
							}}
						/>
					</div>
				</LabeledField>

				<label
					className="flex items-center gap-3 text-neutral-10 cursor-pointer h-12"
					htmlFor="json-sort-keys"
				>
					<input
						checked={sort}
						className="w-4 h-4 accent-green-05"
						id="json-sort-keys"
						type="checkbox"
						onChange={(event) => {
							setSort(event.target.checked);
						}}
					/>
					{t("jsonFormatter.sortKeys")}
				</label>

				<div className="flex gap-4 flex-wrap">
					<ActionButton
						label={t("jsonFormatter.format")}
						onClick={() => {
							apply("format");
						}}
					/>
					<ActionButton
						label={t("jsonFormatter.minify")}
						onClick={() => {
							apply("minify");
						}}
					/>
					<ActionButton
						disabled={input === "" && output === ""}
						label={t("common.clear")}
						onClick={() => {
							setInput("");
							setOutput("");
							setError(null);
						}}
					/>
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<div className="flex flex-col gap-2">
					<div className="flex items-center justify-between">
						<div className="text-neutral-15 text-sm">
							{t("jsonFormatter.input")}
						</div>
						<label
							className="text-neutral-15 text-sm underline cursor-pointer hover:text-neutral-05"
							htmlFor="json-file"
						>
							{t("jsonFormatter.openFile")}
							<input
								accept="application/json,.json,.txt"
								className="hidden"
								id="json-file"
								type="file"
								onChange={(event) => {
									loadFile(event.target.files?.[0]);
									event.target.value = "";
								}}
							/>
						</label>
					</div>
					<textarea
						id="json-input"
						placeholder={t("jsonFormatter.inputPlaceholder")}
						spellCheck={false}
						value={input}
						className="w-full h-[420px] bg-main-00 border border-neutral-05 rounded-xl p-4
							text-neutral-05 font-mono text-sm outline-none resize-y"
						onChange={(event) => {
							setInput(event.target.value);
						}}
					/>
				</div>

				<div className="flex flex-col gap-2">
					<div className="flex items-center justify-between">
						<div className="text-neutral-15 text-sm">
							{t("jsonFormatter.output")}
							{nodes !== null &&
								` · ${t("jsonFormatter.summary", {
									count: nodes,
									size: formatBytes(new Blob([output]).size),
								})}`}
						</div>
						<div className="flex gap-4">
							<button
								disabled={output === ""}
								type="button"
								className={`text-sm underline ${
									output === ""
										? "text-neutral-50 cursor-not-allowed"
										: "text-neutral-15 hover:text-neutral-05"
								}`}
								onClick={copyOutput}
							>
								{t("common.copy")}
							</button>
							<button
								disabled={output === ""}
								type="button"
								className={`text-sm underline ${
									output === ""
										? "text-neutral-50 cursor-not-allowed"
										: "text-neutral-15 hover:text-neutral-05"
								}`}
								onClick={() => {
									downloadBlob(
										new Blob([output], { type: "application/json" }),
										"formatted.json"
									);
								}}
							>
								{t("common.download")}
							</button>
						</div>
					</div>
					<textarea
						readOnly
						id="json-output"
						placeholder={t("jsonFormatter.outputPlaceholder")}
						spellCheck={false}
						value={output}
						className="w-full h-[420px] bg-main-00 border border-neutral-05 rounded-xl p-4
							text-neutral-05 font-mono text-sm outline-none resize-y"
					/>
				</div>
			</div>

			{error && (
				<div className="border border-neutral-05 rounded-xl p-4 flex flex-col gap-1">
					<div className="text-neutral-05 font-medium">
						{error.line === null
							? t("jsonFormatter.invalid")
							: t("jsonFormatter.invalidDetail", {
									line: error.line,
									column: error.column,
								})}
					</div>
					<div className="text-neutral-15 text-sm">{error.message}</div>
				</div>
			)}

			<RelatedTools path="/json-formatter" />
			<PageGuideSection path="/json-formatter" />
		</Content>
	);
};
