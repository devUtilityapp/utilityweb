import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { FunctionComponent } from "../../common/types";
import {
	UNITS,
	UNIT_CATEGORIES,
	convertToAll,
	convertUnit,
	formatResult,
	type UnitCategory,
} from "../../common/unitConvert";
import { tDynamic } from "../../common/translate";
import { Content } from "../../components/ui/Content";
import { PageGuideSection } from "../../components/ui/PageGuideSection";
import { RelatedTools } from "../../components/ui/RelatedTools";
import { Select } from "../../components/ui/Select";
import { LabeledField } from "../../components/ui/LabeledField";

export const UnitConverter = (): FunctionComponent => {
	const { t } = useTranslation();
	const [category, setCategory] = useState<UnitCategory>("length");
	const [fromKey, setFromKey] = useState<string>("meter");
	const [toKey, setToKey] = useState<string>("foot");
	const [input, setInput] = useState<string>("1");

	const units = UNITS[category];
	const labelOf = (key: string): string => {
		const unit = units.find((entry) => entry.key === key);
		return unit
			? `${tDynamic(t, `unitConverter.units.${key}`)} (${unit.symbol})`
			: "";
	};

	// 분류를 바꾸면 앞 분류의 단위가 남지 않도록 처음 두 개로 되돌린다.
	const changeCategory = (next: UnitCategory): void => {
		setCategory(next);
		setFromKey(UNITS[next][0]?.key ?? "");
		setToKey(UNITS[next][1]?.key ?? UNITS[next][0]?.key ?? "");
	};

	const value = Number(input.replace(/,/g, ""));
	const result = convertUnit(value, category, fromKey, toKey);
	const all = Number.isFinite(value)
		? convertToAll(value, category, fromKey)
		: [];

	return (
		<Content
			categoryName={t("unitConverter.category")}
			title={t("unitConverter.title")}
		>
			<p className="text-neutral-15 text-sm lg:text-md">
				{t("unitConverter.intro")}
			</p>

			<div className="flex flex-wrap gap-3">
				{UNIT_CATEGORIES.map((option) => (
					<button
						key={option}
						type="button"
						className={`h-10 px-4 rounded-xl border text-sm font-medium transition-colors ${
							option === category
								? "border-green-05 text-neutral-05 bg-main-05"
								: "border-neutral-50 text-neutral-15 hover:text-neutral-05"
						}`}
						onClick={() => {
							changeCategory(option);
						}}
					>
						{tDynamic(t, `unitConverter.categories.${option}`)}
					</button>
				))}
			</div>

			<div className="flex flex-wrap gap-6 items-end">
				<LabeledField grow label={t("unitConverter.value")}>
					<div className="flex items-center h-12 border border-neutral-05 rounded-xl px-4">
						<input
							className="w-full bg-transparent text-neutral-05 outline-none font-medium"
							id="unit-value"
							inputMode="decimal"
							type="text"
							value={input}
							onChange={(event) => {
								setInput(event.target.value);
							}}
						/>
					</div>
				</LabeledField>

				<LabeledField label={t("unitConverter.from")}>
					<div className="h-12 w-[220px]">
						<Select
							currentValue={labelOf(fromKey)}
							options={units.map((unit) => labelOf(unit.key))}
							width="220px"
							onChange={(label) => {
								const found = units.find((unit) => labelOf(unit.key) === label);
								if (found) setFromKey(found.key);
							}}
						/>
					</div>
				</LabeledField>

				<button
					aria-label={t("unitConverter.swap")}
					title={t("unitConverter.swap")}
					type="button"
					className="h-12 w-12 shrink-0 rounded-xl border border-neutral-05 text-neutral-05
						hover:bg-main-05 transition-colors"
					onClick={() => {
						setFromKey(toKey);
						setToKey(fromKey);
					}}
				>
					⇄
				</button>

				<LabeledField label={t("unitConverter.to")}>
					<div className="h-12 w-[220px]">
						<Select
							currentValue={labelOf(toKey)}
							options={units.map((unit) => labelOf(unit.key))}
							width="220px"
							onChange={(label) => {
								const found = units.find((unit) => labelOf(unit.key) === label);
								if (found) setToKey(found.key);
							}}
						/>
					</div>
				</LabeledField>
			</div>

			{result !== null && (
				<div className="border border-neutral-05 rounded-xl p-6 bg-main-00">
					<div className="text-neutral-15 text-sm mb-2">
						{formatResult(value)}{" "}
						{units.find((unit) => unit.key === fromKey)?.symbol}
					</div>
					<div className="text-neutral-05 text-3xl lg:text-4xl font-medium break-all">
						{formatResult(result)}{" "}
						<span className="text-neutral-10 text-2xl">
							{units.find((unit) => unit.key === toKey)?.symbol}
						</span>
					</div>
				</div>
			)}

			{all.length > 0 && (
				<div className="flex flex-col gap-4">
					<div className="text-neutral-05 font-medium text-xl lg:text-2xl">
						{t("unitConverter.allUnits")}
					</div>
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
						{all.map((entry) => (
							<div
								key={entry.unit.key}
								className="flex items-baseline justify-between gap-3 border border-neutral-50
									rounded-xl px-4 py-3"
							>
								<span className="text-neutral-15 text-sm shrink-0">
									{tDynamic(t, `unitConverter.units.${entry.unit.key}`)}
								</span>
								<span className="text-neutral-05 font-mono text-sm truncate">
									{formatResult(entry.value)} {entry.unit.symbol}
								</span>
							</div>
						))}
					</div>
				</div>
			)}

			<RelatedTools path="/unit-converter" />
			<PageGuideSection path="/unit-converter" />
		</Content>
	);
};
