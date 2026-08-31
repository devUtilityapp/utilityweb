import type { FunctionComponent } from "../../common/types";

/** 도구 페이지 아래쪽의 실행 버튼. 여러 도구가 같은 모양을 쓴다. */
export const ToolButton = ({
	label,
	loadingLabel,
	loading = false,
	disabled = false,
}: {
	label: string;
	loadingLabel: string;
	loading?: boolean;
	disabled?: boolean;
}): FunctionComponent => {
	const inactive = loading || disabled;

	return (
		<button
			disabled={inactive}
			type="submit"
			className={`w-full lg:w-1/3 self-end min-w-[150px] border-2 border-neutral-05 flex justify-center items-center
				text-neutral-05 h-16 lg:h-20 lg:rounded-2xl rounded-xl lg:text-2xl text-xl
				${inactive ? "bg-neutral-50 cursor-not-allowed" : "bg-main-05 hover:bg-main-10"}`}
		>
			{loading ? loadingLabel : label}
		</button>
	);
};
