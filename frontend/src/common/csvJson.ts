export type Delimiter = "," | ";" | "\t" | "|";

export const DELIMITERS: Record<string, Delimiter> = {
	Comma: ",",
	Semicolon: ";",
	Tab: "\t",
	Pipe: "|",
};

/**
 * RFC 4180에 맞춰 CSV를 표로 읽는다.
 * 따옴표 안의 줄바꿈, 쉼표, 두 번 겹친 따옴표를 모두 다룬다.
 */
export const parseCsv = (
	text: string,
	delimiter: Delimiter
): Array<Array<string>> => {
	const rows: Array<Array<string>> = [];
	let row: Array<string> = [];
	let field = "";
	let quoted = false;

	// BOM이 남아 있으면 첫 열 이름이 깨진다.
	const source = text.replace(/^\uFEFF/, "");

	for (let index = 0; index < source.length; index++) {
		const character = source[index];

		if (quoted) {
			if (character === '"') {
				if (source[index + 1] === '"') {
					field += '"';
					index++;
				} else {
					quoted = false;
				}
			} else {
				field += character;
			}
			continue;
		}

		if (character === '"' && field === "") {
			quoted = true;
		} else if (character === delimiter) {
			row.push(field);
			field = "";
		} else if (character === "\n" || character === "\r") {
			// CRLF는 한 번의 줄바꿈으로 센다.
			if (character === "\r" && source[index + 1] === "\n") index++;
			row.push(field);
			rows.push(row);
			row = [];
			field = "";
		} else {
			field += character;
		}
	}

	if (field !== "" || row.length > 0) {
		row.push(field);
		rows.push(row);
	}

	return rows.filter((entry) => entry.some((value) => value !== ""));
};

/** "12", "1.5", "true", "" 처럼 보이는 값을 실제 타입으로 바꾼다. */
const coerce = (value: string): string | number | boolean | null => {
	const trimmed = value.trim();
	if (trimmed === "") return null;
	if (trimmed === "true") return true;
	if (trimmed === "false") return false;
	// 앞자리 0이 있는 값(우편번호, 전화번호)은 숫자로 바꾸면 정보가 사라진다.
	if (/^-?(0|[1-9]\d*)(\.\d+)?$/.test(trimmed)) return Number(trimmed);
	return value;
};

export interface CsvToJsonOptions {
	delimiter: Delimiter;
	/** 첫 줄을 열 이름으로 쓸지 */
	header: boolean;
	/** 숫자와 참/거짓처럼 보이는 값을 그 타입으로 바꿀지 */
	typed: boolean;
}

export const csvToJson = (
	text: string,
	{ delimiter, header, typed }: CsvToJsonOptions
): Array<unknown> => {
	const rows = parseCsv(text, delimiter);
	if (rows.length === 0) throw new Error("There is no data to convert");

	const convert = (value: string): unknown => (typed ? coerce(value) : value);

	if (!header) return rows.map((row) => row.map((value) => convert(value)));

	const [names, ...body] = rows;
	if (!names) throw new Error("There is no header row");

	// 이름이 비었거나 겹치면 키가 사라지므로 번호를 붙여 구분한다.
	const used = new Map<string, number>();
	const keys = names.map((name, index) => {
		const base = name.trim() === "" ? `column${index + 1}` : name.trim();
		const count = used.get(base) ?? 0;
		used.set(base, count + 1);
		return count === 0 ? base : `${base}_${count + 1}`;
	});

	return body.map((row) =>
		Object.fromEntries(
			keys.map((key, index) => [key, convert(row[index] ?? "")])
		)
	);
};

const escapeCsv = (value: unknown, delimiter: Delimiter): string => {
	if (value === null || value === undefined) return "";
	const text =
		typeof value === "object" ? JSON.stringify(value) : String(value);
	return /["\n\r]/.test(text) || text.includes(delimiter)
		? `"${text.replace(/"/g, '""')}"`
		: text;
};

/** 객체 배열을 CSV로 되돌린다. 열은 모든 행의 키를 합쳐서 만든다. */
export const jsonToCsv = (text: string, delimiter: Delimiter): string => {
	let parsed: unknown;
	try {
		parsed = JSON.parse(text);
	} catch {
		throw new Error("This is not valid JSON");
	}
	if (!Array.isArray(parsed)) {
		throw new Error("The JSON must be an array of rows");
	}
	if (parsed.length === 0) return "";

	if (parsed.every((row) => Array.isArray(row))) {
		return parsed
			.map((row) =>
				row.map((value) => escapeCsv(value, delimiter)).join(delimiter)
			)
			.join("\n");
	}

	const keys: Array<string> = [];
	for (const row of parsed) {
		if (row === null || typeof row !== "object") {
			throw new Error("Every item in the array must be an object");
		}
		for (const key of Object.keys(row as Record<string, unknown>)) {
			if (!keys.includes(key)) keys.push(key);
		}
	}

	const lines = [keys.map((key) => escapeCsv(key, delimiter)).join(delimiter)];
	for (const row of parsed as Array<Record<string, unknown>>) {
		lines.push(
			keys.map((key) => escapeCsv(row[key], delimiter)).join(delimiter)
		);
	}
	return lines.join("\n");
};
