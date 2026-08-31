import { useState } from "react";
import type { FunctionComponent } from "../../common/types";
import { buildShades, describeColor, parseColor } from "../../common/color";
import { findPageSeo } from "../../common/seo";
import { Content } from "../../components/ui/Content";
import { PageGuideSection } from "../../components/ui/PageGuideSection";
import { CopyField } from "../../components/ui/CopyField";
import { copyToClipboard } from "../../common/clipboard";

// WCAG 기준. 본문은 4.5:1, 큰 글씨는 3:1, AAA는 7:1.
const gradeFor = (ratio: number): string => {
	if (ratio >= 7) return "AAA";
	if (ratio >= 4.5) return "AA";
	if (ratio >= 3) return "AA large text only";
	return "fails";
};

export const ColorConverter = (): FunctionComponent => {
	const [input, setInput] = useState<string>("#39a280");
	const rgb = parseColor(input);
	const color = rgb ? describeColor(rgb) : null;
	const guide = findPageSeo("/color-converter").guide;

	return (
		<Content categoryName="Developer" title="COLOR CONVERTER">
			<p className="text-neutral-15 text-sm lg:text-md">
				Convert a colour between HEX, RGB, HSL, HSV and CMYK, check whether text
				will be readable on it, and pull out its lighter and darker versions.
			</p>

			<div className="flex flex-col lg:flex-row gap-8">
				<div className="flex flex-col gap-4 flex-1">
					<div className="text-neutral-15 text-sm">Colour</div>
					<div className="flex gap-4 items-center">
						<div className="flex items-center h-14 flex-1 border border-neutral-05 rounded-xl px-4">
							<input
								className="w-full bg-transparent text-neutral-05 outline-none font-mono"
								id="color-input"
								placeholder="#39a280, rgb(57 162 128), hsl(160 48% 43%)"
								type="text"
								value={input}
								onChange={(event) => {
									setInput(event.target.value);
								}}
							/>
						</div>
						<input
							aria-label="Pick a colour"
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
						<div className="text-neutral-05">
							That is not a colour we can read. Try a hex code, or an rgb() or
							hsl() value.
						</div>
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
							<div className="text-white font-medium">White text</div>
							<div className="text-black font-medium">Black text</div>
						</div>

						<div className="flex flex-col gap-2">
							<div className="flex justify-between text-sm">
								<span className="text-neutral-15">White text</span>
								<span className="text-neutral-05">
									{color.contrastOnWhite.toFixed(2)}:1 ·{" "}
									{gradeFor(color.contrastOnWhite)}
								</span>
							</div>
							<div className="flex justify-between text-sm">
								<span className="text-neutral-15">Black text</span>
								<span className="text-neutral-05">
									{color.contrastOnBlack.toFixed(2)}:1 ·{" "}
									{gradeFor(color.contrastOnBlack)}
								</span>
							</div>
						</div>
					</div>
				)}
			</div>

			{color && (
				<div className="flex flex-col gap-4">
					<div className="text-neutral-05 font-medium text-xl lg:text-2xl">
						Tints and shades
					</div>
					<div className="flex flex-wrap gap-3">
						{buildShades(color.rgb).map((shade) => (
							<button
								key={shade.hex}
								className="flex flex-col items-center gap-2"
								title={`Copy ${shade.hex}`}
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

			{guide && <PageGuideSection guide={guide} />}
		</Content>
	);
};
