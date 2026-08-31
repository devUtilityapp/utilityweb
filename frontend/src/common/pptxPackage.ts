import JSZip from "jszip";

// pptxgenjs는 슬라이드마다 slideMasterN.xml Override를 [Content_Types].xml에
// 적어두지만 실제 파일은 slideMaster1.xml 하나만 넣는다. PowerPoint는 넘어가지만
// 규격대로 파트를 훑는 파서는 없는 파일을 열다가 통째로 실패한다.
const OVERRIDE_PATTERN = /<Override\s+PartName="([^"]+)"[^>]*\/>/g;

export const removeDanglingOverrides = async (
	data: ArrayBuffer
): Promise<ArrayBuffer> => {
	const zip = await JSZip.loadAsync(data);
	const contentTypes = zip.file("[Content_Types].xml");
	if (!contentTypes) return data;

	const xml = await contentTypes.async("string");
	let changed = false;

	const cleaned = xml.replace(OVERRIDE_PATTERN, (match, partName: string) => {
		const path = partName.replace(/^\//, "");
		if (zip.file(path)) return match;
		changed = true;
		return "";
	});

	if (!changed) return data;

	zip.file("[Content_Types].xml", cleaned);
	return zip.generateAsync({
		type: "arraybuffer",
		compression: "DEFLATE",
	});
};
