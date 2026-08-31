import { useEffect, useState } from "react";
import type { TFunction } from "i18next";
import { useTranslation } from "react-i18next";
import { tDynamic } from "../../common/translate";
import { toast } from "react-toastify";
import type { FunctionComponent } from "../../common/types";
import {
	buildEmailPayload,
	buildWifiPayload,
	normalizeUrl,
	type ErrorCorrection,
	type QrContentType,
} from "../../common/qrPayload";
import { downloadBlob } from "../../common/download";
import { Content } from "../../components/ui/Content";
import { PageGuideSection } from "../../components/ui/PageGuideSection";
import { Select } from "../../components/ui/Select";
import { LabeledField } from "../../components/ui/LabeledField";

const TYPE_KEYS: Record<QrContentType, string> = {
	url: "qrCode.typeUrl",
	text: "qrCode.typeText",
	wifi: "qrCode.typeWifi",
	email: "qrCode.typeEmail",
	tel: "qrCode.typeTel",
};

const CORRECTION_KEYS: Record<ErrorCorrection, string> = {
	L: "qrCode.correctionL",
	M: "qrCode.correctionM",
	Q: "qrCode.correctionQ",
	H: "qrCode.correctionH",
};

const ENCRYPTION_KEYS: Record<string, string> = {
	WPA: "qrCode.encryptionWpa",
	WEP: "qrCode.encryptionWep",
	nopass: "qrCode.encryptionOpen",
};

/** 번역된 선택지 문구를 값과 짝지어 만든다. */
const labelsOf = (
	keys: Record<string, string>,
	t: TFunction
): Record<string, string> =>
	Object.fromEntries(
		Object.entries(keys).map(([value, key]) => [value, tDynamic(t, key)])
	);

const SIZE_LABELS: Record<string, string> = {
	"256": "256 px",
	"512": "512 px",
	"1024": "1024 px",
	"2048": "2048 px",
};

const labelToValue = <T extends string>(
	labels: Record<string, string>,
	label: string,
	fallback: T
): T => {
	const entry = Object.entries(labels).find(([, text]) => text === label);
	return entry ? (entry[0] as T) : fallback;
};

const TextField = ({
	id,
	value,
	placeholder,
	type = "text",
	onChange,
}: {
	id: string;
	value: string;
	placeholder: string;
	type?: string;
	onChange: (value: string) => void;
}): FunctionComponent => (
	<div className="flex items-center h-12 border border-neutral-05 rounded-xl px-3">
		<input
			className="w-full bg-transparent text-neutral-05 outline-none font-medium"
			id={id}
			placeholder={placeholder}
			type={type}
			value={value}
			onChange={(event) => {
				onChange(event.target.value);
			}}
		/>
	</div>
);

export const QrCode = (): FunctionComponent => {
	const { t } = useTranslation();
	const [contentType, setContentType] = useState<QrContentType>("url");
	const [url, setUrl] = useState<string>("");
	const [text, setText] = useState<string>("");
	const [phone, setPhone] = useState<string>("");
	const [email, setEmail] = useState({ address: "", subject: "", body: "" });
	const [wifi, setWifi] = useState({
		ssid: "",
		password: "",
		encryption: "WPA" as "WPA" | "WEP" | "nopass",
		hidden: false,
	});
	const [size, setSize] = useState<string>("512");
	const [errorCorrection, setErrorCorrection] = useState<ErrorCorrection>("M");
	const [preview, setPreview] = useState<string>("");

	const payload = ((): string => {
		if (contentType === "url") return normalizeUrl(url);
		if (contentType === "text") return text;
		if (contentType === "tel") return phone.trim() ? `tel:${phone.trim()}` : "";
		if (contentType === "email") {
			return email.address.trim()
				? buildEmailPayload(email.address, email.subject, email.body)
				: "";
		}
		return wifi.ssid.trim() ? buildWifiPayload(wifi) : "";
	})();

	// 입력이 바뀔 때마다 미리보기를 다시 그린다. 늦게 끝난 이전 요청이
	// 최신 결과를 덮어쓰지 않도록 취소 플래그를 둔다.
	useEffect(() => {
		if (payload === "") {
			setPreview("");
			return;
		}

		let cancelled = false;
		import("../../common/qrCode")
			.then(async ({ renderQrDataUrl }) =>
				renderQrDataUrl({ value: payload, size: 512, errorCorrection })
			)
			.then((dataUrl) => {
				if (!cancelled) setPreview(dataUrl);
			})
			.catch(() => {
				if (!cancelled) setPreview("");
			});

		return (): void => {
			cancelled = true;
		};
	}, [payload, errorCorrection]);

	const downloadPng = async (): Promise<void> => {
		try {
			const { renderQrDataUrl } = await import("../../common/qrCode");
			const dataUrl = await renderQrDataUrl({
				value: payload,
				size: Number(size),
				errorCorrection,
			});
			const response = await fetch(dataUrl);
			downloadBlob(await response.blob(), "qr-code.png");
			toast.success(t("common.downloaded", { name: "qr-code.png" }));
		} catch (error) {
			console.error(error);
			toast.error(t("qrCode.failed"));
		}
	};

	const downloadSvg = async (): Promise<void> => {
		try {
			const { renderQrSvg } = await import("../../common/qrCode");
			const svg = await renderQrSvg({ value: payload, errorCorrection });
			downloadBlob(new Blob([svg], { type: "image/svg+xml" }), "qr-code.svg");
			toast.success(t("common.downloaded", { name: "qr-code.svg" }));
		} catch (error) {
			console.error(error);
			toast.error(t("qrCode.failed"));
		}
	};

	const typeLabels = labelsOf(TYPE_KEYS, t);
	const correctionLabels = labelsOf(CORRECTION_KEYS, t);
	const encryptionLabels = labelsOf(ENCRYPTION_KEYS, t);
	const sizeLabels = Object.fromEntries(
		Object.keys(SIZE_LABELS).map((value) => [value, `${value} px`])
	);

	return (
		<Content categoryName={t("qrCode.category")} title={t("qrCode.title")}>
			<p className="text-neutral-15 text-sm lg:text-md">{t("qrCode.intro")}</p>

			<div className="flex flex-col lg:flex-row gap-10">
				<div className="flex flex-col gap-6 flex-1">
					<LabeledField label={t("qrCode.content")}>
						<div className="h-12 w-full max-w-[260px]">
							<Select
								currentValue={typeLabels[contentType] ?? ""}
								options={Object.values(typeLabels)}
								width="260px"
								onChange={(value) => {
									setContentType(labelToValue(typeLabels, value, "url"));
								}}
							/>
						</div>
					</LabeledField>

					{contentType === "url" && (
						<LabeledField label={t("qrCode.url")}>
							<TextField
								id="qr-url"
								placeholder={t("qrCode.urlPlaceholder")}
								value={url}
								onChange={setUrl}
							/>
						</LabeledField>
					)}

					{contentType === "text" && (
						<LabeledField label={t("qrCode.text")}>
							<textarea
								className="w-full h-32 bg-transparent border border-neutral-05 rounded-xl p-3 text-neutral-05 outline-none resize-y"
								id="qr-text"
								placeholder={t("qrCode.textPlaceholder")}
								value={text}
								onChange={(event) => {
									setText(event.target.value);
								}}
							/>
						</LabeledField>
					)}

					{contentType === "tel" && (
						<LabeledField label={t("qrCode.phone")}>
							<TextField
								id="qr-tel"
								placeholder={t("qrCode.phonePlaceholder")}
								value={phone}
								onChange={setPhone}
							/>
						</LabeledField>
					)}

					{contentType === "email" && (
						<>
							<LabeledField label={t("qrCode.address")}>
								<TextField
									id="qr-email"
									placeholder={t("qrCode.addressPlaceholder")}
									type="email"
									value={email.address}
									onChange={(value) => {
										setEmail((previous) => ({ ...previous, address: value }));
									}}
								/>
							</LabeledField>
							<LabeledField label={t("qrCode.subject")}>
								<TextField
									id="qr-email-subject"
									placeholder={t("qrCode.subjectPlaceholder")}
									value={email.subject}
									onChange={(value) => {
										setEmail((previous) => ({ ...previous, subject: value }));
									}}
								/>
							</LabeledField>
							<LabeledField label={t("qrCode.message")}>
								<TextField
									id="qr-email-body"
									placeholder={t("qrCode.messagePlaceholder")}
									value={email.body}
									onChange={(value) => {
										setEmail((previous) => ({ ...previous, body: value }));
									}}
								/>
							</LabeledField>
						</>
					)}

					{contentType === "wifi" && (
						<>
							<LabeledField label={t("qrCode.ssid")}>
								<TextField
									id="qr-wifi-ssid"
									placeholder={t("qrCode.ssidPlaceholder")}
									value={wifi.ssid}
									onChange={(value) => {
										setWifi((previous) => ({ ...previous, ssid: value }));
									}}
								/>
							</LabeledField>
							<LabeledField label={t("qrCode.security")}>
								<div className="h-12 w-full max-w-[260px]">
									<Select
										options={Object.values(encryptionLabels)}
										width="260px"
										currentValue={
											encryptionLabels[wifi.encryption] ??
											t("qrCode.encryptionWpa")
										}
										onChange={(value) => {
											setWifi((previous) => ({
												...previous,
												encryption: labelToValue(
													encryptionLabels,
													value,
													"WPA"
												) as "WPA" | "WEP" | "nopass",
											}));
										}}
									/>
								</div>
							</LabeledField>
							{wifi.encryption !== "nopass" && (
								<LabeledField label={t("qrCode.password")}>
									<TextField
										id="qr-wifi-password"
										placeholder={t("qrCode.passwordPlaceholder")}
										value={wifi.password}
										onChange={(value) => {
											setWifi((previous) => ({ ...previous, password: value }));
										}}
									/>
								</LabeledField>
							)}
							<label
								className="flex items-center gap-3 text-neutral-10 cursor-pointer"
								htmlFor="qr-wifi-hidden"
							>
								<input
									checked={wifi.hidden}
									className="w-4 h-4 accent-green-05"
									id="qr-wifi-hidden"
									type="checkbox"
									onChange={(event) => {
										setWifi((previous) => ({
											...previous,
											hidden: event.target.checked,
										}));
									}}
								/>
								{t("qrCode.hidden")}
							</label>
						</>
					)}

					<div className="flex flex-wrap gap-6 items-end">
						<LabeledField label={t("qrCode.correction")}>
							<div className="h-12 w-[200px]">
								<Select
									currentValue={correctionLabels[errorCorrection] ?? ""}
									options={Object.values(correctionLabels)}
									width="200px"
									onChange={(value) => {
										setErrorCorrection(
											labelToValue(correctionLabels, value, "M")
										);
									}}
								/>
							</div>
						</LabeledField>

						<LabeledField label={t("qrCode.pngSize")}>
							<div className="h-12 w-[160px]">
								<Select
									currentValue={sizeLabels[size] ?? "512 px"}
									options={Object.values(sizeLabels)}
									width="160px"
									onChange={(value) => {
										setSize(labelToValue(sizeLabels, value, "512"));
									}}
								/>
							</div>
						</LabeledField>
					</div>
				</div>

				<div className="flex flex-col gap-6 items-center lg:w-[320px]">
					<div className="w-[280px] h-[280px] flex items-center justify-center border border-neutral-50 rounded-2xl bg-main-00 overflow-hidden">
						{preview === "" ? (
							<div className="text-neutral-15 text-sm px-6 text-center">
								{t("qrCode.empty")}
							</div>
						) : (
							<img
								alt={t("qrCode.preview")}
								className="w-full h-full object-contain"
								src={preview}
							/>
						)}
					</div>

					<div className="flex gap-4 w-full">
						<button
							disabled={preview === ""}
							type="button"
							className={`flex-1 h-14 rounded-xl border-2 border-neutral-05 text-neutral-05 font-medium
								${preview === "" ? "bg-neutral-50 cursor-not-allowed" : "bg-main-05 hover:bg-main-10"}`}
							onClick={() => {
								void downloadPng();
							}}
						>
							PNG
						</button>
						<button
							disabled={preview === ""}
							type="button"
							className={`flex-1 h-14 rounded-xl border-2 border-neutral-05 text-neutral-05 font-medium
								${preview === "" ? "bg-neutral-50 cursor-not-allowed" : "bg-main-05 hover:bg-main-10"}`}
							onClick={() => {
								void downloadSvg();
							}}
						>
							SVG
						</button>
					</div>
				</div>
			</div>

			<PageGuideSection path="/qr-code" />
		</Content>
	);
};
