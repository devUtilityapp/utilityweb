import type { FunctionComponent } from "../../common/types";

/** 폼 제출이 아닌 즉시 실행 버튼. 여러 도구가 같은 모양을 쓴다. */
export const ActionButton = ({
	label,
	disabled = false,
	onClick,
}: {
	label: string;
	disabled?: boolean;
	onClick: () => void;
}): FunctionComponent => (
	<button
		disabled={disabled}
		type="button"
		className={`h-12 px-6 rounded-xl border-2 border-neutral-05 text-neutral-05 font-medium
			${disabled ? "bg-neutral-50 cursor-not-allowed" : "bg-main-05 hover:bg-main-10"}`}
		onClick={onClick}
	>
		{label}
	</button>
);
