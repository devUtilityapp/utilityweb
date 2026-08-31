import { useState } from "react";
import type { TFunction } from "i18next";
import { useTranslation } from "react-i18next";
import { tDynamic } from "../../common/translate";
import { toast } from "react-toastify";
import type { FunctionComponent } from "../../common/types";
import {
	generateUuids,
	inspectUuid,
	type UuidFormat,
	type UuidVersion,
} from "../../common/uuid";
import { downloadBlob } from "../../common/download";
import { Content } from "../../components/ui/Content";
import { PageGuideSection } from "../../components/ui/PageGuideSection";
import { Select } from "../../components/ui/Select";
import { LabeledField } from "../../components/ui/LabeledField";
import { ActionButton } from "../../components/ui/ActionButton";
import { ToolTextArea } from "../../components/ui/ToolTextArea";
import { copyToClipboard } from "../../common/clipboard";

const VERSION_KEYS: Record<UuidVersion, string> = {
	v4: "uuidGenerator.v4",
	v7: "uuidGenerator.v7",
};

const FORMAT_KEYS: Record<UuidFormat, string> = {
	plain: "uuidGenerator.formatPlain",
	upper: "uuidGenerator.formatUpper",
	braces: "uuidGenerator.formatBraces",
	compact: "uuidGenerator.formatCompact",
};

/** 번역된 선택지 문구를 값과 짝지어 만든다. */
const labelsOf = (
	keys: Record<string, string>,
	t: TFunction
): Record<string, string> =>
	Object.fromEntries(
		Object.entries(keys).map(([value, key]) => [value, tDynamic(t, key)])
	);

const labelToValue = <T extends string>(
	labels: Record<string, string>,
	label: string,
	fallback: T
): T => {
	const entry = Object.entries(labels).find(([, text]) => text === label);
	return entry ? (entry[0] as T) : fallback;
};

const MAX_COUNT = 10_000;

export const UuidGenerator = (): FunctionComponent => {
	const { t } = useTranslation();
	const [version, setVersion] = useState<UuidVersion>("v4");
	const [style, setStyle] = useState<UuidFormat>("plain");
	const [count, setCount] = useState<string>("5");
	const [values, setValues] = useState<Array<string>>(() =>
		generateUuids(5, "v4", "plain")
	);
	const [check, setCheck] = useState<string>("");

	const generate = (): void => {
		const requested = Number(count);
		if (!Number.isInteger(requested) || requested < 1) {
			toast.error(t("uuidGenerator.badCount"));
			return;
		}
		if (requested > MAX_COUNT) {
			toast.error(
				t("uuidGenerator.tooMany", { max: MAX_COUNT.toLocaleString() })
			);
			return;
		}
		setValues(generateUuids(requested, version, style));
	};

	const versionLabels = labelsOf(VERSION_KEYS, t);
	const formatLabels = labelsOf(FORMAT_KEYS, t);
	const inspected = check.trim() === "" ? null : inspectUuid(check);
	const joined = values.join("\n");

	return (
		<Content
			categoryName={t("uuidGenerator.category")}
			title={t("uuidGenerator.title")}
		>
			<p className="text-neutral-15 text-sm lg:text-md">
				{t("uuidGenerator.intro")}
			</p>

			<div className="flex flex-wrap gap-6 items-end">
				<LabeledField label={t("uuidGenerator.version")}>
					<div className="h-12 w-[210px]">
						<Select
							currentValue={versionLabels[version] ?? ""}
							options={Object.values(versionLabels)}
							width="210px"
							onChange={(value) => {
								setVersion(labelToValue(versionLabels, value, "v4"));
							}}
						/>
					</div>
				</LabeledField>

				<LabeledField label={t("common.format")}>
					<div className="h-12 w-[180px]">
						<Select
							currentValue={formatLabels[style] ?? ""}
							options={Object.values(formatLabels)}
							width="180px"
							onChange={(value) => {
								setStyle(labelToValue(formatLabels, value, "plain"));
							}}
						/>
					</div>
				</LabeledField>

				<LabeledField label={t("uuidGenerator.howMany")}>
					<div className="flex items-center h-12 w-[140px] border border-neutral-05 rounded-xl px-3">
						<input
							className="w-full bg-transparent text-neutral-05 outline-none font-medium"
							id="uuid-count"
							inputMode="numeric"
							max={MAX_COUNT}
							min="1"
							type="number"
							value={count}
							onChange={(event) => {
								setCount(event.target.value);
							}}
						/>
					</div>
				</LabeledField>

				<div className="flex gap-4 flex-wrap">
					<ActionButton
						label={t("uuidGenerator.generate")}
						onClick={generate}
					/>
					<ActionButton
						label={t("common.copyAll")}
						onClick={() => {
							copyToClipboard(joined);
						}}
					/>
					<ActionButton
						label={t("common.download")}
						onClick={() => {
							downloadBlob(
								new Blob([joined], { type: "text/plain" }),
								"uuids.txt"
							);
							toast.success(t("common.downloaded", { name: "uuids.txt" }));
						}}
					/>
				</div>
			</div>

			<div className="flex flex-col gap-2">
				<div className="text-neutral-15 text-sm">
					{t("uuidGenerator.count", { count: values.length })}
				</div>
				<ToolTextArea
					mono
					readOnly
					height={values.length > 20 ? "h-[420px]" : "h-[220px]"}
					id="uuid-output"
					placeholder=""
					value={joined}
				/>
			</div>

			<div className="flex flex-col gap-3">
				<div className="text-neutral-05 font-medium text-xl">
					{t("uuidGenerator.check")}
				</div>
				<div className="flex items-center h-12 border border-neutral-05 rounded-xl px-4">
					<input
						className="w-full bg-transparent text-neutral-05 outline-none font-mono text-sm"
						id="uuid-check"
						placeholder={t("uuidGenerator.checkPlaceholder")}
						type="text"
						value={check}
						onChange={(event) => {
							setCheck(event.target.value);
						}}
					/>
				</div>
				{inspected &&
					(inspected.valid ? (
						<div className="text-green-05 font-medium">
							{t("uuidGenerator.valid", { version: inspected.version })}
						</div>
					) : (
						<div className="text-neutral-05">{t("uuidGenerator.invalid")}</div>
					))}
			</div>

			<PageGuideSection path="/uuid-generator" />
		</Content>
	);
};
