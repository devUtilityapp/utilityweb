import { useState } from "react";
import { toast } from "react-toastify";
import type { FunctionComponent } from "../../common/types";
import {
	countNodes,
	formatJson,
	minifyJson,
	type IndentStyle,
	type JsonError,
} from "../../common/jsonFormat";
import { findPageSeo } from "../../common/seo";
import { downloadBlob, formatBytes } from "../../common/download";
import { Content } from "../../components/ui/Content";
import { PageGuideSection } from "../../components/ui/PageGuideSection";
import { Select } from "../../components/ui/Select";
import { LabeledField } from "../../components/ui/LabeledField";
import { ActionButton } from "../../components/ui/ActionButton";

const INDENT_LABELS: Record<IndentStyle, string> = {
	"2": "2 spaces",
	"4": "4 spaces",
	tab: "Tab",
};

const labelToValue = <T extends string>(
	labels: Record<T, string>,
	label: string,
	fallback: T
): T => {
	const entry = Object.entries(labels).find(([, text]) => text === label);
	return entry ? (entry[0] as T) : fallback;
};

export const JsonFormatter = (): FunctionComponent => {
	const [input, setInput] = useState<string>("");
	const [output, setOutput] = useState<string>("");
	const [error, setError] = useState<JsonError | null>(null);
	const [indent, setIndent] = useState<IndentStyle>("2");
	const [sort, setSort] = useState<boolean>(false);

	const apply = (transform: "format" | "minify"): void => {
		if (input.trim() === "") {
			toast.error("Please paste some JSON first");
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
					? "Invalid JSON"
					: `Invalid JSON at line ${result.error.line}`
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
				toast.error("Cannot read the file");
			});
	};

	const copyOutput = (): void => {
		navigator.clipboard
			.writeText(output)
			.then(() => {
				toast.success("Copied to the clipboard");
			})
			.catch(() => {
				toast.error("Cannot access the clipboard");
			});
	};

	const nodes = output === "" ? null : countNodes(output);
	const guide = findPageSeo("/json-formatter").guide;

	return (
		<Content categoryName="Text" title="JSON FORMATTER">
			<p className="text-neutral-15 text-sm lg:text-md">
				Lay out JSON so you can read it, minify it back down, and see exactly
				where an invalid document breaks. Parsed in your browser, never sent
				anywhere.
			</p>

			<div className="flex flex-wrap gap-6 items-end">
				<LabeledField label="Indent">
					<div className="h-12 w-[160px]">
						<Select
							currentValue={INDENT_LABELS[indent]}
							options={Object.values(INDENT_LABELS)}
							width="160px"
							onChange={(value) => {
								setIndent(labelToValue(INDENT_LABELS, value, "2"));
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
					Sort keys
				</label>

				<div className="flex gap-4 flex-wrap">
					<ActionButton
						label="Format"
						onClick={() => {
							apply("format");
						}}
					/>
					<ActionButton
						label="Minify"
						onClick={() => {
							apply("minify");
						}}
					/>
					<ActionButton
						disabled={input === "" && output === ""}
						label="Clear"
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
						<div className="text-neutral-15 text-sm">Input</div>
						<label
							className="text-neutral-15 text-sm underline cursor-pointer hover:text-neutral-05"
							htmlFor="json-file"
						>
							Open a .json file
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
						placeholder='{"name":"utility","tools":["pdf","image"]}'
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
							Output
							{nodes !== null &&
								` · ${nodes} values · ${formatBytes(new Blob([output]).size)}`}
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
								Copy
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
								Download
							</button>
						</div>
					</div>
					<textarea
						readOnly
						id="json-output"
						placeholder="The formatted document appears here"
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
							? "Invalid JSON"
							: `Invalid JSON at line ${error.line}, column ${error.column}`}
					</div>
					<div className="text-neutral-15 text-sm">{error.message}</div>
				</div>
			)}

			{guide && <PageGuideSection guide={guide} />}
		</Content>
	);
};
