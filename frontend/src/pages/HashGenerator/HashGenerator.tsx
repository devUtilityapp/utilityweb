import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import type { FunctionComponent } from "../../common/types";
import { HASH_ALGORITHMS, type HashAlgorithm } from "../../common/hash";
import { findPageSeo } from "../../common/seo";
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
						error instanceof Error ? error.message : "Cannot hash this text"
					);
				}
			});

		return (): void => {
			cancelled = true;
		};
	}, [mode, text]);

	const hashFile = (picked: File): void => {
		setFile(picked);
		setHashes(null);
		setWorking(true);

		import("../../common/hash")
			.then(async ({ hashAll }) => hashAll(picked))
			.then(setHashes)
			.catch((error: unknown) => {
				toast.error(
					error instanceof Error ? error.message : "Cannot hash this file"
				);
			})
			.finally(() => {
				setWorking(false);
			});
	};

	const guide = findPageSeo("/hash-generator").guide;

	// 붙여넣은 체크섬이 어느 알고리즘의 결과와 같은지 찾는다.
	const normalizedExpected = expected.trim().toLowerCase();
	const matched =
		hashes === null || normalizedExpected === ""
			? null
			: (HASH_ALGORITHMS.find(
					(algorithm) => hashes[algorithm] === normalizedExpected
				) ?? false);

	return (
		<Content categoryName="Developer" title="HASH GENERATOR">
			<p className="text-neutral-15 text-sm lg:text-md">
				Generate SHA-1, SHA-256, SHA-384 and SHA-512 for text or a file, and
				check a download against its published checksum. Hashed on your device.
			</p>

			<div className="flex gap-2">
				<TabButton
					active={mode === "text"}
					label="Text"
					onClick={() => {
						setMode("text");
						setHashes(null);
					}}
				/>
				<TabButton
					active={mode === "file"}
					label="File"
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
					placeholder="Type or paste the text to hash"
					value={text}
					onChange={setText}
				/>
			) : (
				<div className="flex flex-col gap-4">
					<FileDropzone
						accept="*/*"
						disabled={working}
						hint="any file — large files are handled at full speed"
						title={file ? file.name : "Drop a file here"}
						onFilesAdded={(files) => {
							const [first] = files;
							if (first) hashFile(first);
						}}
					/>
					{file && (
						<div className="text-neutral-15 text-sm">
							{formatBytes(file.size)}
							{working ? " · hashing..." : ""}
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
						Compare with a published checksum
					</div>
					<div className="flex items-center h-12 border border-neutral-05 rounded-xl px-4">
						<input
							className="w-full bg-transparent text-neutral-05 outline-none font-mono text-sm"
							id="expected-hash"
							placeholder="Paste the checksum you were given"
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
								No match. Download the file again — an interrupted transfer is
								the usual cause.
							</div>
						) : (
							<div className="text-green-05 font-medium">
								Match — this is the {matched} checksum of your{" "}
								{mode === "file" ? "file" : "text"}.
							</div>
						))}
				</div>
			)}

			{guide && <PageGuideSection guide={guide} />}
		</Content>
	);
};
