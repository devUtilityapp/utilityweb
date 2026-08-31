export interface RegexMatch {
	/** 전체가 맞은 문자열 */
	text: string;
	index: number;
	/** 괄호로 잡은 부분들 */
	groups: Array<string | undefined>;
	named: Record<string, string>;
}

export interface RegexResult {
	matches: Array<RegexMatch>;
	/** 상한에 걸려 더 찾지 않고 멈췄는지 */
	truncated: boolean;
	error: string | null;
}

// 되돌아가며 헤매는 식(catastrophic backtracking)을 만나면 탭이 멈춘다.
// 브라우저에는 정규식만 중간에 끊는 방법이 없어서, 들어오는 크기를 제한한다.
export const MAX_INPUT_LENGTH = 200_000;
const MAX_MATCHES = 1000;

/** 사용자가 적은 플래그에 g를 더한다. 전부 찾으려면 g가 있어야 한다. */
const withGlobal = (flags: string): string =>
	flags.includes("g") ? flags : `${flags}g`;

export const runRegex = (
	pattern: string,
	flags: string,
	input: string
): RegexResult => {
	if (pattern === "") {
		return { matches: [], truncated: false, error: null };
	}
	if (input.length > MAX_INPUT_LENGTH) {
		return {
			matches: [],
			truncated: false,
			error: `The text is longer than ${MAX_INPUT_LENGTH.toLocaleString()} characters`,
		};
	}

	let expression: RegExp;
	try {
		expression = new RegExp(pattern, withGlobal(flags));
	} catch (error) {
		return {
			matches: [],
			truncated: false,
			error: error instanceof Error ? error.message : "Invalid expression",
		};
	}

	const matches: Array<RegexMatch> = [];
	let truncated = false;

	try {
		for (const found of input.matchAll(expression)) {
			if (matches.length >= MAX_MATCHES) {
				truncated = true;
				break;
			}
			matches.push({
				text: found[0],
				index: found.index,
				groups: found.slice(1),
				named: { ...found.groups },
			});
			// 길이 0으로 맞으면 같은 자리에 머물러 끝없이 돈다. matchAll이 자체적으로
			// 한 칸 밀어 주지만, 안전을 위해 결과 수 상한을 함께 둔다.
		}
	} catch (error) {
		return {
			matches: [],
			truncated: false,
			error:
				error instanceof Error ? error.message : "Could not run the expression",
		};
	}

	return { matches, truncated, error: null };
};

/** 찾은 자리를 감싸 표시할 수 있게 조각으로 나눈다. */
export const splitByMatches = (
	input: string,
	matches: Array<RegexMatch>
): Array<{ text: string; matched: boolean }> => {
	if (matches.length === 0) return [{ text: input, matched: false }];

	const pieces: Array<{ text: string; matched: boolean }> = [];
	let cursor = 0;

	for (const match of matches) {
		if (match.index > cursor) {
			pieces.push({ text: input.slice(cursor, match.index), matched: false });
		}
		if (match.text !== "") {
			pieces.push({ text: match.text, matched: true });
		}
		cursor = Math.max(cursor, match.index + match.text.length);
	}

	if (cursor < input.length) {
		pieces.push({ text: input.slice(cursor), matched: false });
	}
	return pieces;
};

/** 치환 미리보기. $1 같은 표기를 그대로 쓴다. */
export const replaceAll = (
	pattern: string,
	flags: string,
	input: string,
	replacement: string
): string | null => {
	try {
		return input.replace(new RegExp(pattern, withGlobal(flags)), replacement);
	} catch {
		return null;
	}
};
