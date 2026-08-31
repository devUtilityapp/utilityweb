export type TimestampUnit = "seconds" | "milliseconds";

export type RelativeUnit =
	| "second"
	| "minute"
	| "hour"
	| "day"
	| "month"
	| "year";


export interface TimestampView {
	seconds: number;
	milliseconds: number;
	iso: string;
	utc: string;
	local: string;
	relative: { amount: number; unit: RelativeUnit };
}

/**
 * 자릿수로 초와 밀리초를 가려낸다.
 * 초 단위 값은 2001년 이후로 열 자리라, 열세 자리면 밀리초로 본다.
 */
export const guessUnit = (input: string): TimestampUnit =>
	input.trim().replace(/\D/g, "").length > 11 ? "milliseconds" : "seconds";

export const parseTimestamp = (
	input: string,
	unit: TimestampUnit
): Date | null => {
	const trimmed = input.trim();
	if (trimmed === "" || !/^-?\d+$/.test(trimmed)) return null;

	const value = Number(trimmed);
	if (!Number.isFinite(value)) return null;

	const date = new Date(unit === "seconds" ? value * 1000 : value);
	return Number.isNaN(date.getTime()) ? null : date;
};

export const parseDateText = (input: string): Date | null => {
	if (input.trim() === "") return null;
	const parsed = new Date(input);
	return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const RELATIVE_STEPS: Array<{ unit: RelativeUnit; seconds: number }> = [
	{ unit: "year", seconds: 31_536_000 },
	{ unit: "month", seconds: 2_592_000 },
	{ unit: "day", seconds: 86_400 },
	{ unit: "hour", seconds: 3600 },
	{ unit: "minute", seconds: 60 },
	{ unit: "second", seconds: 1 },
];

/** 지금으로부터 얼마나 떨어져 있는지. 음수면 과거다. */
const relativeTo = (
	date: Date,
	now: number
): { amount: number; unit: RelativeUnit } => {
	const seconds = (date.getTime() - now) / 1000;
	const magnitude = Math.abs(seconds);

	const step =
		RELATIVE_STEPS.find((entry) => magnitude >= entry.seconds) ??
		RELATIVE_STEPS.at(-1);

	return {
		amount: Math.round(seconds / (step?.seconds ?? 1)),
		unit: step?.unit ?? "second",
	};
};

/** 하나의 시각을 흔히 쓰는 여러 표기로 펼친다. */
export const describeTimestamp = (date: Date, now: number): TimestampView => ({
	seconds: Math.floor(date.getTime() / 1000),
	milliseconds: date.getTime(),
	iso: date.toISOString(),
	utc: date.toUTCString(),
	local: date.toLocaleString(),
	relative: relativeTo(date, now),
});
