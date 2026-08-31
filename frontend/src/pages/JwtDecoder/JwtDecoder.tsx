import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { FunctionComponent } from "../../common/types";
import {
	canVerify,
	decodeJwt,
	verifyHmac,
	type DecodedJwt,
} from "../../common/jwt";
import { tDynamic } from "../../common/translate";
import { Content } from "../../components/ui/Content";
import { PageGuideSection } from "../../components/ui/PageGuideSection";
import { RelatedTools } from "../../components/ui/RelatedTools";
import { ToolTextArea } from "../../components/ui/ToolTextArea";
import { LabeledField } from "../../components/ui/LabeledField";

type Verification = "idle" | "checking" | "valid" | "invalid" | "unsupported";

export const JwtDecoder = (): FunctionComponent => {
	const { t } = useTranslation();
	const [token, setToken] = useState<string>("");
	const [secret, setSecret] = useState<string>("");
	const [verification, setVerification] = useState<Verification>("idle");
	const [verifyError, setVerifyError] = useState<string>("");

	// 토큰이 바뀌면 앞서 확인한 결과는 더 이상 맞지 않는다.
	const changeToken = (value: string): void => {
		setToken(value);
		setVerification("idle");
		setVerifyError("");
	};

	let decoded: DecodedJwt | null = null;
	let error = "";
	if (token.trim() !== "") {
		try {
			decoded = decodeJwt(token, Date.now());
		} catch (caught) {
			error = caught instanceof Error ? caught.message : t("jwtDecoder.failed");
		}
	}

	const check = (): void => {
		if (!decoded) return;
		if (!canVerify(decoded.algorithm)) {
			setVerification("unsupported");
			return;
		}

		setVerification("checking");
		setVerifyError("");
		verifyHmac(token, secret, decoded.algorithm)
			.then((matched) => {
				setVerification(matched ? "valid" : "invalid");
			})
			.catch((caught: unknown) => {
				setVerification("idle");
				setVerifyError(
					caught instanceof Error ? caught.message : t("jwtDecoder.failed")
				);
			});
	};

	return (
		<Content
			categoryName={t("jwtDecoder.category")}
			title={t("jwtDecoder.title")}
		>
			<p className="text-neutral-15 text-sm lg:text-md">
				{t("jwtDecoder.intro")}
			</p>

			<div className="flex flex-col gap-2">
				<div className="text-neutral-15 text-sm">{t("jwtDecoder.token")}</div>
				<ToolTextArea
					mono
					height="h-[160px]"
					id="jwt-token"
					placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.abc"
					value={token}
					onChange={changeToken}
				/>
			</div>

			{error !== "" && (
				<div className="border border-neutral-05 rounded-xl p-4 text-neutral-05">
					{error}
				</div>
			)}

			{decoded && (
				<>
					<div className="flex flex-wrap gap-4 items-center">
						<span className="text-neutral-15 text-sm">
							{t("jwtDecoder.algorithm")}
						</span>
						<code className="text-neutral-05 font-mono">
							{decoded.algorithm}
						</code>
						{decoded.expired && (
							<span className="text-neutral-05 bg-main-05 border border-neutral-15 rounded-lg px-3 py-1 text-sm">
								{t("jwtDecoder.expired")}
							</span>
						)}
					</div>

					<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
						<div className="flex flex-col gap-2">
							<div className="text-neutral-15 text-sm">
								{t("jwtDecoder.header")}
							</div>
							<ToolTextArea
								mono
								readOnly
								height="h-[200px]"
								id="jwt-header"
								placeholder=""
								value={decoded.header.json}
							/>
						</div>
						<div className="flex flex-col gap-2">
							<div className="text-neutral-15 text-sm">
								{t("jwtDecoder.payload")}
							</div>
							<ToolTextArea
								mono
								readOnly
								height="h-[200px]"
								id="jwt-payload"
								placeholder=""
								value={decoded.payload.json}
							/>
						</div>
					</div>

					{decoded.times.length > 0 && (
						<div className="flex flex-col gap-3">
							<div className="text-neutral-05 font-medium text-xl">
								{t("jwtDecoder.times")}
							</div>
							{decoded.times.map((entry) => (
								<div
									key={entry.claim}
									className="flex items-center gap-4 border border-neutral-50 rounded-xl px-4 py-3"
								>
									<code className="text-neutral-15 w-24 shrink-0">
										{entry.claim}
									</code>
									<span className="text-neutral-05 flex-1 min-w-0 truncate">
										{entry.date.toLocaleString()}
									</span>
									{entry.expired && (
										<span className="text-neutral-15 text-sm shrink-0">
											{t("jwtDecoder.expired")}
										</span>
									)}
								</div>
							))}
						</div>
					)}

					<div className="flex flex-col gap-3">
						<div className="text-neutral-05 font-medium text-xl">
							{t("jwtDecoder.verify")}
						</div>
						<p className="text-neutral-15 text-sm">
							{t("jwtDecoder.verifyHint")}
						</p>
						<div className="flex flex-wrap gap-4 items-end">
							<LabeledField grow label={t("jwtDecoder.secret")}>
								<div className="flex items-center h-12 border border-neutral-05 rounded-xl px-4">
									<input
										className="w-full bg-transparent text-neutral-05 outline-none font-mono"
										id="jwt-secret"
										placeholder={t("jwtDecoder.secretPlaceholder")}
										type="text"
										value={secret}
										onChange={(event) => {
											setSecret(event.target.value);
											setVerification("idle");
										}}
									/>
								</div>
							</LabeledField>
							<button
								disabled={verification === "checking"}
								type="button"
								className={`h-12 px-6 rounded-xl border-2 border-neutral-05 text-neutral-05 font-medium
									${verification === "checking" ? "bg-neutral-50 cursor-not-allowed" : "bg-main-05 hover:bg-main-10"}`}
								onClick={check}
							>
								{t("jwtDecoder.check")}
							</button>
						</div>

						{verification !== "idle" && verification !== "checking" && (
							<div
								className={
									verification === "valid"
										? "text-green-05 font-medium"
										: "text-neutral-05"
								}
							>
								{tDynamic(t, `jwtDecoder.result.${verification}`, {
									algorithm: decoded.algorithm,
								})}
							</div>
						)}
						{verifyError !== "" && (
							<div className="text-neutral-05">{verifyError}</div>
						)}
					</div>
				</>
			)}

			<RelatedTools path="/jwt-decoder" />
			<PageGuideSection path="/jwt-decoder" />
		</Content>
	);
};
