import { useState } from "react";
import uuid from "react-uuid";
import type { OrderedFile } from "../components/ui/OrderedFileList";

/** 한 번에 추가된 파일은 이름 오름차순으로 둔다. 숫자는 숫자 크기로 비교한다. */
const sortByName = (files: Array<File>): Array<File> =>
	[...files].sort((first, second) =>
		first.name.localeCompare(second.name, undefined, {
			numeric: true,
			sensitivity: "base",
		})
	);

export interface OrderedFilesApi {
	items: Array<OrderedFile>;
	add: (files: Array<File>) => Array<OrderedFile>;
	remove: (id: string) => void;
	reorder: (fromIndex: number, toIndex: number) => void;
	clear: () => void;
	setDetail: (id: string, detail: string | null) => void;
}

/**
 * 순서를 바꿀 수 있는 파일 목록의 상태.
 * 여러 파일을 받아 순서대로 처리하는 도구들이 함께 쓴다.
 */
export const useOrderedFiles = (): OrderedFilesApi => {
	const [items, setItems] = useState<Array<OrderedFile>>([]);

	const add = (files: Array<File>): Array<OrderedFile> => {
		const added = sortByName(files).map((file) => ({ id: uuid(), file }));
		setItems((previous) => [...previous, ...added]);
		return added;
	};

	const remove = (id: string): void => {
		setItems((previous) => previous.filter((item) => item.id !== id));
	};

	const reorder = (fromIndex: number, toIndex: number): void => {
		setItems((previous) => {
			if (
				fromIndex === toIndex ||
				fromIndex < 0 ||
				toIndex < 0 ||
				fromIndex >= previous.length ||
				toIndex >= previous.length
			) {
				return previous;
			}
			const next = [...previous];
			const [moved] = next.splice(fromIndex, 1);
			if (!moved) return previous;
			next.splice(toIndex, 0, moved);
			return next;
		});
	};

	const clear = (): void => {
		setItems([]);
	};

	const setDetail = (id: string, detail: string | null): void => {
		setItems((previous) =>
			previous.map((item) => (item.id === id ? { ...item, detail } : item))
		);
	};

	return { items, add, remove, reorder, clear, setDetail };
};
