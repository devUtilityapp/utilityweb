import type { FunctionComponent } from "../../common/types";

export const ProgressBar = ({
	done,
	total,
	unit,
}: {
	done: number;
	total: number;
	unit: string;
}): FunctionComponent => {
	if (total <= 0) return null;
	const percent = Math.round((done / total) * 100);

	return (
		<div className="flex flex-col gap-2">
			<div className="w-full h-3 bg-main-05 rounded-full overflow-hidden">
				<div
					className="h-full bg-green-05 transition-all duration-200"
					style={{ width: `${percent}%` }}
				></div>
			</div>
			<div className="text-neutral-15 text-sm text-right">
				{done} / {total} {unit} ({percent}%)
			</div>
		</div>
	);
};
