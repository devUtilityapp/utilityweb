import { useMemo, useState } from "react";
import type { FunctionComponent } from "../../common/types";
import { analyzeText, formatDuration } from "../../common/textStats";
import { findPageSeo } from "../../common/seo";
import { Content } from "../../components/ui/Content";
import { PageGuideSection } from "../../components/ui/PageGuideSection";

const StatCard = ({
	label,
	value,
}: {
	label: string;
	value: string;
}): FunctionComponent => (
	<div className="flex flex-col gap-1 border border-neutral-05 rounded-xl px-4 py-3 bg-main-00">
		<div className="text-neutral-05 text-2xl font-medium">{value}</div>
		<div className="text-neutral-15 text-sm">{label}</div>
	</div>
);

export const WordCounter = (): FunctionComponent => {
	const [text, setText] = useState<string>("");
	// 키를 누를 때마다 다시 세므로 계산 결과를 재사용한다.
	const stats = useMemo(() => analyzeText(text), [text]);
	const guide = findPageSeo("/word-counter").guide;

	const maxCount = stats.topWords[0]?.count ?? 1;

	return (
		<Content categoryName="Text" title="WORD COUNTER">
			<p className="text-neutral-15 text-sm lg:text-md">
				Count words, characters, sentences and paragraphs as you type, with
				reading time and the words you lean on most. Nothing you write is
				uploaded.
			</p>

			<textarea
				id="word-counter-input"
				placeholder="Type or paste your text here"
				value={text}
				className="w-full h-[320px] bg-main-00 border border-neutral-05 rounded-xl p-4
					text-neutral-05 outline-none resize-y leading-relaxed"
				onChange={(event) => {
					setText(event.target.value);
				}}
			/>

			<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
				<StatCard label="Words" value={stats.words.toLocaleString()} />
				<StatCard
					label="Characters"
					value={stats.characters.toLocaleString()}
				/>
				<StatCard
					label="Characters without spaces"
					value={stats.charactersNoSpaces.toLocaleString()}
				/>
				<StatCard label="Sentences" value={stats.sentences.toLocaleString()} />
				<StatCard
					label="Paragraphs"
					value={stats.paragraphs.toLocaleString()}
				/>
				<StatCard label="Lines" value={stats.lines.toLocaleString()} />
				<StatCard
					label="Reading time"
					value={formatDuration(stats.readingSeconds)}
				/>
				<StatCard
					label="Speaking time"
					value={formatDuration(stats.speakingSeconds)}
				/>
			</div>

			{stats.topWords.length > 0 && (
				<div className="flex flex-col gap-4">
					<div className="text-neutral-05 font-medium text-xl lg:text-2xl">
						Most used words
					</div>
					<ul className="flex flex-col gap-2">
						{stats.topWords.map((entry) => (
							<li key={entry.word} className="flex items-center gap-4">
								<div className="text-neutral-05 w-40 truncate">
									{entry.word}
								</div>
								<div className="flex-1 h-2 bg-main-05 rounded-full overflow-hidden">
									<div
										className="h-full bg-green-05"
										style={{ width: `${(entry.count / maxCount) * 100}%` }}
									></div>
								</div>
								<div className="text-neutral-15 text-sm w-10 text-right">
									{entry.count}
								</div>
							</li>
						))}
					</ul>
				</div>
			)}

			{guide && <PageGuideSection guide={guide} />}
		</Content>
	);
};
