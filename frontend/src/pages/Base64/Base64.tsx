import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import type { FunctionComponent } from "../../common/types";
import { decodeText, encodeText } from "../../common/base64";
import { findPageSeo } from "../../common/seo";
import {
	downloadBlob,
	formatBytes,
	stripExtension,
} from "../../common/download";
import { Content } from "../../components/ui/Content";
import { PageGuideSection } from "../../components/ui/PageGuideSection";
import { ToolTextArea } from "../../components/ui/ToolTextArea";
import { ActionButton } from "../../components/ui/ActionButton";
import { FileDropzone } from "../../components/ui/FileDropzone";
import { copyToClipboard } from "../../common/clipboard";

type Mode = "text" | "file";
type Direction = "encode" | "decode";

const TabButton = ({
	label,
	active,
	onClick,
}: {
	label: string;
	active: boolean;
	onClick: () => void;
}): FunctionComponent => (
	<button
		type="button"
		className={`h-11 px-5 rounded-xl border font-medium
			${active ? "border-green-05 text-neutral-05 bg-main-05" : "border-neutral-05 text-neutral-15 hover:text-neutral-05"}`}
		onClick={onClick}
	>
		{label}
	</button>
);

export const Base64 = (): FunctionComponent => {
	const [mode, setMode] = useState<Mode>("text");
	const [direction, setDirection] = useState<Direction>("encode");
	const [urlSafe, setUrlSafe] = useState(false);
	const [input, setInput] = useState<string>("");
	const [output, setOutput] = useState<string>("");
	const [error, setError] = useState<string>("");
	const [file, setFile] = useState<File | null>(null);
	const [working, setWorking] = useState(false);

	// 텍스트 모드는 입력이 바뀔 때마다 바로 변환한다.
	useEffect(() => {
		if (mode !== "text") return;
		if (input === "") {
			setOutput("");
			setError("");
			return;
		}
		try {
			setOutput(
				direction === "encode" ? encodeText(input, urlSafe) : decodeText(input)
			);
			setError("");
		} catch (caught) {
			setOutput("");
			setError(caught instanceof Error ? caught.message : "Cannot convert");
		}
	}, [mode, direction, urlSafe, input]);

	const convertFile = (): void => {
		if (!file) {
			toast.error("Please add a file first");
			return;
		}
		setWorking(true);
		import("../../common/base64")
			.then(async ({ encodeFile }) => encodeFile(file, urlSafe))
			.then((encoded) => {
				setOutput(encoded);
				setError("");
			})
			.catch(() => {
				toast.error("Cannot read the file");
			})
			.finally(() => {
				setWorking(false);
			});
	};

	// 디코딩한 바이트가 텍스트가 아닐 때는 파일로 받는 편이 낫다.
	const downloadDecoded = (): void => {
		import("../../common/base64")
			.then(({ decodeToBytes }) => {
				const bytes = decodeToBytes(input);
				downloadBlob(
					new Blob([bytes.slice().buffer as ArrayBuffer], {
						type: "application/octet-stream",
					}),
					"decoded.bin"
				);
				toast.success("decoded.bin downloaded");
			})
			.catch((caught: unknown) => {
				toast.error(
					caught instanceof Error ? caught.message : "This is not valid base64"
				);
			});
	};

	const guide = findPageSeo("/base64").guide;

	return (
		<Content categoryName="Developer" title="BASE64">
			<p className="text-neutral-15 text-sm lg:text-md">
				Encode text or a file to base64 and decode it back, with the URL-safe
				variant when the value has to live in a link. Converted in your browser.
			</p>

			<div className="flex flex-wrap gap-4 items-center">
				<div className="flex gap-2">
					<TabButton
						active={mode === "text"}
						label="Text"
						onClick={() => {
							setMode("text");
							setOutput("");
							setError("");
						}}
					/>
					<TabButton
						active={mode === "file"}
						label="File"
						onClick={() => {
							setMode("file");
							setDirection("encode");
							setOutput("");
							setError("");
						}}
					/>
				</div>

				{mode === "text" && (
					<div className="flex gap-2">
						<TabButton
							active={direction === "encode"}
							label="Encode"
							onClick={() => {
								setDirection("encode");
							}}
						/>
						<TabButton
							active={direction === "decode"}
							label="Decode"
							onClick={() => {
								setDirection("decode");
							}}
						/>
					</div>
				)}

				{direction === "encode" && (
					<label
						className="flex items-center gap-3 text-neutral-10 cursor-pointer"
						htmlFor="base64-url-safe"
					>
						<input
							checked={urlSafe}
							className="w-4 h-4 accent-green-05"
							id="base64-url-safe"
							type="checkbox"
							onChange={(event) => {
								setUrlSafe(event.target.checked);
							}}
						/>
						URL safe
					</label>
				)}
			</div>

			{mode === "file" ? (
				<div className="flex flex-col gap-6">
					<FileDropzone
						accept="*/*"
						disabled={working}
						hint="any file — it is read on your device"
						title={file ? file.name : "Drop a file here"}
						onFilesAdded={(files) => {
							const [first] = files;
							if (first) {
								setFile(first);
								setOutput("");
							}
						}}
					/>
					{file && (
						<div className="text-neutral-15 text-sm">
							{stripExtension(file.name)} · {formatBytes(file.size)} · encodes
							to about {formatBytes(Math.ceil(file.size / 3) * 4)}
						</div>
					)}
					<div className="flex gap-4 flex-wrap">
						<ActionButton
							disabled={!file || working}
							label={working ? "Encoding..." : "Encode file"}
							onClick={convertFile}
						/>
					</div>
				</div>
			) : (
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					<div className="flex flex-col gap-2">
						<div className="text-neutral-15 text-sm">
							{direction === "encode" ? "Text" : "Base64"}
						</div>
						<ToolTextArea
							mono
							id="base64-input"
							value={input}
							placeholder={
								direction === "encode"
									? "Type or paste the text to encode"
									: "Paste the base64 to decode"
							}
							onChange={setInput}
						/>
					</div>

					<div className="flex flex-col gap-2">
						<div className="flex items-center justify-between">
							<div className="text-neutral-15 text-sm">
								{direction === "encode" ? "Base64" : "Text"}
								{output !== "" && ` · ${output.length} characters`}
							</div>
							<div className="flex gap-4">
								<button
									disabled={output === ""}
									type="button"
									className={`text-sm underline ${
										output === ""
											? "text-neutral-50 cursor-not-allowed"
											: "text-neutral-15 hover:text-neutral-05"
									}`}
									onClick={() => {
										copyToClipboard(output);
									}}
								>
									Copy
								</button>
								{direction === "decode" && (
									<button
										disabled={input === ""}
										type="button"
										className={`text-sm underline ${
											input === ""
												? "text-neutral-50 cursor-not-allowed"
												: "text-neutral-15 hover:text-neutral-05"
										}`}
										onClick={downloadDecoded}
									>
										Save as file
									</button>
								)}
							</div>
						</div>
						<ToolTextArea
							mono
							readOnly
							id="base64-output"
							placeholder="The result appears here"
							value={output}
						/>
					</div>
				</div>
			)}

			{mode === "file" && output !== "" && (
				<div className="flex flex-col gap-2">
					<div className="flex items-center justify-between">
						<div className="text-neutral-15 text-sm">
							Base64 · {output.length} characters
						</div>
						<button
							className="text-sm underline text-neutral-15 hover:text-neutral-05"
							type="button"
							onClick={() => {
								copyToClipboard(output);
							}}
						>
							Copy
						</button>
					</div>
					<ToolTextArea
						mono
						readOnly
						id="base64-file-output"
						placeholder=""
						value={output}
					/>
				</div>
			)}

			{error !== "" && (
				<div className="border border-neutral-05 rounded-xl p-4 text-neutral-05">
					{error}
				</div>
			)}

			{guide && <PageGuideSection guide={guide} />}
		</Content>
	);
};
