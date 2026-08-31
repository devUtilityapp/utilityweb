export type UnitCategory =
	| "length"
	| "weight"
	| "temperature"
	| "area"
	| "volume"
	| "speed"
	| "data"
	| "time";

export interface UnitDefinition {
	/** translations.json의 unitConverter.units.* 키 */
	key: string;
	/** 화면에 붙는 짧은 기호. 언어와 무관하다. */
	symbol: string;
	/** 기준 단위 1개에 해당하는 값. 온도는 따로 계산한다. */
	factor: number;
}

// 각 분류의 첫 단위를 기준으로 삼고, 나머지는 그 배수로 적는다.
// 곱하고 나누기만 하므로 어느 단위끼리든 바로 오갈 수 있다.
export const UNITS: Record<UnitCategory, Array<UnitDefinition>> = {
	length: [
		{ key: "meter", symbol: "m", factor: 1 },
		{ key: "kilometer", symbol: "km", factor: 1000 },
		{ key: "centimeter", symbol: "cm", factor: 0.01 },
		{ key: "millimeter", symbol: "mm", factor: 0.001 },
		{ key: "mile", symbol: "mi", factor: 1609.344 },
		{ key: "yard", symbol: "yd", factor: 0.9144 },
		{ key: "foot", symbol: "ft", factor: 0.3048 },
		{ key: "inch", symbol: "in", factor: 0.0254 },
	],
	weight: [
		{ key: "kilogram", symbol: "kg", factor: 1 },
		{ key: "gram", symbol: "g", factor: 0.001 },
		{ key: "milligram", symbol: "mg", factor: 0.000_001 },
		{ key: "tonne", symbol: "t", factor: 1000 },
		{ key: "pound", symbol: "lb", factor: 0.453_592_37 },
		{ key: "ounce", symbol: "oz", factor: 0.028_349_523_125 },
	],
	temperature: [
		{ key: "celsius", symbol: "°C", factor: 1 },
		{ key: "fahrenheit", symbol: "°F", factor: 1 },
		{ key: "kelvin", symbol: "K", factor: 1 },
	],
	area: [
		{ key: "squareMeter", symbol: "m²", factor: 1 },
		{ key: "squareKilometer", symbol: "km²", factor: 1_000_000 },
		{ key: "squareFoot", symbol: "ft²", factor: 0.092_903_04 },
		{ key: "acre", symbol: "ac", factor: 4046.856_422_4 },
		{ key: "hectare", symbol: "ha", factor: 10_000 },
		{ key: "pyeong", symbol: "평", factor: 400 / 121 },
	],
	volume: [
		{ key: "liter", symbol: "L", factor: 1 },
		{ key: "milliliter", symbol: "mL", factor: 0.001 },
		{ key: "cubicMeter", symbol: "m³", factor: 1000 },
		{ key: "gallon", symbol: "gal", factor: 3.785_411_784 },
		{ key: "quart", symbol: "qt", factor: 0.946_352_946 },
		{ key: "cup", symbol: "cup", factor: 0.236_588_236_5 },
	],
	speed: [
		{ key: "meterPerSecond", symbol: "m/s", factor: 1 },
		{ key: "kilometerPerHour", symbol: "km/h", factor: 1 / 3.6 },
		{ key: "milePerHour", symbol: "mph", factor: 0.447_04 },
		{ key: "knot", symbol: "kn", factor: 0.514_444_444 },
	],
	data: [
		{ key: "byte", symbol: "B", factor: 1 },
		{ key: "kilobyte", symbol: "KB", factor: 1024 },
		{ key: "megabyte", symbol: "MB", factor: 1024 ** 2 },
		{ key: "gigabyte", symbol: "GB", factor: 1024 ** 3 },
		{ key: "terabyte", symbol: "TB", factor: 1024 ** 4 },
	],
	time: [
		{ key: "second", symbol: "s", factor: 1 },
		{ key: "millisecond", symbol: "ms", factor: 0.001 },
		{ key: "minute", symbol: "min", factor: 60 },
		{ key: "hour", symbol: "h", factor: 3600 },
		{ key: "day", symbol: "d", factor: 86_400 },
		{ key: "week", symbol: "wk", factor: 604_800 },
	],
};

export const UNIT_CATEGORIES = Object.keys(UNITS) as Array<UnitCategory>;

// 온도는 눈금의 시작점이 서로 달라서 배수만으로는 옮길 수 없다.
const toCelsius = (value: number, unit: string): number => {
	if (unit === "fahrenheit") return ((value - 32) * 5) / 9;
	if (unit === "kelvin") return value - 273.15;
	return value;
};

const fromCelsius = (celsius: number, unit: string): number => {
	if (unit === "fahrenheit") return (celsius * 9) / 5 + 32;
	if (unit === "kelvin") return celsius + 273.15;
	return celsius;
};

export const findUnit = (
	category: UnitCategory,
	key: string
): UnitDefinition | undefined =>
	UNITS[category].find((unit) => unit.key === key);

/** 한 단위의 값을 다른 단위의 값으로 옮긴다. */
export const convertUnit = (
	value: number,
	category: UnitCategory,
	fromKey: string,
	toKey: string
): number | null => {
	if (!Number.isFinite(value)) return null;

	if (category === "temperature") {
		return fromCelsius(toCelsius(value, fromKey), toKey);
	}

	const from = findUnit(category, fromKey);
	const to = findUnit(category, toKey);
	if (!from || !to) return null;

	return (value * from.factor) / to.factor;
};

/**
 * 결과를 사람이 읽기 좋게 적는다.
 * 아주 크거나 작은 값은 지수 표기로 두고, 그 사이는 자릿수를 적당히 자른다.
 */
export const formatResult = (value: number): string => {
	if (!Number.isFinite(value)) return "";
	if (value === 0) return "0";

	const magnitude = Math.abs(value);
	if (magnitude >= 1e15 || magnitude < 1e-6) return value.toExponential(6);

	// 소수점 아래 자릿수는 값이 작을수록 넉넉하게 남긴다.
	const decimals = magnitude >= 100 ? 4 : magnitude >= 1 ? 6 : 10;
	return Number.parseFloat(value.toFixed(decimals)).toString();
};

/** 한 값이 그 분류의 모든 단위에서 얼마인지. 표로 보여 줄 때 쓴다. */
export const convertToAll = (
	value: number,
	category: UnitCategory,
	fromKey: string
): Array<{ unit: UnitDefinition; value: number }> =>
	UNITS[category]
		.map((unit) => ({
			unit,
			value: convertUnit(value, category, fromKey, unit.key) ?? Number.NaN,
		}))
		.filter((entry) => Number.isFinite(entry.value));
