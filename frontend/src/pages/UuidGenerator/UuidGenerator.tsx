import { useState } from "react";
import { toast } from "react-toastify";
import type { FunctionComponent } from "../../common/types";
import {
	generateUuids,
	inspectUuid,
	type UuidFormat,
	type UuidVersion,
} from "../../common/uuid";
import { findPageSeo } from "../../common/seo";
import { downloadBlob } from "../../common/download";
import { Content } from "../../components/ui/Content";
import { PageGuideSection } from "../../components/ui/PageGuideSection";
import { Select } from "../../components/ui/Select";
import { LabeledField } from "../../components/ui/LabeledField";
import { ActionButton } from "../../components/ui/ActionButton";
import { ToolTextArea } from "../../components/ui/ToolTextArea";
import { copyToClipboard } from "../../common/clipboard";

const VERSION_LABELS: Record<UuidVersion, string> = {
	v4: "v4 (random)",
	v7: "v7 (time-ordered)",
};

const FORMAT_LABELS: Record<UuidFormat, string> = {
	plain: "lowercase",
	upper: "UPPERCASE",
	braces: "{braces}",
	compact: "no hyphens",
};

const labelToValue = <T extends string>(
	labels: Record<T, string>,
	label: string,
	fallback: T
): T => {
	const entry = Object.entries(labels).find(([, text]) => text === label);
	return entry ? (entry[0] as T) : fallback;
};

const MAX_COUNT = 10_000;

export const UuidGenerator = (): FunctionComponent => {
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
			toast.error("Enter how many you want, as a whole number");
			return;
		}
		if (requested > MAX_COUNT) {
			toast.error(`At most ${MAX_COUNT.toLocaleString()} at a time`);
			return;
		}
		setValues(generateUuids(requested, version, style));
	};

	const guide = findPageSeo("/uuid-generator").guide;
	const inspected = check.trim() === "" ? null : inspectUuid(check);
	const joined = values.join("\n");

	return (
		<Content categoryName="Generator" title="UUID GENERATOR">
			<p className="text-neutral-15 text-sm lg:text-md">
				Generate random v4 or time-ordered v7 identifiers, one or thousands at a
				time. They come from your browser's cryptographic generator and are
				never sent anywhere.
			</p>

			<div className="flex flex-wrap gap-6 items-end">
				<LabeledField label="Version">
					<div className="h-12 w-[210px]">
						<Select
							currentValue={VERSION_LABELS[version]}
							options={Object.values(VERSION_LABELS)}
							width="210px"
							onChange={(value) => {
								setVersion(labelToValue(VERSION_LABELS, value, "v4"));
							}}
						/>
					</div>
				</LabeledField>

				<LabeledField label="Format">
					<div className="h-12 w-[180px]">
						<Select
							currentValue={FORMAT_LABELS[style]}
							options={Object.values(FORMAT_LABELS)}
							width="180px"
							onChange={(value) => {
								setStyle(labelToValue(FORMAT_LABELS, value, "plain"));
							}}
						/>
					</div>
				</LabeledField>

				<LabeledField label="How many">
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
					<ActionButton label="Generate" onClick={generate} />
					<ActionButton
						label="Copy all"
						onClick={() => {
							copyToClipboard(joined);
						}}
					/>
					<ActionButton
						label="Download"
						onClick={() => {
							downloadBlob(
								new Blob([joined], { type: "text/plain" }),
								"uuids.txt"
							);
							toast.success("uuids.txt downloaded");
						}}
					/>
				</div>
			</div>

			<div className="flex flex-col gap-2">
				<div className="text-neutral-15 text-sm">
					{values.length.toLocaleString()} identifiers
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
				<div className="text-neutral-05 font-medium text-xl">Check a UUID</div>
				<div className="flex items-center h-12 border border-neutral-05 rounded-xl px-4">
					<input
						className="w-full bg-transparent text-neutral-05 outline-none font-mono text-sm"
						id="uuid-check"
						placeholder="Paste an identifier to see whether it is valid"
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
							Valid UUID, version {inspected.version}
						</div>
					) : (
						<div className="text-neutral-05">
							Not a valid UUID — it needs 32 hexadecimal digits with a version
							between 1 and 8.
						</div>
					))}
			</div>

			{guide && <PageGuideSection guide={guide} />}
		</Content>
	);
};
