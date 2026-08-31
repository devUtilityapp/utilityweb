import type { FunctionComponent } from "../../common/types";
import type { PageGuide } from "../../common/seo";

/**
 * 도구 아래에 붙는 설명 영역.
 * 구조화 데이터와 같은 데이터(common/seo.ts)를 그리므로 둘이 어긋나지 않는다.
 */
export const PageGuideSection = ({
	guide,
}: {
	guide: PageGuide;
}): FunctionComponent => {
	return (
		<section className="flex flex-col gap-10 border-t border-neutral-50 pt-10 mt-4">
			<p className="text-neutral-10 leading-relaxed">{guide.lead}</p>

			<div className="flex flex-col gap-4">
				<h2 className="text-neutral-05 font-medium text-xl lg:text-2xl">
					{guide.stepsTitle}
				</h2>
				<ol className="flex flex-col gap-3 list-decimal pl-5">
					{guide.steps.map((step) => (
						<li key={step} className="text-neutral-10 leading-relaxed pl-1">
							{step}
						</li>
					))}
				</ol>
			</div>

			<div className="flex flex-col gap-4">
				<h2 className="text-neutral-05 font-medium text-xl lg:text-2xl">
					{guide.faqTitle}
				</h2>
				<dl className="flex flex-col gap-6">
					{guide.faq.map((entry) => (
						<div key={entry.question} className="flex flex-col gap-2">
							<dt>
								<h3 className="text-neutral-05 font-medium">
									{entry.question}
								</h3>
							</dt>
							<dd className="text-neutral-10 leading-relaxed">
								{entry.answer}
							</dd>
						</div>
					))}
				</dl>
			</div>
		</section>
	);
};
