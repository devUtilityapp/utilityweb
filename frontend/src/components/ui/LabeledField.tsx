import type { FunctionComponent } from "../../common/types";

/** 라벨 + 입력칸 한 벌. 도구 페이지의 설정 줄에서 쓴다. */
export const LabeledField = ({
	label,
	children,
	grow = false,
}: {
	label: string;
	children: React.ReactNode;
	grow?: boolean;
}): FunctionComponent => (
	<div className={`flex flex-col gap-2 ${grow ? "flex-1 min-w-[200px]" : ""}`}>
		<div className="text-neutral-15 text-sm">{label}</div>
		{children}
	</div>
);

/** 확장자가 고정된 파일 이름 입력칸. */
export const FileNameInput = ({
	id,
	value,
	extension,
	placeholder,
	onChange,
}: {
	id: string;
	value: string;
	extension: string;
	placeholder: string;
	onChange: (value: string) => void;
}): FunctionComponent => (
	<div className="flex items-center h-12 border border-neutral-05 rounded-xl px-3">
		<input
			className="w-full bg-transparent text-neutral-05 outline-none font-medium"
			id={id}
			placeholder={placeholder}
			type="text"
			value={value}
			onChange={(event) => {
				onChange(event.target.value);
			}}
		/>
		<div className="text-neutral-15">.{extension}</div>
	</div>
);
