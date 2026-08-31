import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import type { FunctionComponent } from "../../common/types";
import {
	buildEmailPayload,
	buildWifiPayload,
	normalizeUrl,
	type ErrorCorrection,
	type QrContentType,
} from "../../common/qrPayload";
import { findPageSeo } from "../../common/seo";
import { downloadBlob } from "../../common/download";
import { Content } from "../../components/ui/Content";
import { PageGuideSection } from "../../components/ui/PageGuideSection";
import { Select } from "../../components/ui/Select";
import { LabeledField } from "../../components/ui/LabeledField";

const TYPE_LABELS: Record<QrContentType, string> = {
	url: "Link (URL)",
	text: "Plain text",
	wifi: "Wi-Fi network",
	email: "Email",
	tel: "Phone number",
};

const CORRECTION_LABELS: Record<ErrorCorrection, string> = {
	L: "Low (7%)",
	M: "Medium (15%)",
	Q: "Quartile (25%)",
	H: "High (30%)",
};

const ENCRYPTION_LABELS: Record<string, string> = {
	WPA: "WPA / WPA2 / WPA3",
	WEP: "WEP",
	nopass: "Open (no password)",
};

const SIZE_LABELS: Record<string, string> = {
	"256": "256 px",
	"512": "512 px",
	"1024": "1024 px",
	"2048": "2048 px",
};

const labelToValue = <T extends string>(
	labels: Record<T, string>,
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
			toast.success("qr-code.png downloaded");
		} catch (error) {
			console.error(error);
			toast.error("Failed to create the QR code");
		}
	};

	const downloadSvg = async (): Promise<void> => {
		try {
			const { renderQrSvg } = await import("../../common/qrCode");
			const svg = await renderQrSvg({ value: payload, errorCorrection });
			downloadBlob(new Blob([svg], { type: "image/svg+xml" }), "qr-code.svg");
			toast.success("qr-code.svg downloaded");
		} catch (error) {
			console.error(error);
			toast.error("Failed to create the QR code");
		}
	};

	const guide = findPageSeo("/qr-code").guide;

	return (
		<Content categoryName="Generator" title="QR CODE">
			<p className="text-neutral-15 text-sm lg:text-md">
				Make a QR code for a link, text, Wi-Fi network, email or phone number.
				The value is encoded directly, so the code never expires and no one
				counts your scans.
			</p>

			<div className="flex flex-col lg:flex-row gap-10">
				<div className="flex flex-col gap-6 flex-1">
					<LabeledField label="Content">
						<div className="h-12 w-full max-w-[260px]">
							<Select
								currentValue={TYPE_LABELS[contentType]}
								options={Object.values(TYPE_LABELS)}
								width="260px"
								onChange={(value) => {
									setContentType(labelToValue(TYPE_LABELS, value, "url"));
								}}
							/>
						</div>
					</LabeledField>

					{contentType === "url" && (
						<LabeledField label="URL">
							<TextField
								id="qr-url"
								placeholder="example.com/page"
								value={url}
								onChange={setUrl}
							/>
						</LabeledField>
					)}

					{contentType === "text" && (
						<LabeledField label="Text">
							<textarea
								className="w-full h-32 bg-transparent border border-neutral-05 rounded-xl p-3 text-neutral-05 outline-none resize-y"
								id="qr-text"
								placeholder="Anything you want the code to carry"
								value={text}
								onChange={(event) => {
									setText(event.target.value);
								}}
							/>
						</LabeledField>
					)}

					{contentType === "tel" && (
						<LabeledField label="Phone number">
							<TextField
								id="qr-tel"
								placeholder="+82 10 1234 5678"
								value={phone}
								onChange={setPhone}
							/>
						</LabeledField>
					)}

					{contentType === "email" && (
						<>
							<LabeledField label="Address">
								<TextField
									id="qr-email"
									placeholder="hello@example.com"
									type="email"
									value={email.address}
									onChange={(value) => {
										setEmail((previous) => ({ ...previous, address: value }));
									}}
								/>
							</LabeledField>
							<LabeledField label="Subject (optional)">
								<TextField
									id="qr-email-subject"
									placeholder="Hello"
									value={email.subject}
									onChange={(value) => {
										setEmail((previous) => ({ ...previous, subject: value }));
									}}
								/>
							</LabeledField>
							<LabeledField label="Message (optional)">
								<TextField
									id="qr-email-body"
									placeholder="Written for you"
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
							<LabeledField label="Network name (SSID)">
								<TextField
									id="qr-wifi-ssid"
									placeholder="MyNetwork"
									value={wifi.ssid}
									onChange={(value) => {
										setWifi((previous) => ({ ...previous, ssid: value }));
									}}
								/>
							</LabeledField>
							<LabeledField label="Security">
								<div className="h-12 w-full max-w-[260px]">
									<Select
										options={Object.values(ENCRYPTION_LABELS)}
										width="260px"
										currentValue={
											ENCRYPTION_LABELS[wifi.encryption] ?? "WPA / WPA2 / WPA3"
										}
										onChange={(value) => {
											setWifi((previous) => ({
												...previous,
												encryption: labelToValue(
													ENCRYPTION_LABELS,
													value,
													"WPA"
												) as "WPA" | "WEP" | "nopass",
											}));
										}}
									/>
								</div>
							</LabeledField>
							{wifi.encryption !== "nopass" && (
								<LabeledField label="Password">
									<TextField
										id="qr-wifi-password"
										placeholder="Network password"
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
								Hidden network
							</label>
						</>
					)}

					<div className="flex flex-wrap gap-6 items-end">
						<LabeledField label="Error correction">
							<div className="h-12 w-[200px]">
								<Select
									currentValue={CORRECTION_LABELS[errorCorrection]}
									options={Object.values(CORRECTION_LABELS)}
									width="200px"
									onChange={(value) => {
										setErrorCorrection(
											labelToValue(CORRECTION_LABELS, value, "M")
										);
									}}
								/>
							</div>
						</LabeledField>

						<LabeledField label="PNG size">
							<div className="h-12 w-[160px]">
								<Select
									currentValue={SIZE_LABELS[size] ?? "512 px"}
									options={Object.values(SIZE_LABELS)}
									width="160px"
									onChange={(value) => {
										setSize(labelToValue(SIZE_LABELS, value, "512"));
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
								Fill in the fields to see your QR code
							</div>
						) : (
							<img
								alt="QR code preview"
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

			{guide && <PageGuideSection guide={guide} />}
		</Content>
	);
};
