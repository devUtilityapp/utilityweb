export interface Rgb {
	r: number;
	g: number;
	b: number;
}

export interface Hsl {
	h: number;
	s: number;
	l: number;
}

export interface ColorInfo {
	hex: string;
	rgb: Rgb;
	hsl: Hsl;
	hsv: { h: number; s: number; v: number };
	cmyk: { c: number; m: number; y: number; k: number };
	/** 흰 글씨와 검은 글씨를 올렸을 때의 WCAG 대비율 */
	contrastOnWhite: number;
	contrastOnBlack: number;
}

const clamp = (value: number, min: number, max: number): number =>
	Math.min(max, Math.max(min, value));

const round = (value: number): number => Math.round(value * 10) / 10;

const hexToRgb = (value: string): Rgb | null => {
	const cleaned = value.trim().replace(/^#/, "");
	// #abc는 #aabbcc의 줄임 표기다.
	const full =
		cleaned.length === 3 || cleaned.length === 4
			? [...cleaned].map((character) => character + character).join("")
			: cleaned;
	if (!/^[\da-f]{6}([\da-f]{2})?$/i.test(full)) return null;

	return {
		r: Number.parseInt(full.slice(0, 2), 16),
		g: Number.parseInt(full.slice(2, 4), 16),
		b: Number.parseInt(full.slice(4, 6), 16),
	};
};

const hslToRgb = ({ h, s, l }: Hsl): Rgb => {
	const saturation = s / 100;
	const lightness = l / 100;
	const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
	const hue = (((h % 360) + 360) % 360) / 60;
	const second = chroma * (1 - Math.abs((hue % 2) - 1));
	const match = lightness - chroma / 2;

	const [r, g, b] = ((): [number, number, number] => {
		if (hue < 1) return [chroma, second, 0];
		if (hue < 2) return [second, chroma, 0];
		if (hue < 3) return [0, chroma, second];
		if (hue < 4) return [0, second, chroma];
		if (hue < 5) return [second, 0, chroma];
		return [chroma, 0, second];
	})();

	return {
		r: Math.round((r + match) * 255),
		g: Math.round((g + match) * 255),
		b: Math.round((b + match) * 255),
	};
};

const rgbToHsl = ({ r, g, b }: Rgb): Hsl => {
	const red = r / 255;
	const green = g / 255;
	const blue = b / 255;
	const max = Math.max(red, green, blue);
	const min = Math.min(red, green, blue);
	const delta = max - min;
	const lightness = (max + min) / 2;

	if (delta === 0) return { h: 0, s: 0, l: round(lightness * 100) };

	const saturation = delta / (1 - Math.abs(2 * lightness - 1));
	const hue =
		max === red
			? ((green - blue) / delta) % 6
			: max === green
				? (blue - red) / delta + 2
				: (red - green) / delta + 4;

	return {
		h: Math.round((((hue * 60) % 360) + 360) % 360),
		s: round(saturation * 100),
		l: round(lightness * 100),
	};
};

const rgbToHsv = ({ r, g, b }: Rgb): { h: number; s: number; v: number } => {
	const max = Math.max(r, g, b) / 255;
	const min = Math.min(r, g, b) / 255;
	const delta = max - min;
	const { h } = rgbToHsl({ r, g, b });
	return {
		h,
		s: round(max === 0 ? 0 : (delta / max) * 100),
		v: round(max * 100),
	};
};

const rgbToCmyk = ({
	r,
	g,
	b,
}: Rgb): { c: number; m: number; y: number; k: number } => {
	const red = r / 255;
	const green = g / 255;
	const blue = b / 255;
	const k = 1 - Math.max(red, green, blue);
	if (k === 1) return { c: 0, m: 0, y: 0, k: 100 };

	return {
		c: round(((1 - red - k) / (1 - k)) * 100),
		m: round(((1 - green - k) / (1 - k)) * 100),
		y: round(((1 - blue - k) / (1 - k)) * 100),
		k: round(k * 100),
	};
};

export const rgbToHex = ({ r, g, b }: Rgb): string =>
	`#${[r, g, b]
		.map((value) =>
			clamp(Math.round(value), 0, 255).toString(16).padStart(2, "0")
		)
		.join("")}`;

/** WCAG의 상대 휘도. 대비율 계산에 쓴다. */
const luminance = ({ r, g, b }: Rgb): number => {
	const channel = (value: number): number => {
		const ratio = value / 255;
		return ratio <= 0.039_28 ? ratio / 12.92 : ((ratio + 0.055) / 1.055) ** 2.4;
	};
	return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
};

export const contrastRatio = (first: Rgb, second: Rgb): number => {
	const a = luminance(first);
	const b = luminance(second);
	const [light, dark] = a > b ? [a, b] : [b, a];
	// 대비율은 소수 둘째 자리까지만 의미가 있다(1:1 ~ 21:1).
	return Math.round(((light + 0.05) / (dark + 0.05)) * 100) / 100;
};

/**
 * 사람이 적는 여러 표기를 받아들인다.
 * "#3a2", "3a2e30", "rgb(58 46 48)", "rgba(58,46,48,.5)", "hsl(340, 12%, 20%)"
 */
export const parseColor = (input: string): Rgb | null => {
	const value = input.trim().toLowerCase();
	if (value === "") return null;

	const fromHex = hexToRgb(value);
	if (fromHex) return fromHex;

	const numbers = [...value.matchAll(/-?\d*\.?\d+/g)].map((match) =>
		Number(match[0])
	);

	if (value.startsWith("rgb") && numbers.length >= 3) {
		const [r, g, b] = numbers;
		return {
			r: clamp(Math.round(r ?? 0), 0, 255),
			g: clamp(Math.round(g ?? 0), 0, 255),
			b: clamp(Math.round(b ?? 0), 0, 255),
		};
	}

	if (value.startsWith("hsl") && numbers.length >= 3) {
		const [h, s, l] = numbers;
		return hslToRgb({
			h: h ?? 0,
			s: clamp(s ?? 0, 0, 100),
			l: clamp(l ?? 0, 0, 100),
		});
	}

	return null;
};

export const describeColor = (rgb: Rgb): ColorInfo => ({
	hex: rgbToHex(rgb),
	rgb,
	hsl: rgbToHsl(rgb),
	hsv: rgbToHsv(rgb),
	cmyk: rgbToCmyk(rgb),
	contrastOnWhite: contrastRatio(rgb, { r: 255, g: 255, b: 255 }),
	contrastOnBlack: contrastRatio(rgb, { r: 0, g: 0, b: 0 }),
});

/** 밝기만 바꿔 만든 색 계단. 버튼의 hover/active 색을 고를 때 쓴다. */
export const buildShades = (rgb: Rgb): Array<{ hex: string; l: number }> => {
	const { h, s } = rgbToHsl(rgb);
	return [95, 85, 75, 65, 55, 45, 35, 25, 15, 5].map((l) => ({
		hex: rgbToHex(hslToRgb({ h, s, l })),
		l,
	}));
};

export { hslToRgb, rgbToHsl };
