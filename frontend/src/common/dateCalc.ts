export interface DateDifference {
	/** 두 날짜 사이의 전체 일수 */
	days: number;
	weeks: number;
	/** 남은 일수까지 나눠 적은 값 */
	years: number;
	months: number;
	restDays: number;
	/** 주말을 뺀 일수 */
	businessDays: number;
	hours: number;
	minutes: number;
}

const MS_PER_DAY = 86_400_000;

/** 시각을 떼고 날짜만 남긴다. 시차 때문에 하루가 어긋나는 것을 막는다. */
const atMidnight = (value: Date): Date =>
	new Date(value.getFullYear(), value.getMonth(), value.getDate());

export const parseDate = (value: string): Date | null => {
	if (value.trim() === "") return null;
	const parsed = new Date(value);
	return Number.isNaN(parsed.getTime()) ? null : parsed;
};

/** 주말을 뺀 날 수. 시작일은 포함하고 종료일은 포함하지 않는다. */
const countBusinessDays = (start: Date, end: Date): number => {
	let count = 0;
	for (
		const cursor = new Date(start);
		cursor.getTime() < end.getTime();
		cursor.setDate(cursor.getDate() + 1)
	) {
		const weekday = cursor.getDay();
		if (weekday !== 0 && weekday !== 6) count++;
	}
	return count;
};

export const differenceBetween = (from: Date, to: Date): DateDifference => {
	const [start, end] = from <= to ? [from, to] : [to, from];
	const startDay = atMidnight(start);
	const endDay = atMidnight(end);

	const days = Math.round((endDay.getTime() - startDay.getTime()) / MS_PER_DAY);

	// 달의 길이가 제각각이라 년·월은 달력을 따라 세고 남는 날을 따로 센다.
	let years = endDay.getFullYear() - startDay.getFullYear();
	let months = endDay.getMonth() - startDay.getMonth();
	let restDays = endDay.getDate() - startDay.getDate();

	if (restDays < 0) {
		months--;
		// 직전 달의 마지막 날을 구해 그만큼 빌려 온다.
		const borrowed = new Date(endDay.getFullYear(), endDay.getMonth(), 0);
		restDays += borrowed.getDate();
	}
	if (months < 0) {
		years--;
		months += 12;
	}

	const milliseconds = end.getTime() - start.getTime();

	return {
		days,
		weeks: Math.floor(days / 7),
		years,
		months,
		restDays,
		businessDays: countBusinessDays(startDay, endDay),
		hours: Math.floor(milliseconds / 3_600_000),
		minutes: Math.floor(milliseconds / 60_000),
	};
};

export type ShiftUnit = "days" | "weeks" | "months" | "years";

/** 어떤 날짜에서 일정 기간 앞뒤로 옮긴 날짜. */
export const shiftDate = (
	base: Date,
	amount: number,
	unit: ShiftUnit
): Date => {
	const result = new Date(base);
	if (unit === "days") result.setDate(result.getDate() + amount);
	if (unit === "weeks") result.setDate(result.getDate() + amount * 7);
	if (unit === "months") result.setMonth(result.getMonth() + amount);
	if (unit === "years") result.setFullYear(result.getFullYear() + amount);
	return result;
};

/** input[type=date]에 넣을 수 있는 표기. 시차와 무관하게 지역 날짜를 쓴다. */
export const toDateInput = (value: Date): string =>
	`${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`;

/** 요일 번호. 0이 일요일이다. */
export const weekdayOf = (value: Date): number => value.getDay();
