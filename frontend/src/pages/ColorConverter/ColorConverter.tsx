import { useState } from "react";
import type { TFunction } from "i18next";
import { useTranslation } from "react-i18next";
import { tDynamic } from "../../common/translate";
import type { FunctionComponent } from "../../common/types";
import { buildShades, describeColor, parseColor } from "../../common/color";
import { Content } from "../../components/ui/Content";
import { PageGuideSection } from "../../components/ui/PageGuideSection";
import { CopyField } from "../../components/ui/CopyField";
import { copyToClipboard } from "../../common/clipboard";

// WCAG 기준. 본문은 4.5:1, 큰 글씨는 3:1, AAA는 7:1.
const gradeFor = (ratio: number, t: TFunction): string => {
	if (ratio >= 7) return "AAA";
	if (ratio >= 4.5) return "AA";
	if (ratio >= 3) return tDynamic(t, "colorConverter.gradeLarge");
	return tDynamic(t, "colorConverter.gradeFails");
};

export const ColorConverter = (): FunctionComponent => {
	const { t } = useTranslation();
	const [input, setInput] = useState<string>("#39a280");
	const rgb = parseColor(input);
	const color = rgb ? describeColor(rgb) : null;
	return (
		<Content
			categoryName={t("colorConverter.category")}
			title={t("colorConverter.title")}
		>
			<p className="text-neutral-15 text-sm lg:text-md">
				{t("colorConverter.intro")}
			</p>

			<div className="flex flex-col lg:flex-row gap-8">
				<div className="flex flex-col gap-4 flex-1">
					<div className="text-neutral-15 text-sm">
						{t("colorConverter.colour")}
					</div>
					<div className="flex gap-4 items-center">
						<div className="flex items-center h-14 flex-1 border border-neutral-05 rounded-xl px-4">
							<input
								className="w-full bg-transparent text-neutral-05 outline-none font-mono"
								id="color-input"
								placeholder={t("colorConverter.placeholder")}
								type="text"
								value={input}
								onChange={(event) => {
									setInput(event.target.value);
								}}
							/>
						</div>
						<input
							aria-label={t("colorConverter.pick")}
							className="w-14 h-14 rounded-xl bg-transparent cursor-pointer border border-neutral-05"
							id="color-picker"
							type="color"
							value={color ? color.hex : "#000000"}
							onChange={(event) => {
								setInput(event.target.value);
							}}
						/>
					</div>

					{color === null && input.trim() !== "" && (
						<div className="text-neutral-05">{t("colorConverter.invalid")}</div>
					)}

					{color && (
						<div className="flex flex-col gap-3">
							<CopyField label="HEX" value={color.hex} />
							<CopyField
								label="RGB"
								value={`rgb(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})`}
							/>
							<CopyField
								label="HSL"
								value={`hsl(${color.hsl.h}, ${color.hsl.s}%, ${color.hsl.l}%)`}
							/>
							<CopyField
								label="HSV"
								value={`hsv(${color.hsv.h}, ${color.hsv.s}%, ${color.hsv.v}%)`}
							/>
							<CopyField
								label="CMYK"
								value={`cmyk(${color.cmyk.c}%, ${color.cmyk.m}%, ${color.cmyk.y}%, ${color.cmyk.k}%)`}
							/>
						</div>
					)}
				</div>

				{color && (
					<div className="flex flex-col gap-4 lg:w-[300px]">
						<div
							className="w-full h-40 rounded-2xl border border-neutral-50 flex flex-col items-center justify-center gap-1"
							style={{ backgroundColor: color.hex }}
						>
							<div className="text-white font-medium">
								{t("colorConverter.whiteText")}
							</div>
							<div className="text-black font-medium">
								{t("colorConverter.blackText")}
							</div>
						</div>

						<div className="flex flex-col gap-2">
							<div className="flex justify-between text-sm">
								<span className="text-neutral-15">
									{t("colorConverter.whiteText")}
								</span>
								<span className="text-neutral-05">
									{color.contrastOnWhite.toFixed(2)}:1 ·{" "}
									{gradeFor(color.contrastOnWhite, t)}
								</span>
							</div>
							<div className="flex justify-between text-sm">
								<span className="text-neutral-15">
									{t("colorConverter.blackText")}
								</span>
								<span className="text-neutral-05">
									{color.contrastOnBlack.toFixed(2)}:1 ·{" "}
									{gradeFor(color.contrastOnBlack, t)}
								</span>
							</div>
						</div>
					</div>
				)}
			</div>

			{color && (
				<div className="flex flex-col gap-4">
					<div className="text-neutral-05 font-medium text-xl lg:text-2xl">
						{t("colorConverter.shades")}
					</div>
					<div className="flex flex-wrap gap-3">
						{buildShades(color.rgb).map((shade) => (
							<button
								key={shade.hex}
								className="flex flex-col items-center gap-2"
								title={t("colorConverter.copyShade", { hex: shade.hex })}
								type="button"
								onClick={() => {
									copyToClipboard(shade.hex);
								}}
							>
								<span
									className="block w-16 h-16 rounded-xl border border-neutral-50"
									style={{ backgroundColor: shade.hex }}
								></span>
								<span className="text-neutral-15 text-xs font-mono">
									{shade.hex}
								</span>
							</button>
						))}
					</div>
				</div>
			)}

			<PageGuideSection path="/color-converter" />
		</Content>
	);
};
