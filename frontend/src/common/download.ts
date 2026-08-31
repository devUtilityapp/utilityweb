/** 브라우저에서 만든 데이터를 파일로 저장한다. 서버를 거치지 않는다. */
export const downloadBlob = (blob: Blob, fileName: string): void => {
	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = url;
	link.download = fileName;
	document.body.append(link);
	link.click();
	link.remove();
	URL.revokeObjectURL(url);
};

/** 확장자가 없거나 다르면 붙여준다. `name`이 비면 `fallback`을 쓴다. */
export const withExtension = (
	name: string,
	extension: string,
	fallback: string
): string => {
	const trimmed = name.trim() || fallback;
	return trimmed.toLowerCase().endsWith(`.${extension}`)
		? trimmed
		: `${trimmed}.${extension}`;
};

/** 파일명에서 확장자를 뗀다. 여러 파일을 묶을 때 기본 이름으로 쓴다. */
export const stripExtension = (name: string): string =>
	name.replace(/\.[^./\\]+$/, "");

/** 바이트 수를 사람이 읽는 단위로 바꾼다. */
export const formatBytes = (bytes: number): string => {
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
	return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};
