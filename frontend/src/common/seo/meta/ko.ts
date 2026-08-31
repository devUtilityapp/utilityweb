import type { PageMeta } from "../types";

// 검색 결과에 그대로 나오는 제목과 설명.
export const META_KO: Record<string, PageMeta> = {
	"/": {
		title: "Utility web - 무료 온라인 파일·이미지·개발 도구",
		description:
			"브라우저에서 바로 쓰는 무료 도구 모음. PDF 변환·합치기·나누기·압축·페이지 정리, 이미지 변환, QR 코드와 UUID 생성, JSON 정리, 텍스트 비교, 해시 계산, 색상 변환까지. 업로드도 회원가입도 없습니다.",
	},
	"/tools": {
		title: "전체 도구 - Utility web",
		description:
			"Utility web의 모든 도구: PDF 변환·합치기·나누기·압축·페이지 정리, 이미지 변환, QR 코드, UUID, Base64, 해시, JSON과 CSV 변환, 텍스트 비교, 색상 변환, 계산기. 모두 브라우저 안에서 돌아갑니다.",
	},
	"/pdf-to-pptx": {
		title: "PDF를 PPT로 변환 - 무료, 업로드 없음 - Utility web",
		description:
			"PDF 여러 개를 파워포인트(.pptx) 한 개로 바꿉니다. 쪽마다 슬라이드가 되고 16:9, 4:3, 원본 크기 중에 고를 수 있습니다. 파일은 브라우저 밖으로 나가지 않습니다.",
	},
	"/pptx-viewer": {
		title: "PPTX 뷰어 - 파워포인트 온라인으로 열기 - Utility web",
		description:
			".pptx 파일을 브라우저에서 열고 키보드나 버튼으로 슬라이드를 넘겨 봅니다. 파워포인트 설치도 회원가입도 필요 없고 파일은 기기에 남습니다.",
	},
	"/pdf-to-images": {
		title: "PDF를 JPG·PNG로 변환 - 무료, 업로드 없음 - Utility web",
		description:
			"PDF의 모든 쪽을 PNG, JPG, WebP 이미지로 바꿔 ZIP으로 내려받습니다. 브라우저에서 그려 내며 파일은 업로드되지 않습니다.",
	},
	"/merge-pdf": {
		title: "PDF 합치기 - 무료, 업로드 없음 - Utility web",
		description:
			"여러 PDF를 원하는 순서로 한 문서에 합칩니다. 브라우저 안에서 처리하므로 파일이 기기 밖으로 나가지 않습니다.",
	},
	"/split-pdf": {
		title: "PDF 나누기·페이지 추출 - 무료, 업로드 없음 - Utility web",
		description:
			"PDF에서 필요한 쪽만 뽑아내거나 쪽마다 한 파일로 쪼갭니다. 1-3, 7, 10- 같은 범위 표기를 쓸 수 있고 업로드는 없습니다.",
	},
	"/compress-pdf": {
		title: "PDF 용량 줄이기 - 온라인 무료 압축 - Utility web",
		description:
			"메일이나 업로드 제한에 걸리는 PDF를 줄입니다. 압축 강도 세 가지, 전후 용량 비교, 그리고 파일은 브라우저 밖으로 나가지 않습니다.",
	},
	"/organize-pdf": {
		title: "PDF 페이지 정리 - 순서 변경·회전·삭제 - Utility web",
		description:
			"PDF의 모든 쪽을 미리보기로 보고 순서를 바꾸거나 돌리거나 지운 뒤 저장합니다. 브라우저에서 처리하며 업로드는 없습니다.",
	},
	"/images-to-pdf": {
		title: "이미지를 PDF로 변환 - JPG·PNG to PDF - Utility web",
		description:
			"JPG, PNG, WebP, GIF 이미지를 PDF 한 개로 묶습니다. A4, Letter, 이미지 크기에 맞춤 중에 고를 수 있고 업로드는 없습니다.",
	},
	"/image-converter": {
		title: "이미지 변환·리사이즈 - PNG, JPG, WebP - Utility web",
		description:
			"이미지를 PNG, JPG, WebP로 바꾸고 크기를 조절하고 용량을 압축합니다. 여러 장을 한 번에, 브라우저 안에서 업로드 없이 처리합니다.",
	},
	"/qr-code": {
		title: "QR 코드 만들기 - 무료, 회원가입 없음 - Utility web",
		description:
			"링크, 텍스트, 와이파이, 이메일, 전화번호를 QR 코드로 만들고 PNG나 SVG로 내려받습니다. 브라우저에서 만들며 스캔 추적이 없습니다.",
	},
	"/uuid-generator": {
		title: "UUID 생성기 - v4와 v7, 대량 생성 - Utility web",
		description:
			"무작위 UUID v4 또는 시간순으로 정렬되는 v7을 하나부터 수천 개까지 원하는 형식으로 만듭니다. 브라우저에서 생성합니다.",
	},
	"/base64": {
		title: "Base64 인코딩·디코딩 - 텍스트와 파일 - Utility web",
		description:
			"텍스트나 파일을 base64로 바꾸고 다시 되돌립니다. URL 안전 형식도 지원하며, 모든 처리는 브라우저 안에서 끝나 업로드가 없습니다.",
	},
	"/hash-generator": {
		title: "SHA-256 해시 생성기 - 파일 체크섬 확인 - Utility web",
		description:
			"텍스트나 파일의 SHA-1, SHA-256, SHA-384, SHA-512를 구하고 공개된 체크섬과 비교합니다. 업로드 없이 기기에서 계산합니다.",
	},
	"/color-converter": {
		title: "색상 변환기 - HEX, RGB, HSL, CMYK - Utility web",
		description:
			"색을 HEX, RGB, HSL, HSV, CMYK로 변환하고 WCAG 대비율을 확인하고 밝기 단계를 뽑아냅니다. 브라우저에서 바로 돌아갑니다.",
	},
	"/json-formatter": {
		title: "JSON 포맷터·검사기 - 온라인 무료 - Utility web",
		description:
			"JSON을 보기 좋게 펼치고 한 줄로 줄이고 오류를 잡아냅니다. 잘못된 위치를 줄과 칸으로 알려 주며, 붙여 넣은 내용은 업로드되지 않습니다.",
	},
	"/csv-to-json": {
		title: "CSV를 JSON으로 변환 - 반대 방향도 - Utility web",
		description:
			"CSV나 TSV 파일을 JSON으로, JSON 배열을 CSV로 바꿉니다. 따옴표로 묶인 칸과 구분자 설정을 그대로 처리하고 업로드는 없습니다.",
	},
	"/text-diff": {
		title: "텍스트 비교 - 두 글의 다른 부분 찾기 - Utility web",
		description:
			"두 판본을 줄 단위로 견줘 무엇이 늘고 빠지고 그대로인지 정확히 보여 줍니다. 붙여 넣은 글은 업로드되지 않습니다.",
	},
	"/word-counter": {
		title: "글자 수 세기 - 낱말·글자·읽는 시간 - Utility web",
		description:
			"낱말, 공백 포함·제외 글자 수, 문장, 문단을 세고 읽는 시간과 자주 쓴 낱말을 보여 줍니다. 적은 글은 업로드되지 않습니다.",
	},
	"/calculator/gcd": {
		title: "최대공약수 계산기 - Utility web",
		description:
			"두 개 이상의 수의 최대공약수를 구하고, 그 수들이 함께 가지는 약수를 하나씩 짚어 가며 보여 줍니다.",
	},
	"/calculator/lcm": {
		title: "최소공배수 계산기 - Utility web",
		description:
			"두 개 이상의 수의 최소공배수를 구하고, 그 답이 나오기까지의 계산 과정과 검산을 함께 보여 줍니다.",
	},
};
