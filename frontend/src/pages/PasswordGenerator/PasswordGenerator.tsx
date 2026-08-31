import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import type { FunctionComponent } from "../../common/types";
import {
	estimateStrength,
	generatePassword,
	type PasswordOptions,
} from "../../common/password";
import { copyToClipboard } from "../../common/clipboard";
import { tDynamic } from "../../common/translate";
import { Content } from "../../components/ui/Content";
import { PageGuideSection } from "../../components/ui/PageGuideSection";
import { RelatedTools } from "../../components/ui/RelatedTools";
import { ActionButton } from "../../components/ui/ActionButton";

const STRENGTH_COLORS = {
	weak: "bg-red-500",
	fair: "bg-yellow-500",
	strong: "bg-green-05",
	excellent: "bg-green-05",
} as const;

const Toggle = ({
	id,
	label,
	checked,
	onChange,
}: {
	id: string;
	label: string;
	checked: boolean;
	onChange: (value: boolean) => void;
}): FunctionComponent => (
	<label
		className="flex items-center gap-3 text-neutral-10 cursor-pointer"
		htmlFor={id}
	>
		<input
			checked={checked}
			className="w-4 h-4 accent-green-05"
			id={id}
			type="checkbox"
			onChange={(event) => {
				onChange(event.target.checked);
			}}
		/>
		{label}
	</label>
);

export const PasswordGenerator = (): FunctionComponent => {
	const { t } = useTranslation();
	const [options, setOptions] = useState<PasswordOptions>({
		length: 20,
		lowercase: true,
		uppercase: true,
		digits: true,
		symbols: true,
		avoidAmbiguous: false,
	});
	const [values, setValues] = useState<Array<string>>([]);
	const [count, setCount] = useState<string>("1");

	const update = <K extends keyof PasswordOptions>(
		key: K,
		value: PasswordOptions[K]
	): void => {
		setOptions((previous) => ({ ...previous, [key]: value }));
	};

	const generate = useCallback((): void => {
		const requested = Math.min(Math.max(Number(count) || 1, 1), 100);
		try {
			setValues(
				Array.from({ length: requested }, () => generatePassword(options))
			);
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : t("passwordGenerator.failed")
			);
			setValues([]);
		}
	}, [count, options, t]);

	// 화면에 들어오면 바로 하나 보여 준다. 설정이 바뀌면 다시 만든다.
	useEffect(() => {
		generate();
	}, [generate]);

	const strength = estimateStrength(options);

	return (
		<Content
			categoryName={t("passwordGenerator.category")}
			title={t("passwordGenerator.title")}
		>
			<p className="text-neutral-15 text-sm lg:text-md">
				{t("passwordGenerator.intro")}
			</p>

			<div className="flex flex-col gap-3">
				{values.map((value, index) => (
					<div
						key={`${index}-${value}`}
						className="flex items-center gap-4 border border-neutral-05 rounded-xl px-4 py-4 bg-main-00"
					>
						<code className="flex-1 min-w-0 break-all text-neutral-05 font-mono text-lg">
							{value}
						</code>
						<button
							className="text-sm underline text-neutral-15 hover:text-neutral-05 shrink-0"
							type="button"
							onClick={() => {
								copyToClipboard(value);
							}}
						>
							{t("common.copy")}
						</button>
					</div>
				))}
			</div>

			<div className="flex flex-col gap-2">
				<div className="flex justify-between text-sm">
					<span className="text-neutral-15">
						{t("passwordGenerator.strength")}
					</span>
					<span className="text-neutral-05">
						{tDynamic(t, `passwordGenerator.level.${strength.level}`)} ·{" "}
						{t("passwordGenerator.bits", { bits: strength.bits })}
					</span>
				</div>
				<div className="w-full h-2 bg-main-05 rounded-full overflow-hidden">
					<div
						className={`h-full transition-all duration-200 ${STRENGTH_COLORS[strength.level]}`}
						style={{ width: `${Math.min(100, (strength.bits / 128) * 100)}%` }}
					></div>
				</div>
			</div>

			<div className="flex flex-col gap-6">
				<div className="flex flex-col gap-2">
					<div className="flex justify-between text-sm">
						<span className="text-neutral-15">
							{t("passwordGenerator.length")}
						</span>
						<span className="text-neutral-05 font-medium">
							{options.length}
						</span>
					</div>
					<input
						className="w-full accent-green-05"
						id="password-length"
						max="64"
						min="4"
						type="range"
						value={options.length}
						onChange={(event) => {
							update("length", Number(event.target.value));
						}}
					/>
				</div>

				<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
					<Toggle
						checked={options.lowercase}
						id="password-lowercase"
						label={t("passwordGenerator.lowercase")}
						onChange={(value) => {
							update("lowercase", value);
						}}
					/>
					<Toggle
						checked={options.uppercase}
						id="password-uppercase"
						label={t("passwordGenerator.uppercase")}
						onChange={(value) => {
							update("uppercase", value);
						}}
					/>
					<Toggle
						checked={options.digits}
						id="password-digits"
						label={t("passwordGenerator.digits")}
						onChange={(value) => {
							update("digits", value);
						}}
					/>
					<Toggle
						checked={options.symbols}
						id="password-symbols"
						label={t("passwordGenerator.symbols")}
						onChange={(value) => {
							update("symbols", value);
						}}
					/>
					<Toggle
						checked={options.avoidAmbiguous}
						id="password-ambiguous"
						label={t("passwordGenerator.avoidAmbiguous")}
						onChange={(value) => {
							update("avoidAmbiguous", value);
						}}
					/>
				</div>

				<div className="flex flex-wrap gap-4 items-end">
					<div className="flex flex-col gap-2">
						<div className="text-neutral-15 text-sm">
							{t("passwordGenerator.howMany")}
						</div>
						<div className="flex items-center h-12 w-[120px] border border-neutral-05 rounded-xl px-3">
							<input
								className="w-full bg-transparent text-neutral-05 outline-none font-medium"
								id="password-count"
								inputMode="numeric"
								max="100"
								min="1"
								type="number"
								value={count}
								onChange={(event) => {
									setCount(event.target.value);
								}}
							/>
						</div>
					</div>
					<ActionButton
						label={t("passwordGenerator.generate")}
						onClick={generate}
					/>
					{values.length > 1 && (
						<ActionButton
							label={t("common.copyAll")}
							onClick={() => {
								copyToClipboard(values.join("\n"));
							}}
						/>
					)}
				</div>
			</div>

			<RelatedTools path="/password-generator" />
			<PageGuideSection path="/password-generator" />
		</Content>
	);
};
