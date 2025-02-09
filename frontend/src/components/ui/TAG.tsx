import type { FunctionComponent } from "../../common/types";

export const TAG = ({
	tag,
	textColorClass,
	textSizeClass,
	backgroundColorClass,
	onClick,
}: {
	tag: string;
	textColorClass: string;
	textSizeClass: string;
	backgroundColorClass: string;
	onClick?: () => void;
}): FunctionComponent => {
	return (
		<div
			className={`${textColorClass} ${backgroundColorClass} cursor-pointer px-3 py-1 rounded ${textSizeClass}`}
			onClick={onClick}
		>
			{tag}
		</div>
	);
};
