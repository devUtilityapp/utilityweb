import type { FunctionComponent } from "../../common/types";
import { copyToClipboard } from "../../common/clipboard";

/** 이름 + 값 + 복사 버튼 한 줄. 변환 결과를 늘어놓을 때 쓴다. */
export const CopyField = ({
	label,
	value,
	mono = true,
}: {
	label: string;
	value: string;
	mono?: boolean;
}): FunctionComponent => (
	<div className="flex items-center gap-4 border border-neutral-05 rounded-xl px-4 py-3 bg-main-00">
		<div className="text-neutral-15 text-sm w-24 shrink-0">{label}</div>
		<div
			className={`text-neutral-05 flex-1 min-w-0 break-all ${mono ? "font-mono text-sm" : ""}`}
		>
			{value}
		</div>
		<button
			disabled={value === ""}
			type="button"
			className={`text-sm underline shrink-0 ${
				value === ""
					? "text-neutral-50 cursor-not-allowed"
					: "text-neutral-15 hover:text-neutral-05"
			}`}
			onClick={() => {
				copyToClipboard(value);
			}}
		>
			Copy
		</button>
	</div>
);
