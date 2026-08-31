export interface FaqEntry {
	question: string;
	answer: string;
}

export interface PageMeta {
	/** 검색 결과와 탭에 나오는 제목 */
	title: string;
	/** 검색 결과의 설명 */
	description: string;
}

export interface PageGuide {
	/** 자바스크립트 실행 전 정적 HTML에 쓰는 제목 */
	heading: string;
	/** 페이지가 무엇을 하는지 한 단락 */
	lead: string;
	stepsTitle: string;
	steps: Array<string>;
	faqTitle: string;
	faq: Array<FaqEntry>;
}

export interface PageSeo extends PageMeta {
	path: string;
	priority: string;
	guide?: PageGuide;
}
