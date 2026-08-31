import type { PageMeta } from "../types";

// 検索結果にそのまま出るタイトルと説明。
export const META_JA: Record<string, PageMeta> = {
	"/": {
		title: "Utility web - 無料のオンライン ファイル・画像・開発ツール",
		description:
			"ブラウザだけで使える無料ツール集。PDF の変換・結合・分割・圧縮・ページ整理、画像変換、QR コードと UUID の生成、JSON 整形、テキスト比較、ハッシュ計算、カラー変換まで。アップロードも登録も不要です。",
	},
	"/tools": {
		title: "すべてのツール - Utility web",
		description:
			"Utility web のツール一覧：PDF の変換・結合・分割・圧縮・ページ整理、画像変換、QR コード、UUID、Base64、ハッシュ、JSON と CSV の変換、テキスト比較、カラー変換、計算。すべてブラウザ内で動きます。",
	},
	"/pdf-to-pptx": {
		title: "PDF を PPT に変換 - 無料・アップロード不要 - Utility web",
		description:
			"複数の PDF を 1 つの PowerPoint（.pptx）にまとめます。1 ページが 1 枚のスライドになり、16:9・4:3・元のサイズから選べます。ファイルはブラウザの外に出ません。",
	},
	"/pptx-viewer": {
		title: "PPTX ビューア - PowerPoint をオンラインで開く - Utility web",
		description:
			".pptx ファイルをブラウザで開き、キーボードやボタンでスライドを送れます。PowerPoint のインストールも登録も不要で、ファイルは端末に残ります。",
	},
	"/pdf-to-images": {
		title: "PDF を JPG・PNG に変換 - 無料・アップロード不要 - Utility web",
		description:
			"PDF の全ページを PNG、JPG、WebP 画像にして ZIP でダウンロードします。ブラウザ内で描画し、ファイルはアップロードされません。",
	},
	"/merge-pdf": {
		title: "PDF を結合 - 無料・アップロード不要 - Utility web",
		description:
			"複数の PDF を好きな順番で 1 つの文書にまとめます。処理はブラウザ内で完結し、ファイルが端末の外に出ることはありません。",
	},
	"/split-pdf": {
		title: "PDF を分割・ページ抽出 - 無料・アップロード不要 - Utility web",
		description:
			"PDF から必要なページだけ抜き出したり、1 ページずつ別ファイルに分けたりできます。1-3, 7, 10- のような範囲指定に対応し、アップロードはありません。",
	},
	"/compress-pdf": {
		title: "PDF を圧縮 - オンライン無料でサイズ縮小 - Utility web",
		description:
			"メールやアップロードの上限に引っかかる PDF を小さくします。圧縮の強さは 3 段階、前後のサイズを比較でき、ファイルはブラウザの外に出ません。",
	},
	"/organize-pdf": {
		title: "PDF のページ整理 - 並べ替え・回転・削除 - Utility web",
		description:
			"PDF の全ページをサムネイルで確認し、並べ替え・回転・削除してから保存します。ブラウザ内で処理し、アップロードはありません。",
	},
	"/images-to-pdf": {
		title: "画像を PDF に変換 - JPG・PNG to PDF - Utility web",
		description:
			"JPG、PNG、WebP、GIF の画像を 1 つの PDF にまとめます。A4、Letter、画像に合わせたサイズから選べ、アップロードはありません。",
	},
	"/image-converter": {
		title: "画像変換・リサイズ - PNG、JPG、WebP - Utility web",
		description:
			"画像を PNG、JPG、WebP に変換し、サイズを調整し、容量を圧縮します。複数枚をまとめて、ブラウザ内でアップロードなしに処理します。",
	},
	"/qr-code": {
		title: "QR コード作成 - 無料・登録不要 - Utility web",
		description:
			"リンク、テキスト、Wi-Fi、メール、電話番号の QR コードを作り、PNG か SVG でダウンロードします。ブラウザ内で生成し、スキャンの追跡はありません。",
	},
	"/uuid-generator": {
		title: "UUID ジェネレーター - v4 と v7、一括生成 - Utility web",
		description:
			"ランダムな UUID v4、または時系列に並ぶ v7 を 1 個から数千個まで、好きな書式で生成します。ブラウザ内で作られます。",
	},
	"/base64": {
		title: "Base64 エンコード・デコード - テキストとファイル - Utility web",
		description:
			"テキストやファイルを base64 に変換し、元に戻します。URL セーフ形式にも対応し、処理はすべてブラウザ内で完結してアップロードはありません。",
	},
	"/hash-generator": {
		title: "SHA-256 ハッシュ生成 - ファイルのチェックサム確認 - Utility web",
		description:
			"テキストやファイルの SHA-1、SHA-256、SHA-384、SHA-512 を求め、公開されたチェックサムと照合します。アップロードなしで端末上で計算します。",
	},
	"/color-converter": {
		title: "カラー変換 - HEX、RGB、HSL、CMYK - Utility web",
		description:
			"色を HEX、RGB、HSL、HSV、CMYK に変換し、WCAG のコントラスト比を確認し、明度の段階を取り出します。ブラウザ内で動きます。",
	},
	"/json-formatter": {
		title: "JSON 整形・検証ツール - オンライン無料 - Utility web",
		description:
			"JSON を読みやすく整形し、1 行に圧縮し、エラーを見つけます。不正な位置を行と桁で示し、貼り付けた内容はアップロードされません。",
	},
	"/csv-to-json": {
		title: "CSV を JSON に変換 - 逆方向も - Utility web",
		description:
			"CSV や TSV ファイルを JSON に、JSON の配列を CSV に変換します。引用符で囲まれた項目や区切り文字の指定もそのまま扱い、アップロードはありません。",
	},
	"/text-diff": {
		title: "テキスト比較 - 2 つの文章の差分を探す - Utility web",
		description:
			"2 つの版を行ごとに比べ、何が増えて何が消え、どこが変わっていないかを正確に示します。貼り付けた文章はアップロードされません。",
	},
	"/word-counter": {
		title: "文字数カウント - 語数・文字数・読む時間 - Utility web",
		description:
			"語数、空白ありなしの文字数、文の数、段落数を数え、読むのにかかる時間とよく使った語を示します。書いた内容はアップロードされません。",
	},
	"/unit-converter": {
		title: "単位変換 - 長さ・重さ・温度 - Utility web",
		description:
			"長さ、重さ、温度、面積、体積、速さ、データ、時間をメートル法とヤード・ポンド法のあいだで変換します。無料で即時、ブラウザ内で動きます。",
	},
	"/password-generator": {
		title: "強力なパスワード生成 - 無料・保存なし - Utility web",
		description:
			"好きな長さと文字種でランダムなパスワードを作ります。ブラウザの暗号用乱数が生成し、どこにも送信されません。",
	},
	"/date-calculator": {
		title: "日付計算 - 2 つの日付の日数 - Utility web",
		description:
			"2 つの日付のあいだの日数・週数・営業日を数え、ある日付から一定期間離れた日を求めます。月の長さとうるう年を正しく扱います。",
	},
	"/timestamp-converter": {
		title: "Unix タイムスタンプ変換 - epoch を日付に - Utility web",
		description:
			"Unix タイムスタンプを読める日付に、日付をタイムスタンプに戻します。秒とミリ秒を自動で判別し、ISO・UTC・現地時刻を並べて示します。",
	},
	"/regex-tester": {
		title: "正規表現テスター - 正規表現の確認とデバッグ - Utility web",
		description:
			"正規表現を文章に当てて一致箇所を色分けし、取り出したグループを並べ、置換結果を先に確かめます。貼り付けた内容はアップロードされません。",
	},
	"/jwt-decoder": {
		title: "JWT デコーダー - トークンの確認と検証 - Utility web",
		description:
			"JSON Web Token のヘッダー、クレーム、失効時刻を確認し、HS256 署名を秘密鍵で検証します。トークンはブラウザ内にとどまります。",
	},
	"/calculator/gcd": {
		title: "最大公約数の計算 - Utility web",
		description:
			"2 つ以上の数の最大公約数を求め、それらの数が共通して持つ約数を一つずつ示しながら計算します。",
	},
	"/calculator/lcm": {
		title: "最小公倍数の計算 - Utility web",
		description:
			"2 つ以上の数の最小公倍数を求め、その答えに至るまでの計算過程と検算をあわせて示します。",
	},
};
