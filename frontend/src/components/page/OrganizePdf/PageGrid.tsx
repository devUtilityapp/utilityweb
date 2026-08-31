import { useTranslation } from "react-i18next";
import type { FunctionComponent } from "../../../common/types";
import type { PageItem } from "../../../common/pdfOrganize";

const IconButton = ({
	label,
	disabled = false,
	children,
	onClick,
}: {
	label: string;
	disabled?: boolean;
	children: React.ReactNode;
	onClick: () => void;
}): FunctionComponent => (
	<button
		aria-label={label}
		disabled={disabled}
		title={label}
		type="button"
		className={`w-8 h-8 flex items-center justify-center rounded-lg border border-neutral-15 text-neutral-05 text-sm
			${disabled ? "opacity-30 cursor-not-allowed" : "hover:bg-main-05"}`}
		onClick={onClick}
	>
		{children}
	</button>
);

/** 페이지 썸네일 격자. 순서 바꾸기·회전·삭제를 눈으로 보면서 한다. */
export const PageGrid = ({
	pages,
	disabled = false,
	onMove,
	onRotate,
	onRemove,
}: {
	pages: Array<PageItem>;
	disabled?: boolean;
	onMove: (fromIndex: number, toIndex: number) => void;
	onRotate: (id: string) => void;
	onRemove: (id: string) => void;
}): FunctionComponent => {
	const { t } = useTranslation();

	return (
		<ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
			{pages.map((page, position) => (
				<li
					key={page.id}
					className="flex flex-col gap-3 border border-neutral-05 rounded-xl p-3 bg-main-00"
				>
					<div className="w-full aspect-[3/4] flex items-center justify-center overflow-hidden bg-neutral-00 rounded-lg">
						<img
							alt={`Page ${page.index + 1}`}
							className="max-w-full max-h-full object-contain transition-transform duration-200"
							src={page.thumbnail}
							style={{ transform: `rotate(${page.rotation}deg)` }}
						/>
					</div>

					<div className="flex items-center justify-between">
						<div className="text-neutral-15 text-sm">
							{position + 1}
							{page.index + 1 === position + 1
								? ""
								: ` ${t("organizePdf.wasAt", { number: page.index + 1 })}`}
						</div>
						<div className="flex items-center gap-1">
							<IconButton
								disabled={disabled || position === 0}
								label={t("organizePdf.moveEarlier")}
								onClick={() => {
									onMove(position, position - 1);
								}}
							>
								◀
							</IconButton>
							<IconButton
								disabled={disabled || position === pages.length - 1}
								label={t("organizePdf.moveLater")}
								onClick={() => {
									onMove(position, position + 1);
								}}
							>
								▶
							</IconButton>
							<IconButton
								disabled={disabled}
								label={t("organizePdf.rotate")}
								onClick={() => {
									onRotate(page.id);
								}}
							>
								⟳
							</IconButton>
							<IconButton
								disabled={disabled}
								label={t("organizePdf.delete")}
								onClick={() => {
									onRemove(page.id);
								}}
							>
								✕
							</IconButton>
						</div>
					</div>
				</li>
			))}
		</ul>
	);
};
