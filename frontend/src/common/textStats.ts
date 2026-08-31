export interface TextStats {
	words: number;
	characters: number;
	charactersNoSpaces: number;
	sentences: number;
	paragraphs: number;
	lines: number;
	readingSeconds: number;
	speakingSeconds: number;
	topWords: Array<{ word: string; count: number }>;
}

// 조용히 읽을 때와 소리 내어 말할 때의 흔한 평균치.
const READING_WORDS_PER_MINUTE = 200;
const SPEAKING_WORDS_PER_MINUTE = 130;

const TOP_WORD_COUNT = 10;

// 세는 데 방해가 되는 문장부호를 뗀다. 낱말 안의 하이픈과 아포스트로피는 남긴다.
const stripPunctuation = (word: string): string =>
	word.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, "").toLowerCase();

export const analyzeText = (text: string): TextStats => {
	const trimmed = text.trim();
	const words = trimmed === "" ? [] : trimmed.split(/\s+/);

	const sentences =
		trimmed === ""
			? 0
			: // 문장 부호 뒤에 오는 것만 문장 끝으로 본다. 마지막 문장에 부호가 없어도 하나로 센다.
				(trimmed.match(/[^.!?。！?…]+[.!?。！?…]+/gu)?.length ?? 0) +
				(/[.!?。！?…]\s*$/u.test(trimmed) ? 0 : 1);

	const paragraphs =
		trimmed === ""
			? 0
			: trimmed.split(/\n\s*\n/).filter((part) => part.trim() !== "").length;

	const frequency = new Map<string, number>();
	for (const raw of words) {
		const word = stripPunctuation(raw);
		if (word.length < 2) continue;
		frequency.set(word, (frequency.get(word) ?? 0) + 1);
	}

	const topWords = [...frequency.entries()]
		.sort(([firstWord, first], [secondWord, second]) =>
			second === first ? firstWord.localeCompare(secondWord) : second - first
		)
		.slice(0, TOP_WORD_COUNT)
		.map(([word, count]) => ({ word, count }));

	return {
		words: words.length,
		// 서로게이트 쌍(이모지 등)을 두 글자로 세지 않도록 코드 포인트로 나눈다.
		characters: [...text].length,
		charactersNoSpaces: [...text.replace(/\s/gu, "")].length,
		sentences,
		paragraphs,
		lines: text === "" ? 0 : text.split("\n").length,
		readingSeconds: Math.round((words.length / READING_WORDS_PER_MINUTE) * 60),
		speakingSeconds: Math.round(
			(words.length / SPEAKING_WORDS_PER_MINUTE) * 60
		),
		topWords,
	};
};

export const formatDuration = (seconds: number): string => {
	if (seconds < 60) return `${seconds}s`;
	const minutes = Math.floor(seconds / 60);
	const rest = seconds % 60;
	return rest === 0 ? `${minutes}m` : `${minutes}m ${rest}s`;
};
