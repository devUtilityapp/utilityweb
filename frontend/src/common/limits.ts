/**
 * 도구는 파일을 통째로 메모리에 올려 처리한다.
 * 기기가 감당할 수 없는 크기는 탭이 얼어붙은 뒤에야 알게 되므로, 그 전에 막는다.
 * 넉넉하게 잡았다. 보통의 스캔본이나 사진 묶음은 여기에 걸리지 않는다.
 */
export const MAX_FILE_BYTES = 300 * 1024 * 1024;

export const isWithinSizeLimit = (file: File): boolean =>
	file.size <= MAX_FILE_BYTES;

/** 사람이 읽는 상한 표기. 안내 문구에 넣는다. */
export const MAX_FILE_LABEL = `${MAX_FILE_BYTES / 1024 / 1024} MB`;
