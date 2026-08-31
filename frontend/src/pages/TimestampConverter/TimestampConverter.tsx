import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { FunctionComponent } from "../../common/types";
import {
	describeTimestamp,
	guessUnit,
	parseDateText,
	parseTimestamp,
	type TimestampUnit,
} from "../../common/timestamp";
import { tDynamic } from "../../common/translate";
import { Content } from "../../components/ui/Content";
import { PageGuideSection } from "../../components/ui/PageGuideSection";
import { RelatedTools } from "../../components/ui/RelatedTools";
import { CopyField } from "../../components/ui/CopyField";
import { ActionButton } from "../../components/ui/ActionButton";
import { LabeledField } from "../../components/ui/LabeledField";

export const TimestampConverter = (): FunctionComponent => {
	const { t } = useTranslation();
	const [raw, setRaw] = useState<string>("");
	const [unit, setUnit] = useState<TimestampUnit>("seconds");
	const [dateText, setDateText] = useState<string>("");
	// 1초마다 다시 그려 지금 시각을 살아 있게 둔다.
	const [now, setNow] = useState<number>(() => Date.now());

	useEffect(() => {
		const timer = setInterval(() => {
			setNow(Date.now());
		}, 1000);
		return (): void => {
			clearInterval(timer);
		};
	}, []);

	// 붙여 넣은 값의 자릿수로 초인지 밀리초인지 알아서 맞춘다.
	const setTimestamp = (value: string): void => {
		setRaw(value);
		if (value.trim() !== "") setUnit(guessUnit(value));
	};

	const fromTimestamp = parseTimestamp(raw, unit);
	const fromText = parseDateText(dateText);
	const nowView = describeTimestamp(new Date(now), now);

	const views = [
		fromTimestamp && { key: "fromTimestamp", date: fromTimestamp },
		fromText && { key: "fromDate", date: fromText },
	].filter((entry): entry is { key: string; date: Date } => Boolean(entry));

	return (
		<Content
			categoryName={t("timestampConverter.category")}
			title={t("timestampConverter.title")}
		>
			<p className="text-neutral-15 text-sm lg:text-md">
				{t("timestampConverter.intro")}
			</p>

			<div className="border border-neutral-05 rounded-xl p-6 bg-main-00 flex flex-col gap-2">
				<div className="text-neutral-15 text-sm">
					{t("timestampConverter.now")}
				</div>
				<div className="text-neutral-05 text-3xl lg:text-4xl font-medium font-mono">
					{nowView.seconds}
				</div>
				<div className="text-neutral-15 text-sm">{nowView.local}</div>
				<div className="flex flex-wrap gap-3 mt-2">
					<ActionButton
						label={t("timestampConverter.useNow")}
						onClick={() => {
							setTimestamp(String(nowView.seconds));
						}}
					/>
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<LabeledField grow label={t("timestampConverter.fromTimestamp")}>
					<div className="flex items-center h-12 border border-neutral-05 rounded-xl px-4">
						<input
							className="w-full bg-transparent text-neutral-05 outline-none font-mono"
							id="timestamp-input"
							inputMode="numeric"
							placeholder="1767225600"
							type="text"
							value={raw}
							onChange={(event) => {
								setTimestamp(event.target.value);
							}}
						/>
						{raw.trim() !== "" && (
							<span className="text-neutral-15 text-sm shrink-0 ml-2">
								{tDynamic(t, `timestampConverter.unit.${unit}`)}
							</span>
						)}
					</div>
				</LabeledField>

				<LabeledField grow label={t("timestampConverter.fromDate")}>
					<div className="flex items-center h-12 border border-neutral-05 rounded-xl px-4">
						<input
							className="w-full bg-transparent text-neutral-05 outline-none font-mono"
							id="date-input"
							placeholder="2026-01-01T00:00:00Z"
							type="text"
							value={dateText}
							onChange={(event) => {
								setDateText(event.target.value);
							}}
						/>
					</div>
				</LabeledField>
			</div>

			{views.map((view) => {
				const described = describeTimestamp(view.date, now);
				return (
					<div key={view.key} className="flex flex-col gap-3">
						<div className="text-neutral-05 font-medium text-xl">
							{tDynamic(t, `timestampConverter.${view.key}`)}
						</div>
						<CopyField
							label={t("timestampConverter.seconds")}
							value={String(described.seconds)}
						/>
						<CopyField
							label={t("timestampConverter.milliseconds")}
							value={String(described.milliseconds)}
						/>
						<CopyField label="ISO 8601" value={described.iso} />
						<CopyField label="UTC" value={described.utc} />
						<CopyField
							label={t("timestampConverter.local")}
							value={described.local}
						/>
						<div className="text-neutral-15 text-sm">
							{t(
								described.relative.amount < 0
									? "timestampConverter.past"
									: "timestampConverter.future",
								{
									amount: Math.abs(described.relative.amount),
									unit: tDynamic(
										t,
										`timestampConverter.relative.${described.relative.unit}`
									),
								}
							)}
						</div>
					</div>
				);
			})}

			<RelatedTools path="/timestamp-converter" />
			<PageGuideSection path="/timestamp-converter" />
		</Content>
	);
};
