import type { PageGuide } from "../types";

// 페이지 본문에 그대로 노출되는 설명. 구조화 데이터도 같은 출처를 쓴다.
export const GUIDES_EN: Record<string, PageGuide> = {
	"/pdf-to-pptx": {
		heading: "PDF to PPTX converter",
		lead: "This converter turns each page of a PDF into a slide of a PowerPoint file, so a document you were handed as a PDF can be presented, annotated or edited around in PowerPoint, Keynote or Google Slides. Several PDFs can be merged into one deck in the order you choose. The conversion runs entirely in your browser: the files are read from your device, rendered locally, and the .pptx is assembled in the page. Nothing is uploaded to a server, so there is no queue, no size limit imposed by an upload, and no copy of your document sitting in someone else's storage.",
		stepsTitle: "How to convert a PDF to PPTX",
		steps: [
			"Drop your PDF files onto the box above, or click it to pick them from your device. You can add several files at once — they are sorted by name, and you can drag the handle on each row to reorder them.",
			'Choose the slide size. 16:9 suits most screens, 4:3 matches older projectors, and "Fit to PDF size" keeps the proportions of the original document so nothing is letterboxed.',
			"Pick a render quality. High produces sharper slides and a larger file, Low keeps the file small, and Medium sits between the two.",
			"Name the output file and press Convert to PPTX. The progress bar counts pages as they are rendered, and the .pptx downloads when the last page is done.",
		],
		faqTitle: "Questions about PDF to PPTX conversion",
		faq: [
			{
				question: "Are my files uploaded anywhere?",
				answer:
					"No. The PDF is read with your browser's file API, each page is rendered on a canvas in the page, and the PowerPoint file is built in memory before it is saved to your device. No part of the document is sent over the network.",
			},
			{
				question: "Will the text in the slides be editable in PowerPoint?",
				answer:
					"No. Each page becomes a full-bleed image on its slide, which is what keeps the layout, fonts and vector graphics looking exactly like the original PDF. If you need editable text boxes, a converter that re-flows the document is a better fit, at the cost of layout accuracy.",
			},
			{
				question: "Can I merge several PDFs into one presentation?",
				answer:
					"Yes. Add as many PDFs as you like; every page of every file becomes a slide, following the order shown in the file list. Drag a row by its handle, or use the up and down buttons, to change that order before converting.",
			},
			{
				question: "Is there a page or file size limit?",
				answer:
					"There is no limit imposed by us, because nothing is uploaded. The practical ceiling is your device's memory: a very long document at High quality holds many rendered page images at once, so choose Medium or Low quality for large files.",
			},
			{
				question: "Which slide size should I pick?",
				answer:
					'Choose 16:9 for modern screens and video calls, 4:3 for older projectors and printed handouts, and "Fit to PDF size" when the PDF is an unusual shape — A4 portrait, a poster, a scanned form — and you want the slide to match it rather than adding empty margins.',
			},
			{
				question: "Do the converted files open in Keynote and Google Slides?",
				answer:
					"Yes. The output is a standard .pptx package, and because every slide is a single image it renders the same way in PowerPoint, Keynote, Google Slides and LibreOffice Impress.",
			},
		],
	},
	"/pptx-viewer": {
		heading: "PPTX viewer",
		lead: "This viewer opens a PowerPoint file in your browser so you can read it without installing Office, signing into a cloud account, or converting the deck to something else first. It is meant for the moment you are handed a .pptx and only need to look at it: an attachment on a borrowed laptop, a deck on a machine where you cannot install software, or a file you would rather not upload to a stranger's server. The file is read on your device and rendered in the page — it is never sent anywhere.",
		stepsTitle: "How to open a PPTX file online",
		steps: [
			"Drop the .pptx file onto the box above, or click it to choose one from your device.",
			"Wait a moment while the slides are prepared. Larger decks with many images take longer, since everything is rendered locally.",
			"Move through the deck with the Prev and Next buttons, the left and right arrow keys, or by typing a slide number into the field between them.",
			'Press Fullscreen to fill the screen for reading or presenting, and use "Open another file" when you want to load a different deck.',
		],
		faqTitle: "Questions about the PPTX viewer",
		faq: [
			{
				question: "Is my presentation uploaded to a server?",
				answer:
					"No. The file is opened with your browser's file API and rendered in the page. It stays on your device, which also means the viewer works with no network connection once the page has loaded.",
			},
			{
				question: "Does it look exactly like PowerPoint?",
				answer:
					"Close, but not identical. Text, images, basic shapes and tables render well. Charts, SmartArt, animations, slide transitions and fonts that are not installed on your device can differ from what PowerPoint shows. For a pixel-exact review, open the file in PowerPoint itself.",
			},
			{
				question: "Can I open .ppt files from older versions?",
				answer:
					"No. The legacy binary .ppt format is not supported — only the .pptx package used by PowerPoint 2007 and later. Opening the old file in PowerPoint or Google Slides once and saving it as .pptx is enough to make it readable here.",
			},
			{
				question: "Can I edit the slides here?",
				answer:
					"No, this is a viewer. It renders the deck for reading and presenting; it does not change the file. Nothing you do in the page is written back to your document.",
			},
			{
				question: "Why do some decks render better than others?",
				answer:
					"Presentations built from images — for example a deck produced by our PDF to PPTX converter — render exactly, because each slide is a single picture. Decks that rely on charts, embedded objects or unusual fonts depend on how faithfully those features can be redrawn in a browser.",
			},
		],
	},
	"/pdf-to-images": {
		heading: "PDF to images converter",
		lead: "This converter renders each page of a PDF as a picture, so a document can be pasted into a chat, dropped into a slide, posted somewhere that refuses PDFs, or edited in an image editor. You choose the format — PNG for crisp text and screenshots, JPG for small files, WebP for the smallest files at the same quality — and the resolution. Everything runs in your browser: the PDF is read from your device, drawn on a canvas in the page, and the images are packed into a ZIP locally. Nothing is sent to a server, so there is no queue and no copy of your document left behind.",
		stepsTitle: "How to convert a PDF to images",
		steps: [
			"Drop your PDF onto the box above, or click it to pick a file from your device.",
			"Choose an output format. PNG keeps text and line art sharp, JPG produces the smallest widely supported files, and WebP is smaller still but not readable by very old software.",
			"Pick a resolution. High renders at three times the page size and suits printing or zooming, Medium is a good default for screens, and Low keeps the download small.",
			"Press Convert. A single page downloads as one image; a longer document downloads as a ZIP with the pages numbered in order.",
		],
		faqTitle: "Questions about converting PDF pages to images",
		faq: [
			{
				question: "Is my PDF uploaded anywhere?",
				answer:
					"No. The document is opened with your browser's file API and each page is drawn on a canvas inside the page. The images and the ZIP are built in memory on your device, so nothing crosses the network.",
			},
			{
				question: "Which format should I choose?",
				answer:
					"PNG for documents that are mostly text, diagrams or screenshots, because it keeps edges sharp with no compression blur. JPG for photo-heavy pages and when you need the widest compatibility at a small size. WebP when the file will be used on the web and you want the smallest download.",
			},
			{
				question: "How do I get higher resolution images?",
				answer:
					"Choose High quality, which renders each page at three times its nominal size — roughly 216 DPI for a standard document. That is enough for print and for zooming in on small text, at the cost of larger files and a slower conversion.",
			},
			{
				question: "Can I convert only some pages?",
				answer:
					"This tool converts the whole document. To pick pages first, use the Split PDF tool to pull out the pages you want, then run the resulting file through this converter.",
			},
			{
				question: "Why is the download a ZIP file?",
				answer:
					"Browsers can only save one file per download, so a multi-page document is packed into a single ZIP archive. The pages are numbered with leading zeros, which keeps them in the right order in every file manager.",
			},
		],
	},
	"/merge-pdf": {
		heading: "Merge PDF",
		lead: "This tool joins several PDFs into a single document — scanned pages that arrived one file at a time, a contract and its appendices, chapters that need to become one report. Pages are copied exactly as they are, so text stays selectable, links keep working, and nothing is re-encoded or re-compressed along the way. The whole merge is done inside your browser with no upload, which matters when the documents are contracts, medical records or anything else you would rather not hand to a stranger's server.",
		stepsTitle: "How to merge PDF files",
		steps: [
			"Drop two or more PDF files onto the box above, or click it to select them. Files added together are sorted by name.",
			"Put them in the order you want. Drag a row by its handle, or use the arrow buttons, and remove anything you added by mistake.",
			"Name the output file.",
			"Press Merge PDFs. The combined document downloads as soon as the last file has been copied in.",
		],
		faqTitle: "Questions about merging PDFs",
		faq: [
			{
				question: "Are the files uploaded to a server?",
				answer:
					"No. Each PDF is read from your device, and the pages are copied into a new document built in the page. No part of any file is sent over the network.",
			},
			{
				question: "Does merging reduce the quality of the pages?",
				answer:
					"No. Pages are copied at the object level, not re-rendered, so images keep their original resolution and text stays as text. The merged file is roughly the size of the originals added together.",
			},
			{
				question: "Can I merge password-protected PDFs?",
				answer:
					"A file that only restricts editing or printing can usually be merged. A file that needs a password just to open cannot be read here — remove the password in the application that created it first.",
			},
			{
				question: "Is there a limit on how many files I can merge?",
				answer:
					"There is no fixed limit, because nothing is uploaded. The practical ceiling is your device's memory: merging a few dozen ordinary documents is fine, while hundreds of image-heavy scans may run out of room in the browser tab.",
			},
			{
				question: "Do bookmarks and form fields survive the merge?",
				answer:
					"Page content, links and annotations are carried over. Document-level structures such as outlines, form fields and attachments may be dropped, because they belong to the original file rather than to individual pages.",
			},
		],
	},
	"/split-pdf": {
		heading: "Split PDF",
		lead: "This tool takes pages out of a PDF: a single chapter from a long report, the signature page of a contract, the invoice buried in the middle of a scan. You can either extract a selection into one new document, or explode the file into one PDF per page, downloaded as a ZIP. Pages can also be rotated on the way out, which fixes scans that arrive sideways. Pages are copied rather than redrawn, so quality is untouched, and the whole thing runs in your browser without an upload.",
		stepsTitle: "How to split a PDF or extract pages",
		steps: [
			"Drop your PDF onto the box above, or click it to choose a file. The page count appears once the document has been read.",
			'Choose what to produce: "Selected pages" makes one PDF containing the pages you list, and "One file per page" makes a separate PDF for every page, delivered as a ZIP.',
			'For a selection, type the pages you want. Single pages and ranges can be mixed — "1-3, 7, 10-" means pages one to three, page seven, and page ten to the end.',
			"Optionally rotate the extracted pages, then press Split PDF to download the result.",
		],
		faqTitle: "Questions about splitting PDFs",
		faq: [
			{
				question: "Is my document uploaded?",
				answer:
					"No. The PDF is read on your device and the new files are assembled in the page. Nothing is transmitted, which also means the tool keeps working if you go offline after the page has loaded.",
			},
			{
				question: "How do I write the page ranges?",
				answer:
					'Separate entries with commas. "5" is a single page, "2-6" is a range, and "10-" means from page ten to the end. The order you type is the order the pages appear in the new file, and a page listed twice is only included once.',
			},
			{
				question: "Does splitting make the file smaller?",
				answer:
					"Usually, but not proportionally. Pages are copied along with the resources they use, so a three-page extract from a hundred-page document is far smaller than the original — though shared fonts and images can make it larger than a simple one-thirtieth of the size.",
			},
			{
				question: "Can I rotate pages without splitting?",
				answer:
					'Yes. Choose "Selected pages", enter the full range — "1-" covers the whole document — pick a rotation and export. The result is the same document with every page turned.',
			},
			{
				question: "What happens to encrypted PDFs?",
				answer:
					"Files that merely restrict printing or editing can normally be split. A file that requires a password to open cannot be read in the browser; open it in a PDF application, save an unprotected copy, and split that.",
			},
		],
	},
	"/images-to-pdf": {
		heading: "Images to PDF",
		lead: "This tool puts a set of pictures into one PDF, one image per page — photographed receipts that have to be filed as a single document, scanned pages from a phone, screenshots that need to be sent as a report, artwork that has to arrive in a printable format. You can keep each page exactly the shape of its image, or lay the images out on A4 or Letter pages with a margin, which is what most printers and submission portals expect. The conversion is done entirely in the browser, so photographs of your documents stay on your device.",
		stepsTitle: "How to convert images to PDF",
		steps: [
			"Drop your images onto the box above, or click to select them. JPG, PNG, WebP, GIF, BMP and AVIF files are accepted, and they are sorted by name when added.",
			"Reorder the list until the pages are in the order you want, and remove anything that does not belong.",
			'Choose a page size. "Fit to image" gives every page the exact proportions of its picture; A4 and Letter place the image on a standard sheet, centred, with the margin you pick.',
			"Name the file and press Create PDF. The document downloads when the last image has been placed.",
		],
		faqTitle: "Questions about converting images to PDF",
		faq: [
			{
				question: "Are my photos uploaded anywhere?",
				answer:
					"No. Each image is read from your device and embedded into a PDF that is assembled in the page. Nothing is sent to a server, which is worth knowing when the images are photographs of documents or identification.",
			},
			{
				question: "Which page size should I choose?",
				answer:
					'Choose A4 or Letter when the PDF will be printed or submitted to a form that expects standard pages. Choose "Fit to image" for screenshots, artwork and anything that should fill the page edge to edge with no white border.',
			},
			{
				question: "Are the images compressed again?",
				answer:
					"JPG and PNG files are embedded exactly as they are, so no quality is lost. Other formats — WebP, AVIF, GIF, BMP — are converted to high-quality JPEG first, because the PDF format itself cannot carry them.",
			},
			{
				question: "Will portrait and landscape photos both fit?",
				answer:
					'Yes. With orientation set to "Auto", each page turns to match its image, so a landscape photograph gets a landscape page instead of being shrunk to fit a portrait one. You can also force every page to one orientation.',
			},
			{
				question: "Can I put several images on one page?",
				answer:
					"No, each image gets its own page. That keeps the result predictable and printable; for contact sheets or collages, arrange the images in an image editor first and convert the finished layout here.",
			},
		],
	},
	"/image-converter": {
		heading: "Image converter and resizer",
		lead: "This tool changes an image's format, size and file weight — the three things that stand between a photo from a phone and a file some website will actually accept. Convert a HEIC-exported PNG to JPG for a form that only takes JPG, shrink a 4000-pixel photograph to the 1200 pixels a blog needs, or re-encode to WebP and watch the file drop by half at the same visible quality. Several images can be processed at once and arrive as a ZIP. The pictures are decoded and redrawn by your own browser, so they are never uploaded.",
		stepsTitle: "How to convert and resize images",
		steps: [
			"Drop your images onto the box above, or click to select them. You can add many at once and process them with the same settings.",
			"Choose the output format: PNG for lossless quality and transparency, JPG for universally accepted photos, or WebP for the smallest files.",
			'Set the size. "Keep original" leaves the pixels alone, or you can fix the width, fix the height, or scale by a percentage — the other dimension always follows so nothing is stretched.',
			"Adjust the quality slider for JPG and WebP, then press Convert. The result table shows the new size next to the original, and a single image downloads on its own while several arrive as a ZIP.",
		],
		faqTitle: "Questions about converting images",
		faq: [
			{
				question: "Are my images uploaded to a server?",
				answer:
					"No. Each image is decoded by your browser, redrawn on a canvas and re-encoded on your device. Nothing is transmitted, and no copy is kept once you leave the page.",
			},
			{
				question: "How much smaller will my files get?",
				answer:
					"It depends on the source. A PNG photograph converted to JPG or WebP often drops by 80 percent or more; a JPG re-encoded at 80 percent quality typically halves; resizing to a smaller pixel size usually saves more than any format change. The table after conversion shows the exact numbers.",
			},
			{
				question: "Will transparency be preserved?",
				answer:
					"With PNG and WebP, yes. JPG has no transparency at all, so transparent areas are filled with white rather than turning black — if you need a transparent background, choose PNG or WebP.",
			},
			{
				question: "Can it convert HEIC photos from an iPhone?",
				answer:
					"Only if your browser can decode HEIC, which most desktop browsers cannot. Safari on Apple devices handles it; elsewhere, export the photo as JPG on the phone first and convert that.",
			},
			{
				question: "Does converting again and again lose quality?",
				answer:
					"With JPG and WebP, yes — each pass re-compresses what the previous pass produced, and small errors accumulate. Always convert from the original file rather than from an earlier conversion. PNG is lossless, so it can be re-saved freely.",
			},
		],
	},
	"/qr-code": {
		heading: "QR code generator",
		lead: "This generator turns a link or a piece of text into a QR code you can print, paste into a slide, or put on a poster. It encodes the value directly into the image, which is the important difference from most free generators: there is no redirect through someone else's domain, so the code cannot stop working when that service shuts down or starts charging, and no one collects a scan count on you. Download a PNG for documents and screens, or an SVG when the code has to be printed large or resized without going blurry. Everything is generated in the page — the content never reaches a server.",
		stepsTitle: "How to make a QR code",
		steps: [
			"Choose what the code should contain: a link, plain text, a Wi-Fi network, an email address or a phone number.",
			"Fill in the fields. The preview redraws as you type, so you can scan it with your phone straight from the screen to check it works.",
			"Adjust the size and the error correction level if you need to. Higher correction makes the pattern denser but keeps the code readable when it is partly damaged, covered or printed small.",
			"Download the PNG for everyday use, or the SVG when the code will be printed large or edited in a design tool.",
		],
		faqTitle: "Questions about QR codes",
		faq: [
			{
				question: "Do these codes expire or get tracked?",
				answer:
					"No. The value you type is encoded directly into the pattern, so the code works forever and points straight at your content. Codes from services that shorten your link first stop working when that service does, and they log every scan.",
			},
			{
				question: "Is my data sent anywhere?",
				answer:
					"No. The code is generated by JavaScript running in your browser. Wi-Fi passwords and email addresses typed into the form never leave your device.",
			},
			{
				question: "Which error correction level should I use?",
				answer:
					'Medium is right for most uses. Choose High ("H") when the code will be printed on something that gets scuffed, placed behind a logo, or reproduced very small — it can still be read with about a third of the pattern obscured, at the cost of a denser image.',
			},
			{
				question: "Should I download PNG or SVG?",
				answer:
					"PNG for slides, documents and websites, where a fixed-size image is fine. SVG for print and design work: it is made of shapes rather than pixels, so it stays perfectly sharp at any size, from a business card to a billboard.",
			},
			{
				question: "How small can I print a QR code?",
				answer:
					"As a rule of thumb, keep it at least 2 cm across for a code scanned at arm's length, and leave a clear quiet zone — an empty margin around the pattern — of about four modules. Long content makes a denser pattern that needs more space, so shorten URLs before encoding when you can.",
			},
		],
	},
	"/json-formatter": {
		heading: "JSON formatter and validator",
		lead: "This tool takes JSON that arrived as one unreadable line — an API response, a log entry, a config value — and lays it out with indentation so you can actually read it. It also does the reverse: minifying formatted JSON back down for a request body or an environment variable. When the text is not valid JSON it says what is wrong and where, which is usually faster than staring at a wall of brackets. It matters that this runs locally: API responses routinely contain tokens, customer records and internal identifiers, and pasting those into a website that posts them to a server is a real leak. Here the parsing happens in your browser.",
		stepsTitle: "How to format JSON",
		steps: [
			"Paste your JSON into the box, or drop a .json file onto it.",
			"Choose an indentation width — two spaces, four spaces or tabs — to match the conventions of the project you are working in.",
			"Press Format to lay the document out, or Minify to strip every space and newline back out of it.",
			"If the text is invalid, the error appears with the line and column of the character that broke the parse. Fix it and format again, then copy the result or download it as a file.",
		],
		faqTitle: "Questions about the JSON formatter",
		faq: [
			{
				question: "Is the data I paste sent anywhere?",
				answer:
					"No. The text is parsed by your browser's own JSON engine inside the page. Nothing is logged, stored or transmitted, which is why this is a safe place to inspect a response that contains tokens or personal data.",
			},
			{
				question: "Why does my JSON fail to parse?",
				answer:
					"The usual causes are a trailing comma after the last item, single quotes instead of double quotes, unquoted keys, or a comment — all of which JavaScript accepts and JSON does not. The error message points at the exact character where the parse stopped.",
			},
			{
				question: "Can it sort the keys?",
				answer:
					"Yes. Turn on key sorting to output every object with its keys in alphabetical order, which makes two versions of the same document easy to compare line by line.",
			},
			{
				question: "Does formatting change my data?",
				answer:
					"Only its whitespace and, if you ask for it, the order of object keys — neither of which carries meaning in JSON. Values are untouched, with one caveat: numbers too large for JavaScript to hold exactly, such as 64-bit identifiers, can lose precision, so treat those as strings.",
			},
			{
				question: "How large a document can it handle?",
				answer:
					"Files of a few megabytes format almost instantly. Very large documents — tens of megabytes — can briefly freeze the tab while the browser parses and re-renders them, since the work happens on your machine rather than on a server.",
			},
		],
	},
	"/word-counter": {
		heading: "Word counter",
		lead: "This counter tells you how long a piece of writing is: words, characters with and without spaces, sentences, paragraphs, and how long it takes to read or read aloud. That is what most limits are actually written against — a 2,200-character cover letter, a 160-character meta description, a 280-character post, a five-minute talk. It also lists the words you use most, which is a quick way to catch a phrase you have leaned on three times in two paragraphs. The text is counted as you type, in your browser, and is never sent anywhere.",
		stepsTitle: "How to count words and characters",
		steps: [
			"Type or paste your text into the box. The counts update on every keystroke.",
			"Read the totals: words, characters including spaces, characters excluding spaces, sentences and paragraphs.",
			"Check the reading and speaking times, estimated at 200 words per minute for silent reading and 130 for speaking aloud.",
			"Look through the most-used words to spot repetition, then edit the text in place and watch the numbers change.",
		],
		faqTitle: "Questions about the word counter",
		faq: [
			{
				question: "Is my text uploaded or stored?",
				answer:
					"No. Counting happens in your browser as you type. Nothing is sent over the network and nothing is kept once you close the page, so drafts and confidential documents are safe to paste.",
			},
			{
				question: "How is a word counted?",
				answer:
					"A word is a run of characters separated by whitespace, so hyphenated compounds count as one and numbers count as words. This matches how word processors count, which is what most submission limits are based on.",
			},
			{
				question:
					"Does it count characters the way Twitter or a meta description does?",
				answer:
					'The "characters including spaces" figure is the one those limits use. Note that platforms sometimes count an emoji or an accented letter as more than one character, so leave a little room when you are near a hard limit.',
			},
			{
				question: "How accurate is the reading time?",
				answer:
					"It is an estimate from the word count at 200 words per minute, which is a common average for adults reading prose on screen. Dense technical writing reads more slowly and light copy more quickly, so treat it as a guide rather than a measurement.",
			},
			{
				question: "Does it work for Korean, Japanese or Chinese text?",
				answer:
					"Character counts are accurate for any language. Word counts are not meaningful for scripts that do not separate words with spaces — for those, use the character count, which is what limits in those languages are normally written against anyway.",
			},
		],
	},
	"/compress-pdf": {
		heading: "Compress PDF",
		lead: "This tool makes a PDF smaller so it fits under the limit an email, a form or a portal insists on. It works by re-drawing each page as a compressed image at a lower resolution, which is where almost all of the weight in a scanned or image-heavy document lives. That trade is worth knowing about before you use it: the result looks the same on screen but its text is no longer selectable or searchable, so keep the original if you will need to copy from it later. Everything happens in your browser, which matters here more than usual — the documents people need to compress are typically the ones they have just scanned.",
		stepsTitle: "How to compress a PDF",
		steps: [
			"Drop your PDF onto the box above, or click it to choose a file. The current size is shown once the document has been read.",
			"Pick a level. Light keeps the pages sharp and saves the least, Balanced is the usual choice, and Strong squeezes hardest for documents that only need to be readable.",
			"Press Compress. The progress bar counts pages as they are re-drawn.",
			"Check the before and after sizes in the result. If the saving was not enough, run the original again at a stronger level rather than compressing the compressed file.",
		],
		faqTitle: "Questions about compressing PDFs",
		faq: [
			{
				question: "Is my document uploaded to a server?",
				answer:
					"No. The PDF is read from your device, each page is rendered on a canvas in the page, and the new document is assembled in memory. Nothing is transmitted.",
			},
			{
				question: "How much smaller will the file get?",
				answer:
					"Scans and photo-heavy documents often drop by 60 to 90 percent. A PDF that is mostly text and vector graphics may barely shrink, or even grow, because converting crisp text into an image is not an efficient trade — for those files, compression is the wrong tool.",
			},
			{
				question: "Will the text still be selectable?",
				answer:
					"No. Each page becomes an image, so text can no longer be selected, copied, searched or read by a screen reader. If those matter, keep the original and send the compressed copy only where size is the binding constraint.",
			},
			{
				question: "Why did my file get bigger?",
				answer:
					"Because the original was already efficient. A text-only PDF stores letters as instructions, which is far more compact than a picture of those letters. If the result is larger, the original did not need compressing.",
			},
			{
				question: "Can I compress the same file twice?",
				answer:
					"You can, but you should not. Each pass re-compresses the previous pass's output, so the damage accumulates while the savings shrink. Go back to the original and pick a stronger level instead.",
			},
		],
	},
	"/organize-pdf": {
		heading: "Organize PDF pages",
		lead: "This tool shows a PDF as a grid of page thumbnails so you can fix it by looking at it: move a page that ended up in the wrong place, turn the ones a scanner fed in sideways, and drop the blank sheets and cover pages nobody needs. It is the visual counterpart to the Split tool — use Split when you already know which page numbers you want, and this when you need to see the pages to decide. Pages are copied rather than redrawn, so nothing loses quality, and the document is never uploaded.",
		stepsTitle: "How to reorder, rotate and delete PDF pages",
		steps: [
			"Drop your PDF onto the box above. Thumbnails appear as each page is drawn, so a long document fills in gradually.",
			"Use the arrows on a page to move it earlier or later, and the rotate button to turn it 90 degrees at a time.",
			"Remove any page with its delete button. A page removed by mistake comes back with Reset, which restores the document to how it was opened.",
			"Name the file and press Save PDF. The rearranged document downloads with only the pages you kept.",
		],
		faqTitle: "Questions about organizing PDF pages",
		faq: [
			{
				question: "Is the file uploaded anywhere?",
				answer:
					"No. Thumbnails are rendered on your device and the new PDF is built in the page. Nothing about the document crosses the network.",
			},
			{
				question: "Does the original file change?",
				answer:
					"Never. The tool reads your file and writes a new one; the document on your device is untouched no matter what you do here.",
			},
			{
				question: "Why do thumbnails take a while on long documents?",
				answer:
					"Every page is genuinely rendered by your browser, one after another, to keep memory use low. A hundred-page scan takes noticeably longer than a five-page letter — the pages appear as they finish, so you can start working before the last one arrives.",
			},
			{
				question: "Does rotating a page reduce its quality?",
				answer:
					"No. Rotation is stored as a property of the page, and the content is copied untouched. The same is true of reordering and deleting.",
			},
			{
				question: "Can I add pages from another PDF here?",
				answer:
					"No, this tool only works within one document. Combine the files with the Merge PDF tool first, then open the merged file here to arrange the pages.",
			},
		],
	},
	"/base64": {
		heading: "Base64 encoder and decoder",
		lead: "Base64 rewrites arbitrary data using only letters, digits and a couple of symbols, so it can travel through channels that expect text — a JSON field, a data URI in a stylesheet, an email attachment header, a Kubernetes secret. This tool converts in both directions, for typed text and for whole files, and can produce the URL-safe variant that swaps the two characters a query string would otherwise mangle. It runs locally, which is the point: the strings people decode are usually tokens, keys and secrets, and pasting those into a site that posts them to a server hands them over.",
		stepsTitle: "How to encode and decode base64",
		steps: [
			"Choose Text to type or paste a value, or File to convert a file from your device.",
			"Switch between Encode and Decode. In text mode the result updates as you type.",
			'Turn on "URL safe" if the value will sit in a URL or a filename — it replaces the + and / characters and drops the trailing padding.',
			"Copy the result, or in file mode download the decoded bytes back to a file.",
		],
		faqTitle: "Questions about base64",
		faq: [
			{
				question: "Is my data sent anywhere?",
				answer:
					"No. Encoding and decoding use your browser's own functions inside the page. Nothing is logged or transmitted, which is why it is safe to decode a token here.",
			},
			{
				question: "Is base64 a form of encryption?",
				answer:
					"No, and this matters. It is an encoding, not a cipher — anyone can reverse it instantly with no key. Never treat a base64 string as a way to hide a password or a secret; it only changes the alphabet, not the readability.",
			},
			{
				question: "What does URL-safe mean?",
				answer:
					"Standard base64 uses + and /, which have their own meaning inside a URL, and = padding, which is often stripped. The URL-safe variant writes those as - and _ and omits the padding, so the value survives being placed in a query string, a path or a filename. This tool accepts both when decoding.",
			},
			{
				question: "Why is my encoded file bigger than the original?",
				answer:
					"Base64 represents three bytes with four characters, so the output is about 33 percent larger, plus any line breaks. That overhead is the price of being able to send binary data through a text-only channel.",
			},
			{
				question: "Why did decoding say the result is not text?",
				answer:
					"Because the bytes are not valid UTF-8 — you decoded something binary, such as an image or a PDF. Switch to file mode, which writes those bytes to a file instead of trying to display them.",
			},
		],
	},
	"/hash-generator": {
		heading: "Hash generator",
		lead: "A hash is a short fingerprint of some data: the same input always produces the same string, and changing a single byte changes it completely. That makes it the standard way to check that a download arrived intact, that two files are genuinely identical, or that a file has not been altered since someone published its checksum. This tool computes SHA-1, SHA-256, SHA-384 and SHA-512 for text you type or a file you pick, and can compare the result against a checksum you paste in — useful when the number is 64 characters long and reading it by eye is how mistakes happen. The hashing is done by your browser's built-in cryptography, so even a large file never leaves your device.",
		stepsTitle: "How to generate a hash or verify a checksum",
		steps: [
			"Choose Text to hash something you type, or File to hash a file from your device.",
			"Read the results — all four algorithms are computed at once, so you do not have to guess which one a site published.",
			"To verify a download, paste the published checksum into the compare box. A match is confirmed for you rather than left to your eyes.",
			"Copy whichever hash you need with the button beside it.",
		],
		faqTitle: "Questions about hashes and checksums",
		faq: [
			{
				question: "Is my file uploaded to be hashed?",
				answer:
					"No. The file is read on your device and hashed by the browser's built-in WebCrypto implementation. Nothing is sent over the network, and large files are handled at native speed.",
			},
			{
				question: "Which algorithm should I use?",
				answer:
					"SHA-256 unless you were told otherwise — it is the default for software checksums, signatures and most protocols. SHA-512 is a fine alternative and can be faster on 64-bit machines. Use SHA-1 only to check against an old published value, never for anything security-related.",
			},
			{
				question: "Why is MD5 not offered?",
				answer:
					"Browsers do not implement it, because it has been broken for years: two different files can be made to share an MD5 hash. Anything relying on MD5 for integrity or security should move to SHA-256.",
			},
			{
				question: "Can a hash be turned back into the original data?",
				answer:
					"No. Hashing only goes one way, and the output is a fixed length no matter how large the input. Short, common inputs can still be guessed by trying candidates, which is why passwords need a salted, deliberately slow hash rather than a plain SHA-256.",
			},
			{
				question: "The checksum does not match. What now?",
				answer:
					"Download the file again — an interrupted or corrupted transfer is the usual cause. If a fresh copy still fails to match, do not open it: either the published checksum is for a different version, or the file is not the one that was published.",
			},
		],
	},
	"/uuid-generator": {
		heading: "UUID generator",
		lead: "A UUID is a 128-bit identifier you can create anywhere without asking a central authority, which is why they end up as database keys, request identifiers, file names and idempotency tokens. This tool makes them in bulk, in either of the two versions worth using today: v4, which is entirely random, and v7, which puts a timestamp in the leading bits so the values sort in creation order — a real advantage for database primary keys, where random ones scatter writes across the index. The randomness comes from your browser's cryptographic generator, and nothing is sent anywhere, so the values are yours alone.",
		stepsTitle: "How to generate UUIDs",
		steps: [
			"Choose a version: v4 for plain random identifiers, or v7 when they will be stored in sorted order.",
			"Set how many you need — one for a quick paste, or a few thousand to seed a table.",
			"Pick a format if your target needs one: lowercase with hyphens is standard, uppercase and braces suit some Microsoft tooling, and the compact form drops the hyphens for a 32-character string.",
			"Press Generate, then copy the list or download it as a text file. The validator below checks any UUID you paste and tells you its version.",
		],
		faqTitle: "Questions about UUIDs",
		faq: [
			{
				question: "Are the identifiers generated on my device?",
				answer:
					"Yes. They come from the browser's cryptographically secure random generator, in the page. Nothing is requested from or reported to a server, so no one else has ever seen the values you generate.",
			},
			{
				question: "Can two UUIDs ever be the same?",
				answer:
					"In theory yes, in practice no. A v4 UUID has 122 random bits; you would need to generate billions per second for decades before a collision became likely. It is safe to treat them as unique.",
			},
			{
				question: "When should I use v7 instead of v4?",
				answer:
					"Whenever the identifier becomes a database primary key. v7 starts with a millisecond timestamp, so new rows land next to each other in the index instead of scattering across it — that keeps inserts fast and the index compact. Use v4 when the value must reveal nothing at all, since v7 discloses roughly when it was created.",
			},
			{
				question: "Are UUIDs safe to use as secret tokens?",
				answer:
					"A v4 UUID is random enough to be unguessable, so it can serve as an opaque identifier in a URL. It is not a substitute for a real session token or API key, which should be longer and issued by your authentication system.",
			},
			{
				question: "What happened to versions 1, 3 and 5?",
				answer:
					"Version 1 encodes the machine's MAC address and leaks where it was made. Versions 3 and 5 are hashes of a name and are only useful when you need the same input to always produce the same identifier. For general use, v4 and v7 are the ones to reach for.",
			},
		],
	},
	"/csv-to-json": {
		heading: "CSV and JSON converter",
		lead: "Spreadsheets export CSV and APIs speak JSON, so the gap between them has to be crossed constantly — a column of records exported from a report and needed as a request body, or a response that has to land in a spreadsheet someone else will read. This converter goes both ways and handles the parts of CSV that trip up a naive split on commas: quoted fields, commas and line breaks inside them, and doubled quotes. It can also read values as their real types, so a column of numbers arrives as numbers rather than strings. The whole conversion runs in your browser, which matters because exported spreadsheets are usually full of customer data.",
		stepsTitle: "How to convert between CSV and JSON",
		steps: [
			"Choose a direction: CSV to JSON, or JSON to CSV.",
			"Paste your data into the box, or drop a .csv, .tsv or .json file onto it.",
			"Set the delimiter if the file does not use commas — semicolons are common in European exports, and tabs in data copied out of a spreadsheet.",
			"Choose whether the first row holds the column names, and whether values that look like numbers or true and false should be converted. Then press Convert and copy or download the result.",
		],
		faqTitle: "Questions about converting CSV and JSON",
		faq: [
			{
				question: "Is my data uploaded?",
				answer:
					"No. The file is read and parsed by your browser inside the page. Nothing is sent over the network, which is worth knowing when the export contains names, emails or order records.",
			},
			{
				question: "Does it handle commas and line breaks inside a field?",
				answer:
					"Yes. The parser follows RFC 4180: a field wrapped in double quotes can contain the delimiter, line breaks, and doubled quotes to mean a literal quote character. That is exactly what a spreadsheet writes when a cell holds an address or a sentence.",
			},
			{
				question: "Why are my postal codes losing their leading zeros?",
				answer:
					"They are not — type conversion deliberately leaves them alone. A value like 01234 is not a valid plain number, so it stays a string. Turn type conversion off entirely if you want every value to remain text.",
			},
			{
				question: "What happens to duplicate or empty column names?",
				answer:
					"An empty header becomes column1, column2 and so on, and a repeated name gets a numbered suffix. Without that, later columns would silently overwrite earlier ones, because a JSON object cannot hold the same key twice.",
			},
			{
				question: "Can it convert nested JSON to CSV?",
				answer:
					"Only shallowly. CSV is a flat grid, so a nested object or array is written as JSON text inside its cell rather than spread across columns. Flatten the structure first if you need each field in its own column.",
			},
		],
	},
	"/text-diff": {
		heading: "Text compare",
		lead: "This tool puts two versions of something side by side and marks what actually changed — the paragraph that was rewritten between drafts, the line that differs between two config files, the clause someone quietly edited in a contract. It compares line by line and shows added lines in green and removed ones in red, collapsing the long stretches that are identical so the changes are not buried. It can also ignore case and whitespace, which removes the noise when reindentation or a find-and-replace makes every line look different. Both texts stay in your browser.",
		stepsTitle: "How to compare two texts",
		steps: [
			"Paste the original into the left box and the new version into the right, or drop a text file onto either one.",
			"Press Compare. The summary counts how many lines were added, removed and left unchanged.",
			"Read the result: removed lines are marked with a minus, added lines with a plus, and unchanged stretches are collapsed with a note saying how many lines were hidden.",
			"If reformatting is drowning out the real changes, turn on ignore whitespace or ignore case and compare again.",
		],
		faqTitle: "Questions about comparing text",
		faq: [
			{
				question: "Is the text I paste sent anywhere?",
				answer:
					"No. The comparison runs entirely in your browser, so contracts, drafts and configuration files are safe to paste here.",
			},
			{
				question: "Does it compare word by word or line by line?",
				answer:
					"Line by line. A line with a single changed word shows as one removal and one addition, which keeps long documents readable. For prose, breaking the text at sentences before comparing makes the result easier to follow.",
			},
			{
				question: "What do the ignore options do?",
				answer:
					"Ignore whitespace collapses runs of spaces and tabs and trims the ends of lines, so reindented code compares as unchanged. Ignore case treats upper and lower case as the same. Both affect only the comparison — the text shown is always what you pasted.",
			},
			{
				question: "Why are identical sections hidden?",
				answer:
					"Because a hundred unchanged lines around one edit make the edit harder to find. A few lines of context are kept around every change, and the rest is replaced with a note saying how many lines were collapsed.",
			},
			{
				question: "Can it compare Word or PDF documents?",
				answer:
					"Not directly — it compares plain text. Copy the text out of the documents and paste it in, or export both to plain text first. Formatting, images and layout are not part of the comparison.",
			},
		],
	},
	"/color-converter": {
		heading: "Color converter",
		lead: "One colour has to be written several different ways depending on who is asking: a hex code for CSS, RGB for a design tool, HSL when you want to nudge the lightness without changing the hue, CMYK for a printer. This converter takes the colour in any of those notations and shows all of them at once. It also answers the two questions that usually follow — whether white or black text will be readable on it, scored against the WCAG contrast thresholds, and what the lighter and darker versions look like when you need a hover state or a full scale for a design system.",
		stepsTitle: "How to convert a colour",
		steps: [
			'Type a colour in any notation — "#3a2e30", "3a2", "rgb(58, 46, 48)" or "hsl(340, 12%, 20%)" — or use the picker to choose one by eye.',
			"Read the conversions. Each one can be copied with the button beside it.",
			"Check the contrast panel to see whether white or black text passes the AA and AAA thresholds on this colour.",
			"Use the tints and shades row to pick related colours — a lighter one for a hover state, a darker one for a border or pressed state.",
		],
		faqTitle: "Questions about colour conversion",
		faq: [
			{
				question: "Which notation should I use in CSS?",
				answer:
					"Hex for fixed brand colours, because it is compact and universally understood. HSL when you are generating variations, since changing one number gives you a lighter or more muted version of the same hue instead of guessing at three channels.",
			},
			{
				question: "Is the CMYK conversion accurate for printing?",
				answer:
					"Treat it as an approximation. Real print colour depends on the paper, the ink and the press profile, so a printer will convert using a colour profile rather than a formula. Use this figure to communicate roughly what you want, not as the final print specification.",
			},
			{
				question: "What do the contrast numbers mean?",
				answer:
					"They are WCAG contrast ratios between this colour and white or black text. 4.5:1 is the AA threshold for body text, 3:1 covers large or bold text, and 7:1 is AAA. Below 3:1, text becomes hard to read for many people and should not be used.",
			},
			{
				question: "What is the difference between HSL and HSV?",
				answer:
					"Both start from hue and saturation. HSL's third value runs from black through the pure colour to white, which is why it suits generating tints and shades. HSV's runs from black to the pure colour, which is what most colour pickers show as a square gradient.",
			},
			{
				question: "Does it handle transparency?",
				answer:
					"An alpha value in an rgba or eight-digit hex input is accepted but ignored — the conversions describe the opaque colour. Contrast in particular cannot be computed without knowing what is behind a translucent colour.",
			},
		],
	},
	"/unit-converter": {
		heading: "Unit converter",
		lead: "This converter moves a number between the units people actually have to reconcile: a recipe in cups against a kitchen scale in grams, a height in feet against a form that wants centimetres, a hard drive quoted in TB against a folder measured in GB. It covers length, weight, temperature, area, volume, speed, data and time, and shows the value in every unit of the category at once, so you can read off the one you need without converting twice. It runs in the page — no request goes out when you type.",
		stepsTitle: "How to convert units",
		steps: [
			"Pick a category — length, weight, temperature and so on. The unit lists change with it.",
			"Type the number you have. It converts as you type; there is no button to press.",
			"Choose the unit you are converting from and the one you want. The arrows between them swap the two if you picked them the wrong way round.",
			"Read the large result, or look at the table below it, which shows the same value in every unit of that category.",
		],
		faqTitle: "Questions about converting units",
		faq: [
			{
				question: "Why is temperature handled differently from the rest?",
				answer:
					"Because its scales do not start at the same place. Ten metres is ten times one metre, but ten degrees Celsius is not ten times one degree — zero means something different on each scale. Temperature is converted with the proper formula rather than by multiplying.",
			},
			{
				question: "Does a kilobyte mean 1,000 or 1,024 bytes here?",
				answer:
					"1,024. This tool uses the binary steps that operating systems and file managers report, so the numbers match what you see on your own disk. Drive manufacturers use 1,000, which is why a 1 TB drive shows up as about 931 GB.",
			},
			{
				question: "Which gallon and which cup are these?",
				answer:
					"The US liquid gallon of 3.785 litres and the US cup of about 237 millilitres. The imperial gallon used in the UK is roughly 4.546 litres, so a recipe written in one is not interchangeable with the other.",
			},
			{
				question: "Why do some results have so many decimal places?",
				answer:
					"Because the exact conversion needs them. The result keeps enough digits to stay accurate for the size of the number, and switches to scientific notation when the value gets very large or very small. Copy what you need and round it yourself.",
			},
			{
				question: "What is a pyeong?",
				answer:
					"A traditional East Asian unit of area still used for property in Korea, equal to about 3.3 square metres. It is included because apartment listings there are quoted in pyeong while official documents use square metres.",
			},
		],
	},
	"/password-generator": {
		heading: "Password generator",
		lead: "A password is only as good as the number of guesses it would take to find, and people are bad at producing that by hand — the ones we invent cluster around words, dates and keyboard patterns that cracking software tries first. This generator draws every character from your browser's cryptographic random source, so there is no pattern to exploit. It tells you how many bits of entropy the current settings give you, which is the honest measure of strength: each extra bit doubles the work of guessing. The password is generated in the page and is never transmitted, stored or logged.",
		stepsTitle: "How to make a strong password",
		steps: [
			"Drag the length slider. Length matters more than anything else here — going from 12 to 20 characters is a far bigger gain than adding symbols to a short password.",
			"Choose which kinds of characters to use. Leave all four on unless the site you are signing up to refuses symbols.",
			'Turn on "avoid look-alike characters" if you will have to read the password aloud or type it from paper, and 0 against O will cause trouble.',
			"Copy the password straight into your password manager. Generate several at once if you are setting up more than one account.",
		],
		faqTitle: "Questions about generated passwords",
		faq: [
			{
				question: "Is the password sent anywhere or saved?",
				answer:
					"No. It is produced by your browser's cryptographic random generator inside the page. Nothing is transmitted, nothing is written to storage, and closing the tab is enough to be rid of it.",
			},
			{
				question: "How long should a password be?",
				answer:
					"Sixteen characters with mixed types is comfortably beyond brute force today; twenty gives room for the years ahead. Anything under twelve is worth replacing. The entropy figure under the password is the number to watch — 80 bits is strong, 128 bits is more than anything currently practical.",
			},
			{
				question: "What do the bits of entropy mean?",
				answer:
					"They count how many guesses an attacker would need, expressed as a power of two. Sixty bits means about a billion billion possibilities. It measures this password against blind guessing — it says nothing about whether you then reuse it, which is what actually ends most accounts.",
			},
			{
				question: "Should I use symbols?",
				answer:
					"They help, but less than people expect. Adding all the symbols to a 12-character password gains about 8 bits; adding four more characters gains about 26. If a site rejects symbols, make the password longer rather than worrying about it.",
			},
			{
				question: "Is a random password better than a passphrase?",
				answer:
					"For anything you paste from a password manager, yes — it is shorter for the same strength. A passphrase of several unrelated words is easier to type and remember, which makes it the better choice for the handful of passwords you have to key in by hand, such as the one guarding the manager itself.",
			},
		],
	},
	"/date-calculator": {
		heading: "Date calculator",
		lead: "This calculator answers the two date questions that come up constantly and that nobody can do reliably in their head: how long is it between these two dates, and what date falls a certain distance from this one. It counts calendar months properly — a month after 31 January is not simply thirty days later — handles leap years, and gives you the count in business days as well as plain days, which is what notice periods, delivery estimates and deadlines are usually written in.",
		stepsTitle: "How to work out dates",
		steps: [
			'Choose "between two dates" to measure a gap, or "add or subtract" to move away from a date.',
			"For a gap, pick the two dates. The order does not matter — the result is the same either way.",
			"Read the total in days, then the breakdown into years, months and days, and the panels for weeks, business days, hours and minutes.",
			"To move from a date, enter how far and in which unit. A negative number goes backwards. The result shows the date and the day of the week it lands on.",
		],
		faqTitle: "Questions about date calculations",
		faq: [
			{
				question: "How are business days counted?",
				answer:
					"Every day except Saturday and Sunday, counting the start date and stopping before the end date. Public holidays are not deducted, because they differ by country and by year — subtract those yourself for the region you are in.",
			},
			{
				question:
					"Why is the breakdown into years and months not just the days divided up?",
				answer:
					"Because months are not the same length. The breakdown walks the calendar: it counts whole months from the start date, then the days left over. That is why 31 January to 1 March reads as one month and one day rather than a fixed number of days.",
			},
			{
				question: "What happens when I add a month to the 31st?",
				answer:
					"The date rolls into the next month rather than clamping. One month after 31 January lands on 2 or 3 March, depending on the year, because February has no 31st. If you need it to clamp to the last day of the month, subtract the difference by hand.",
			},
			{
				question: "Are leap years handled?",
				answer:
					"Yes. The calculation uses the browser's own calendar, so 29 February exists in the years it should and day counts across it come out right.",
			},
			{
				question: "Does the time of day affect the result?",
				answer:
					"The day, week and business-day counts ignore the time and compare whole calendar days, so a time zone change cannot shift the answer by one. The hours and minutes figures do use the exact moments.",
			},
		],
	},
	"/timestamp-converter": {
		heading: "Unix timestamp converter",
		lead: "A Unix timestamp counts the seconds since the start of 1970, which makes it convenient for computers and unreadable for people. This converter goes both ways: paste the number from a log line, a database column or an API response and get the date, or type a date and get the number back. It works out on its own whether you pasted seconds or milliseconds — the usual source of an answer that is off by a factor of a thousand — and shows the moment in ISO, UTC and your own local time at once, along with how long ago it was.",
		stepsTitle: "How to convert a Unix timestamp",
		steps: [
			"Paste the timestamp into the first box. Ten digits are read as seconds and thirteen as milliseconds; the label beside the box shows which was assumed.",
			'Or type a date into the second box — "2026-01-01", "2026-01-01T09:30:00Z" and similar formats are all understood.',
			"Read the results: the same moment as seconds, milliseconds, ISO 8601, UTC and your local time, each with its own copy button.",
			'Press "use this" beside the live clock to drop the current timestamp into the box.',
		],
		faqTitle: "Questions about Unix timestamps",
		faq: [
			{
				question: "Seconds or milliseconds — how do I tell?",
				answer:
					"By length. A timestamp in seconds has ten digits for any date between 2001 and 2286; the same moment in milliseconds has thirteen. This tool switches automatically on that, and shows you which it chose so you can correct it if the value is unusual.",
			},
			{
				question: "Why does the local time differ from UTC?",
				answer:
					"Because a timestamp records an instant, not a wall clock. The same number is 09:00 in London and 18:00 in Seoul. The local line uses your device's time zone; the UTC and ISO lines are the same everywhere, which is why logs and APIs use them.",
			},
			{
				question: "What happens in 2038?",
				answer:
					"Systems that store the timestamp in a signed 32-bit integer run out of room on 19 January 2038 and wrap into negative numbers. Anything storing it in 64 bits — which is now most things, including this page — is unaffected for longer than the age of the universe.",
			},
			{
				question: "Can it handle dates before 1970?",
				answer:
					"Yes. Those are negative timestamps, counting seconds backwards from the epoch, and they convert correctly here.",
			},
			{
				question: "Does the timestamp know about leap seconds?",
				answer:
					"No, and neither does any other Unix timestamp. The count deliberately pretends every day has exactly 86,400 seconds, which is why it stays simple to convert and why it drifts from astronomical time by a handful of seconds.",
			},
		],
	},
	"/regex-tester": {
		heading: "Regex tester",
		lead: "Regular expressions are quicker to test than to reason about, and testing them somewhere that runs the same engine as the code matters — this page uses your browser's own JavaScript regex engine, so what matches here matches in your script. Every match is highlighted in the text, listed with its position and its captured groups, and you can preview a replacement with $1-style references before committing to it. Test text tends to be real data, so it is worth saying: nothing you paste leaves the page.",
		stepsTitle: "How to test a regular expression",
		steps: [
			"Type the pattern. Write it as you would inside the slashes — the tool adds those and the flags around it.",
			"Toggle the flags you need: i to ignore case, m to make ^ and $ work per line, s to let the dot match newlines, u for Unicode mode.",
			"Paste the text to search underneath. Matches are highlighted as you type, and the table lists each one with where it starts and what its groups captured.",
			'Turn on "show replacement" to try a substitution. Use $1, $2 for numbered groups and $<name> for named ones.',
		],
		faqTitle: "Questions about testing regular expressions",
		faq: [
			{
				question: "Which flavour of regular expression is this?",
				answer:
					"JavaScript's, because it is your browser's own engine running the pattern. It is close to PCRE for everyday work, but lookbehind, named groups and Unicode property escapes have their own support history, and some things PCRE allows — recursion, possessive quantifiers — do not exist here at all.",
			},
			{
				question: "Is my test text uploaded?",
				answer:
					"No. The pattern runs in the page against text that never leaves it. That is worth knowing when you are testing against a log excerpt or a customer record.",
			},
			{
				question: "Why is there a limit on the text length?",
				answer:
					"Because a pattern can be made to backtrack catastrophically — nested quantifiers over the wrong input take exponential time — and a browser cannot interrupt a regex once it starts. Capping the input keeps a bad pattern from freezing the tab instead of showing you the problem.",
			},
			{
				question: "Why does it stop at 1,000 matches?",
				answer:
					"Rendering tens of thousands of highlighted matches would make the page unusable without telling you anything more. When the cap is reached it is stated above the results, so you know the list is partial.",
			},
			{
				question: "What do the named groups look like in output?",
				answer:
					"They appear as an object in the groups column, and you can reference them in a replacement with $<name>. A pattern like (?<year>\\d{4}) makes the year available under that name instead of a number.",
			},
		],
	},
	"/jwt-decoder": {
		heading: "JWT decoder",
		lead: "A JSON Web Token looks like noise but is mostly readable: two of its three parts are just base64-encoded JSON. This decoder opens them so you can see who the token is for, what it claims, and exactly when it expires — usually while working out why a request is being rejected. It can also check an HMAC signature if you have the secret, which tells you whether the token was really issued by the system you think. Tokens carry live credentials, so it matters that this runs in the page: neither the token nor the secret is transmitted anywhere.",
		stepsTitle: "How to decode a JWT",
		steps: [
			"Paste the token. All three dot-separated parts, exactly as it appears in the header or the cookie.",
			"Read the header and payload side by side. The header names the signing algorithm; the payload holds the claims.",
			"Check the dates panel: exp, iat and nbf are shown as real times, and an expired token is labelled as such.",
			"To confirm the signature, paste the signing secret and press check. This works for HS256, HS384 and HS512.",
		],
		faqTitle: "Questions about JSON Web Tokens",
		faq: [
			{
				question: "Is it safe to paste a real token here?",
				answer:
					"Safer than most places, because the decoding happens in your browser and nothing is sent over the network. Still treat the token as the credential it is: anyone who sees your screen or clipboard has it, and if it is a live session token, it stays valid until it expires.",
			},
			{
				question: "Is the payload encrypted?",
				answer:
					"No, and this surprises people. The header and payload are only base64-encoded — anyone holding the token can read them without a key. The signature stops the contents being changed, not read. Never put anything secret in a JWT payload.",
			},
			{
				question: "Why can it only verify HS256 and its relatives?",
				answer:
					"Those are signed with a shared secret, which you can paste in. RS256, ES256 and the rest are signed with a private key and verified with the matching public key, which usually has to be fetched from the issuer's JWKS endpoint — that would mean sending a request, which this tool does not do.",
			},
			{
				question: "The signature does not match. What went wrong?",
				answer:
					"Most often the secret is not the one used to sign, or it was pasted with a stray space or newline. It can also mean the token was signed with a different algorithm than its header claims, or that it was tampered with — which is exactly the case verification exists to catch.",
			},
			{
				question: "What do exp, iat and nbf mean?",
				answer:
					"They are standard time claims, all Unix timestamps in seconds. exp is when the token stops being valid, iat is when it was issued, and nbf is the earliest time it may be used. This page shows all three as ordinary dates and flags a token whose exp has passed.",
			},
		],
	},
};

export default GUIDES_EN;
