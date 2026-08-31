import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import type { FunctionComponent } from "../../common/types";
import { HASH_ALGORITHMS, type HashAlgorithm } from "../../common/hash";
import { formatBytes } from "../../common/download";
import { Content } from "../../components/ui/Content";
import { PageGuideSection } from "../../components/ui/PageGuideSection";
import { ToolTextArea } from "../../components/ui/ToolTextArea";
import { FileDropzone } from "../../components/ui/FileDropzone";
import { CopyField } from "../../components/ui/CopyField";

type Mode = "text" | "file";

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

export const HashGenerator = (): FunctionComponent => {
	const { t } = useTranslation();
	const [mode, setMode] = useState<Mode>("text");
	const [text, setText] = useState<string>("");
	const [file, setFile] = useState<File | null>(null);
	const [hashes, setHashes] = useState<Record<HashAlgorithm, string> | null>(
		null
	);
	const [expected, setExpected] = useState<string>("");
	const [working, setWorking] = useState(false);

	// 텍스트는 입력이 바뀔 때마다 다시 계산한다. 늦게 끝난 계산이
	// 최신 결과를 덮어쓰지 않도록 취소 플래그를 둔다.
	useEffect(() => {
		if (mode !== "text") return;
		if (text === "") {
			setHashes(null);
			return;
		}

		let cancelled = false;
		import("../../common/hash")
			.then(async ({ hashAll }) => hashAll(text))
			.then((result) => {
				if (!cancelled) setHashes(result);
			})
			.catch((error: unknown) => {
				if (!cancelled) {
					toast.error(
						error instanceof Error
							? error.message
							: t("hashGenerator.failedText")
					);
				}
			});

		return (): void => {
			cancelled = true;
		};
	}, [mode, text, t]);

	const hashFile = (picked: File): void => {
		setFile(picked);
		setHashes(null);
		setWorking(true);

		import("../../common/hash")
			.then(async ({ hashAll }) => hashAll(picked))
			.then(setHashes)
			.catch((error: unknown) => {
				toast.error(
					error instanceof Error ? error.message : t("hashGenerator.failedFile")
				);
			})
			.finally(() => {
				setWorking(false);
			});
	};

	// 붙여넣은 체크섬이 어느 알고리즘의 결과와 같은지 찾는다.
	const normalizedExpected = expected.trim().toLowerCase();
	const matched =
		hashes === null || normalizedExpected === ""
			? null
			: (HASH_ALGORITHMS.find(
					(algorithm) => hashes[algorithm] === normalizedExpected
				) ?? false);

	return (
		<Content
			categoryName={t("hashGenerator.category")}
			title={t("hashGenerator.title")}
		>
			<p className="text-neutral-15 text-sm lg:text-md">
				{t("hashGenerator.intro")}
			</p>

			<div className="flex gap-2">
				<TabButton
					active={mode === "text"}
					label={t("common.text")}
					onClick={() => {
						setMode("text");
						setHashes(null);
					}}
				/>
				<TabButton
					active={mode === "file"}
					label={t("common.file")}
					onClick={() => {
						setMode("file");
						setHashes(null);
					}}
				/>
			</div>

			{mode === "text" ? (
				<ToolTextArea
					height="h-[200px]"
					id="hash-input"
					placeholder={t("hashGenerator.textPlaceholder")}
					value={text}
					onChange={setText}
				/>
			) : (
				<div className="flex flex-col gap-4">
					<FileDropzone
						accept="*/*"
						disabled={working}
						hint={t("hashGenerator.anyFile")}
						title={file ? file.name : t("common.dropFile")}
						onFilesAdded={(files) => {
							const [first] = files;
							if (first) hashFile(first);
						}}
					/>
					{file && (
						<div className="text-neutral-15 text-sm">
							{formatBytes(file.size)}
							{working ? ` · ${t("hashGenerator.hashing")}` : ""}
						</div>
					)}
				</div>
			)}

			{hashes && (
				<div className="flex flex-col gap-3">
					{HASH_ALGORITHMS.map((algorithm) => (
						<CopyField
							key={algorithm}
							label={algorithm}
							value={hashes[algorithm]}
						/>
					))}
				</div>
			)}

			{hashes && (
				<div className="flex flex-col gap-3">
					<div className="text-neutral-05 font-medium text-xl">
						{t("hashGenerator.compare")}
					</div>
					<div className="flex items-center h-12 border border-neutral-05 rounded-xl px-4">
						<input
							className="w-full bg-transparent text-neutral-05 outline-none font-mono text-sm"
							id="expected-hash"
							placeholder={t("hashGenerator.comparePlaceholder")}
							type="text"
							value={expected}
							onChange={(event) => {
								setExpected(event.target.value);
							}}
						/>
					</div>
					{matched !== null &&
						(matched === false ? (
							<div className="text-neutral-05">
								{t("hashGenerator.noMatch")}
							</div>
						) : (
							<div className="text-green-05 font-medium">
								{t("hashGenerator.match", {
									algorithm: matched,
									source:
										mode === "file"
											? t("hashGenerator.sourceFile")
											: t("hashGenerator.sourceText"),
								})}
							</div>
						))}
				</div>
			)}

			<PageGuideSection path="/hash-generator" />
		</Content>
	);
};
