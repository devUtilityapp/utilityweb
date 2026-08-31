export type IndentStyle = "2" | "4" | "tab";

export interface JsonError {
	message: string;
	/** 브라우저가 위치를 알려주지 않으면 null */
	line: number | null;
	column: number | null;
}

/**
 * JSON 파서는 위치를 문자 오프셋으로만 알려준다.
 * 사람이 찾을 수 있게 줄과 칸으로 바꾼다.
 */
const positionOf = (
	text: string,
	offset: number
): { line: number; column: number } => {
	const before = text.slice(0, Math.max(0, offset));
	const lines = before.split("\n");
	return {
		line: lines.length,
		column: (lines.at(-1)?.length ?? 0) + 1,
	};
};

/**
 * 오류 메시지에서 문자 오프셋을 뽑는다.
 * 브라우저마다 문구가 다르고, 아예 위치를 넣지 않는 메시지도 있어서
 * 그럴 때는 null을 돌려준다. 모르면서 1행 1열이라고 하면 더 헷갈린다.
 */
const errorOffset = (message: string, text: string): number | null => {
	const position = /position (\d+)/.exec(message);
	if (position?.[1]) return Number(position[1]);

	const lineColumn = /line (\d+) column (\d+)/.exec(message);
	if (lineColumn?.[1] && lineColumn[2]) {
		const lines = text.split("\n");
		const lineIndex = Number(lineColumn[1]) - 1;
		const before = lines
			.slice(0, lineIndex)
			.reduce((total, line) => total + line.length + 1, 0);
		return before + Number(lineColumn[2]) - 1;
	}
	return null;
};

/** 객체의 키를 알파벳 순으로 다시 담는다. 배열의 순서는 그대로 둔다. */
const sortKeys = (value: unknown): unknown => {
	if (Array.isArray(value)) return value.map((item) => sortKeys(item));
	if (value !== null && typeof value === "object") {
		return Object.fromEntries(
			Object.entries(value as Record<string, unknown>)
				.sort(([first], [second]) => first.localeCompare(second))
				.map(([key, item]) => [key, sortKeys(item)])
		);
	}
	return value;
};

const indentOf = (style: IndentStyle): string | number =>
	style === "tab" ? "\t" : Number(style);

export interface FormatResult {
	output: string;
	error: JsonError | null;
}

const parse = (text: string): { value: unknown; error: JsonError | null } => {
	try {
		return { value: JSON.parse(text), error: null };
	} catch (error) {
		const message = error instanceof Error ? error.message : "Invalid JSON";
		const offset = errorOffset(message, text);
		const position =
			offset === null ? { line: null, column: null } : positionOf(text, offset);
		return { value: null, error: { message, ...position } };
	}
};

export const formatJson = (
	text: string,
	{ indent, sort }: { indent: IndentStyle; sort: boolean }
): FormatResult => {
	const { value, error } = parse(text);
	if (error) return { output: "", error };

	return {
		output: JSON.stringify(
			sort ? sortKeys(value) : value,
			null,
			indentOf(indent)
		),
		error: null,
	};
};

export const minifyJson = (
	text: string,
	{ sort }: { sort: boolean }
): FormatResult => {
	const { value, error } = parse(text);
	if (error) return { output: "", error };

	return {
		output: JSON.stringify(sort ? sortKeys(value) : value),
		error: null,
	};
};

/** 값의 개수를 세어 문서 규모를 보여준다. */
export const countNodes = (text: string): number | null => {
	const { value, error } = parse(text);
	if (error) return null;

	const walk = (node: unknown): number => {
		if (Array.isArray(node)) {
			return 1 + node.reduce<number>((total, item) => total + walk(item), 0);
		}
		if (node !== null && typeof node === "object") {
			return (
				1 +
				Object.values(node as Record<string, unknown>).reduce<number>(
					(total, item) => total + walk(item),
					0
				)
			);
		}
		return 1;
	};

	return walk(value);
};
