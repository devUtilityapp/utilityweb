import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import type { FunctionComponent } from "../../common/types";
import { decodeText, encodeText } from "../../common/base64";
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
	const { t } = useTranslation();
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
			setError(
				caught instanceof Error ? caught.message : t("base64.cannotConvert")
			);
		}
	}, [mode, direction, urlSafe, input, t]);

	const convertFile = (): void => {
		if (!file) {
			toast.error(t("base64.addFile"));
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
				toast.error(t("common.cannotReadFile"));
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
				toast.success(t("common.downloaded", { name: "decoded.bin" }));
			})
			.catch((caught: unknown) => {
				toast.error(
					caught instanceof Error ? caught.message : t("base64.cannotConvert")
				);
			});
	};

	return (
		<Content categoryName={t("base64.category")} title={t("base64.title")}>
			<p className="text-neutral-15 text-sm lg:text-md">{t("base64.intro")}</p>

			<div className="flex flex-wrap gap-4 items-center">
				<div className="flex gap-2">
					<TabButton
						active={mode === "text"}
						label={t("common.text")}
						onClick={() => {
							setMode("text");
							setOutput("");
							setError("");
						}}
					/>
					<TabButton
						active={mode === "file"}
						label={t("common.file")}
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
							label={t("base64.encode")}
							onClick={() => {
								setDirection("encode");
							}}
						/>
						<TabButton
							active={direction === "decode"}
							label={t("base64.decode")}
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
						{t("base64.urlSafe")}
					</label>
				)}
			</div>

			{mode === "file" ? (
				<div className="flex flex-col gap-6">
					<FileDropzone
						accept="*/*"
						disabled={working}
						hint={t("base64.anyFile")}
						title={file ? file.name : t("common.dropFile")}
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
							{t("base64.fileSummary", {
								name: stripExtension(file.name),
								size: formatBytes(file.size),
								encoded: formatBytes(Math.ceil(file.size / 3) * 4),
							})}
						</div>
					)}
					<div className="flex gap-4 flex-wrap">
						<ActionButton
							disabled={!file || working}
							label={working ? t("base64.encoding") : t("base64.encodeFile")}
							onClick={convertFile}
						/>
					</div>
				</div>
			) : (
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					<div className="flex flex-col gap-2">
						<div className="text-neutral-15 text-sm">
							{direction === "encode" ? t("common.text") : "Base64"}
						</div>
						<ToolTextArea
							mono
							id="base64-input"
							value={input}
							placeholder={
								direction === "encode"
									? t("base64.encodePlaceholder")
									: t("base64.decodePlaceholder")
							}
							onChange={setInput}
						/>
					</div>

					<div className="flex flex-col gap-2">
						<div className="flex items-center justify-between">
							<div className="text-neutral-15 text-sm">
								{direction === "encode" ? "Base64" : t("common.text")}
								{output !== "" &&
									` · ${t("base64.characters", { count: output.length })}`}
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
									{t("common.copy")}
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
										{t("base64.saveAsFile")}
									</button>
								)}
							</div>
						</div>
						<ToolTextArea
							mono
							readOnly
							id="base64-output"
							placeholder={t("base64.outputPlaceholder")}
							value={output}
						/>
					</div>
				</div>
			)}

			{mode === "file" && output !== "" && (
				<div className="flex flex-col gap-2">
					<div className="flex items-center justify-between">
						<div className="text-neutral-15 text-sm">
							{`Base64 · ${t("base64.characters", { count: output.length })}`}
						</div>
						<button
							className="text-sm underline text-neutral-15 hover:text-neutral-05"
							type="button"
							onClick={() => {
								copyToClipboard(output);
							}}
						>
							{t("common.copy")}
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

			<PageGuideSection path="/base64" />
		</Content>
	);
};
