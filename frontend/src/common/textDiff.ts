export type DiffType = "equal" | "add" | "remove";

export interface DiffLine {
	type: DiffType;
	text: string;
	/** 왼쪽 글에서의 줄 번호. 추가된 줄에는 없다. */
	leftNumber: number | null;
	/** 오른쪽 글에서의 줄 번호. 지워진 줄에는 없다. */
	rightNumber: number | null;
}

export interface DiffOptions {
	ignoreCase: boolean;
	ignoreWhitespace: boolean;
}

export interface DiffResult {
	lines: Array<DiffLine>;
	added: number;
	removed: number;
	unchanged: number;
}

const normalize = (
	line: string,
	{ ignoreCase, ignoreWhitespace }: DiffOptions
): string => {
	let value = line;
	if (ignoreWhitespace) value = value.replace(/\s+/g, " ").trim();
	if (ignoreCase) value = value.toLowerCase();
	return value;
};

/**
 * 두 글의 가장 긴 공통 부분(LCS)을 찾아 줄 단위로 비교한다.
 * 표는 (왼쪽 줄 수 + 1) x (오른쪽 줄 수 + 1)이라 아주 긴 글에서는 메모리를 많이 쓴다.
 */
export const diffLines = (
	left: string,
	right: string,
	options: DiffOptions
): DiffResult => {
	const leftLines = left.split("\n");
	const rightLines = right.split("\n");
	const leftKeys = leftLines.map((line) => normalize(line, options));
	const rightKeys = rightLines.map((line) => normalize(line, options));

	const rows = leftLines.length;
	const columns = rightLines.length;

	// table[i][j] = leftLines[i..]와 rightLines[j..]의 공통 줄 수
	const table: Array<Int32Array> = Array.from(
		{ length: rows + 1 },
		() => new Int32Array(columns + 1)
	);

	for (let leftIndex = rows - 1; leftIndex >= 0; leftIndex--) {
		const current = table[leftIndex];
		const next = table[leftIndex + 1];
		if (!current || !next) continue;
		for (let rightIndex = columns - 1; rightIndex >= 0; rightIndex--) {
			current[rightIndex] =
				leftKeys[leftIndex] === rightKeys[rightIndex]
					? (next[rightIndex + 1] ?? 0) + 1
					: Math.max(next[rightIndex] ?? 0, current[rightIndex + 1] ?? 0);
		}
	}

	const lines: Array<DiffLine> = [];
	let added = 0;
	let removed = 0;
	let unchanged = 0;
	let leftIndex = 0;
	let rightIndex = 0;

	while (leftIndex < rows && rightIndex < columns) {
		if (leftKeys[leftIndex] === rightKeys[rightIndex]) {
			lines.push({
				type: "equal",
				text: leftLines[leftIndex] ?? "",
				leftNumber: leftIndex + 1,
				rightNumber: rightIndex + 1,
			});
			unchanged++;
			leftIndex++;
			rightIndex++;
		} else if (
			(table[leftIndex + 1]?.[rightIndex] ?? 0) >=
			(table[leftIndex]?.[rightIndex + 1] ?? 0)
		) {
			lines.push({
				type: "remove",
				text: leftLines[leftIndex] ?? "",
				leftNumber: leftIndex + 1,
				rightNumber: null,
			});
			removed++;
			leftIndex++;
		} else {
			lines.push({
				type: "add",
				text: rightLines[rightIndex] ?? "",
				leftNumber: null,
				rightNumber: rightIndex + 1,
			});
			added++;
			rightIndex++;
		}
	}

	while (leftIndex < rows) {
		lines.push({
			type: "remove",
			text: leftLines[leftIndex] ?? "",
			leftNumber: leftIndex + 1,
			rightNumber: null,
		});
		removed++;
		leftIndex++;
	}
	while (rightIndex < columns) {
		lines.push({
			type: "add",
			text: rightLines[rightIndex] ?? "",
			leftNumber: null,
			rightNumber: rightIndex + 1,
		});
		added++;
		rightIndex++;
	}

	return { lines, added, removed, unchanged };
};

/**
 * 바뀐 데가 거의 없을 때 같은 줄만 수백 개 보여줄 필요는 없다.
 * 변경 지점 앞뒤 `context`줄만 남기고 나머지는 접는다.
 */
export interface DiffChunk {
	skipped: number;
	lines: Array<DiffLine>;
}

export const collapseUnchanged = (
	lines: Array<DiffLine>,
	context: number
): Array<DiffChunk> => {
	const keep = new Set<number>();
	for (const [index, line] of lines.entries()) {
		if (line.type === "equal") continue;
		for (
			let around = Math.max(0, index - context);
			around <= Math.min(lines.length - 1, index + context);
			around++
		) {
			keep.add(around);
		}
	}

	// skipped는 그 청크의 줄들 "앞에" 접힌 줄 수를 뜻한다.
	const chunks: Array<DiffChunk> = [];
	let pending = 0;
	let current: Array<DiffLine> = [];

	for (const [index, line] of lines.entries()) {
		if (keep.has(index)) {
			current.push(line);
			continue;
		}
		if (current.length > 0) {
			chunks.push({ skipped: pending, lines: current });
			current = [];
			pending = 0;
		}
		pending++;
	}

	if (current.length > 0) {
		chunks.push({ skipped: pending, lines: current });
	} else if (pending > 0) {
		chunks.push({ skipped: pending, lines: [] });
	}

	return chunks;
};
