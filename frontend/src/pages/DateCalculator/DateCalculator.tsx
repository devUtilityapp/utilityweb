import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { FunctionComponent } from "../../common/types";
import {
	differenceBetween,
	parseDate,
	shiftDate,
	toDateInput,
	weekdayOf,
	type ShiftUnit,
} from "../../common/dateCalc";
import { tDynamic } from "../../common/translate";
import { Content } from "../../components/ui/Content";
import { PageGuideSection } from "../../components/ui/PageGuideSection";
import { RelatedTools } from "../../components/ui/RelatedTools";
import { Select } from "../../components/ui/Select";
import { LabeledField } from "../../components/ui/LabeledField";

type Mode = "between" | "shift";

const SHIFT_UNITS: Array<ShiftUnit> = ["days", "weeks", "months", "years"];

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
		className={`h-11 px-5 rounded-xl border font-medium ${
			active
				? "border-green-05 text-neutral-05 bg-main-05"
				: "border-neutral-05 text-neutral-15 hover:text-neutral-05"
		}`}
		onClick={onClick}
	>
		{label}
	</button>
);

const DateField = ({
	id,
	label,
	value,
	onChange,
}: {
	id: string;
	label: string;
	value: string;
	onChange: (value: string) => void;
}): FunctionComponent => (
	<LabeledField grow label={label}>
		<div className="flex items-center h-12 border border-neutral-05 rounded-xl px-4">
			<input
				className="w-full bg-transparent text-neutral-05 outline-none font-medium"
				id={id}
				type="date"
				value={value}
				onChange={(event) => {
					onChange(event.target.value);
				}}
			/>
		</div>
	</LabeledField>
);

const Stat = ({
	label,
	value,
}: {
	label: string;
	value: string;
}): FunctionComponent => (
	<div className="flex flex-col gap-1 border border-neutral-05 rounded-xl px-4 py-3 bg-main-00">
		<div className="text-neutral-05 text-2xl font-medium">{value}</div>
		<div className="text-neutral-15 text-sm">{label}</div>
	</div>
);

export const DateCalculator = (): FunctionComponent => {
	const { t } = useTranslation();
	const [mode, setMode] = useState<Mode>("between");
	// 오늘 날짜는 사람이 고르는 값이라 렌더마다 새로 읽지 않고 처음 한 번만 잡는다.
	const [from, setFrom] = useState<string>(() => toDateInput(new Date()));
	const [to, setTo] = useState<string>(() =>
		toDateInput(shiftDate(new Date(), 30, "days"))
	);
	const [base, setBase] = useState<string>(() => toDateInput(new Date()));
	const [amount, setAmount] = useState<string>("30");
	const [unit, setUnit] = useState<ShiftUnit>("days");

	const unitLabel = (value: ShiftUnit): string =>
		tDynamic(t, `dateCalculator.unit.${value}`);

	const fromDate = parseDate(from);
	const toDate = parseDate(to);
	const difference =
		fromDate && toDate ? differenceBetween(fromDate, toDate) : null;

	const baseDate = parseDate(base);
	const shifted =
		baseDate && Number.isFinite(Number(amount))
			? shiftDate(baseDate, Number(amount), unit)
			: null;

	const weekdayName = (value: Date): string =>
		tDynamic(t, `dateCalculator.weekday.${weekdayOf(value)}`);

	return (
		<Content
			categoryName={t("dateCalculator.category")}
			title={t("dateCalculator.title")}
		>
			<p className="text-neutral-15 text-sm lg:text-md">
				{t("dateCalculator.intro")}
			</p>

			<div className="flex gap-2 flex-wrap">
				<TabButton
					active={mode === "between"}
					label={t("dateCalculator.modeBetween")}
					onClick={() => {
						setMode("between");
					}}
				/>
				<TabButton
					active={mode === "shift"}
					label={t("dateCalculator.modeShift")}
					onClick={() => {
						setMode("shift");
					}}
				/>
			</div>

			{mode === "between" ? (
				<>
					<div className="flex flex-wrap gap-6 items-end">
						<DateField
							id="date-from"
							label={t("dateCalculator.from")}
							value={from}
							onChange={setFrom}
						/>
						<DateField
							id="date-to"
							label={t("dateCalculator.to")}
							value={to}
							onChange={setTo}
						/>
					</div>

					{difference && (
						<>
							<div className="border border-neutral-05 rounded-xl p-6 bg-main-00">
								<div className="text-neutral-05 text-3xl lg:text-4xl font-medium">
									{t("dateCalculator.totalDays", { count: difference.days })}
								</div>
								<div className="text-neutral-15 mt-2">
									{t("dateCalculator.breakdown", {
										years: difference.years,
										months: difference.months,
										days: difference.restDays,
									})}
								</div>
							</div>

							<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
								<Stat
									label={t("dateCalculator.weeks")}
									value={difference.weeks.toLocaleString()}
								/>
								<Stat
									label={t("dateCalculator.businessDays")}
									value={difference.businessDays.toLocaleString()}
								/>
								<Stat
									label={t("dateCalculator.hours")}
									value={difference.hours.toLocaleString()}
								/>
								<Stat
									label={t("dateCalculator.minutes")}
									value={difference.minutes.toLocaleString()}
								/>
							</div>
						</>
					)}
				</>
			) : (
				<>
					<div className="flex flex-wrap gap-6 items-end">
						<DateField
							id="date-base"
							label={t("dateCalculator.startDate")}
							value={base}
							onChange={setBase}
						/>
						<LabeledField label={t("dateCalculator.amount")}>
							<div className="flex items-center h-12 w-[140px] border border-neutral-05 rounded-xl px-3">
								<input
									className="w-full bg-transparent text-neutral-05 outline-none font-medium"
									id="date-amount"
									inputMode="numeric"
									type="number"
									value={amount}
									onChange={(event) => {
										setAmount(event.target.value);
									}}
								/>
							</div>
						</LabeledField>
						<LabeledField label={t("dateCalculator.unitLabel")}>
							<div className="h-12 w-[160px]">
								<Select
									currentValue={unitLabel(unit)}
									options={SHIFT_UNITS.map((value) => unitLabel(value))}
									width="160px"
									onChange={(label) => {
										const found = SHIFT_UNITS.find(
											(value) => unitLabel(value) === label
										);
										if (found) setUnit(found);
									}}
								/>
							</div>
						</LabeledField>
					</div>

					{shifted && (
						<div className="border border-neutral-05 rounded-xl p-6 bg-main-00">
							<div className="text-neutral-15 text-sm mb-2">
								{t("dateCalculator.resultLabel")}
							</div>
							<div className="text-neutral-05 text-3xl lg:text-4xl font-medium">
								{toDateInput(shifted)}
							</div>
							<div className="text-neutral-15 mt-2">{weekdayName(shifted)}</div>
						</div>
					)}
				</>
			)}

			<RelatedTools path="/date-calculator" />
			<PageGuideSection path="/date-calculator" />
		</Content>
	);
};
