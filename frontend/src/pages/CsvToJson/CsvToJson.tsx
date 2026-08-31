import { useState } from "react";
import { useTranslation } from "react-i18next";
import { tDynamic } from "../../common/translate";
import { toast } from "react-toastify";
import type { FunctionComponent } from "../../common/types";
import {
	DELIMITERS,
	csvToJson,
	jsonToCsv,
	type Delimiter,
} from "../../common/csvJson";
import { downloadBlob } from "../../common/download";
import { Content } from "../../components/ui/Content";
import { PageGuideSection } from "../../components/ui/PageGuideSection";
import { Select } from "../../components/ui/Select";
import { LabeledField } from "../../components/ui/LabeledField";
import { ActionButton } from "../../components/ui/ActionButton";
import { ToolTextArea } from "../../components/ui/ToolTextArea";
import { copyToClipboard } from "../../common/clipboard";

type Direction = "csvToJson" | "jsonToCsv";

const TabButton = ({
	label,
	active,
	onClick,
}: {
	label: string;
	active: boolean;
	onClick: () => void;
}): FunctionComponent => (
	<button
		type="button"
		className={`h-11 px-5 rounded-xl border font-medium
			${active ? "border-green-05 text-neutral-05 bg-main-05" : "border-neutral-05 text-neutral-15 hover:text-neutral-05"}`}
		onClick={onClick}
	>
		{label}
	</button>
);

export const CsvToJson = (): FunctionComponent => {
	const { t } = useTranslation();
	const [direction, setDirection] = useState<Direction>("csvToJson");
	const [delimiterName, setDelimiterName] = useState<string>("Comma");
	const [header, setHeader] = useState(true);
	const [typed, setTyped] = useState(true);
	const [input, setInput] = useState<string>("");
	const [output, setOutput] = useState<string>("");
	const [error, setError] = useState<string>("");

	const delimiter: Delimiter = DELIMITERS[delimiterName] ?? ",";

	const convert = (): void => {
		if (input.trim() === "") {
			toast.error(t("csvToJson.pasteFirst"));
			return;
		}

		try {
			setOutput(
				direction === "csvToJson"
					? JSON.stringify(
							csvToJson(input, { delimiter, header, typed }),
							null,
							2
						)
					: jsonToCsv(input, delimiter)
			);
			setError("");
		} catch (caught) {
			setOutput("");
			const message =
				caught instanceof Error ? caught.message : t("csvToJson.failed");
			setError(message);
			toast.error(message);
		}
	};

	const toJson = direction === "csvToJson";

	return (
		<Content
			categoryName={t("csvToJson.category")}
			title={t("csvToJson.title")}
		>
			<p className="text-neutral-15 text-sm lg:text-md">
				{t("csvToJson.intro")}
			</p>

			<div className="flex flex-wrap gap-6 items-center">
				<div className="flex gap-2">
					<TabButton
						active={toJson}
						label={t("csvToJson.csvToJson")}
						onClick={() => {
							setDirection("csvToJson");
							setOutput("");
							setError("");
						}}
					/>
					<TabButton
						active={!toJson}
						label={t("csvToJson.jsonToCsv")}
						onClick={() => {
							setDirection("jsonToCsv");
							setOutput("");
							setError("");
						}}
					/>
				</div>

				<LabeledField label={t("csvToJson.delimiter")}>
					<div className="h-12 w-[160px]">
						<Select
							width="160px"
							currentValue={tDynamic(
								t,
								`csvToJson.${delimiterName.toLowerCase()}`
							)}
							options={Object.keys(DELIMITERS).map((name) =>
								tDynamic(t, `csvToJson.${name.toLowerCase()}`)
							)}
							onChange={(value) => {
								const found = Object.keys(DELIMITERS).find(
									(name) =>
										tDynamic(t, `csvToJson.${name.toLowerCase()}`) === value
								);
								setDelimiterName(found ?? "Comma");
							}}
						/>
					</div>
				</LabeledField>

				{toJson && (
					<>
						<label
							className="flex items-center gap-3 text-neutral-10 cursor-pointer"
							htmlFor="csv-header"
						>
							<input
								checked={header}
								className="w-4 h-4 accent-green-05"
								id="csv-header"
								type="checkbox"
								onChange={(event) => {
									setHeader(event.target.checked);
								}}
							/>
							{t("csvToJson.header")}
						</label>
						<label
							className="flex items-center gap-3 text-neutral-10 cursor-pointer"
							htmlFor="csv-typed"
						>
							<input
								checked={typed}
								className="w-4 h-4 accent-green-05"
								id="csv-typed"
								type="checkbox"
								onChange={(event) => {
									setTyped(event.target.checked);
								}}
							/>
							{t("csvToJson.typed")}
						</label>
					</>
				)}

				<div className="flex gap-4 flex-wrap">
					<ActionButton label={t("common.convert")} onClick={convert} />
					<ActionButton
						disabled={input === "" && output === ""}
						label={t("common.clear")}
						onClick={() => {
							setInput("");
							setOutput("");
							setError("");
						}}
					/>
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<div className="flex flex-col gap-2">
					<div className="text-neutral-15 text-sm">
						{t("csvToJson.dropHint", { format: toJson ? "CSV" : "JSON" })}
					</div>
					<ToolTextArea
						mono
						height="h-[420px]"
						id="csv-input"
						value={input}
						placeholder={
							toJson
								? "name,age\nAda,36\nGrace,45"
								: '[{"name":"Ada","age":36}]'
						}
						onChange={setInput}
					/>
				</div>

				<div className="flex flex-col gap-2">
					<div className="flex items-center justify-between">
						<div className="text-neutral-15 text-sm">
							{toJson ? "JSON" : "CSV"}
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
								onClick={() => {
									copyToClipboard(output);
								}}
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
										new Blob([output], {
											type: toJson ? "application/json" : "text/csv",
										}),
										toJson ? "converted.json" : "converted.csv"
									);
								}}
							>
								{t("common.download")}
							</button>
						</div>
					</div>
					<ToolTextArea
						mono
						readOnly
						height="h-[420px]"
						id="csv-output"
						placeholder={t("csvToJson.outputPlaceholder")}
						value={output}
					/>
				</div>
			</div>

			{error !== "" && (
				<div className="border border-neutral-05 rounded-xl p-4 text-neutral-05">
					{error}
				</div>
			)}

			<PageGuideSection path="/csv-to-json" />
		</Content>
	);
};
