import { useTranslation } from "react-i18next";
import type { FunctionComponent } from "../../../common/types";
import { OrderedFileList } from "../../ui/OrderedFileList";

export interface PdfItem {
	id: string;
	file: File;
	pageCount: number | null;
}

export const PdfFileList = ({
	items,
	disabled = false,
	onReorder,
	onRemove,
	onClear,
}: {
	items: Array<PdfItem>;
	disabled?: boolean;
	onReorder: (fromIndex: number, toIndex: number) => void;
	onRemove: (id: string) => void;
	onClear: () => void;
}): FunctionComponent => {
	const { t } = useTranslation();
	const totalPages = items.reduce(
		(total, item) => total + (item.pageCount ?? 0),
		0
	);

	return (
		<OrderedFileList
			disabled={disabled}
			hint={t("pdfToPptx.dragOrder")}
			summary={t("pdfToPptx.slides", { count: totalPages })}
			items={items.map((item) => ({
				id: item.id,
				file: item.file,
				detail:
					item.pageCount === null
						? null
						: t("common.pages", { count: item.pageCount }),
			}))}
			onClear={onClear}
			onRemove={onRemove}
			onReorder={onReorder}
		/>
	);
};
