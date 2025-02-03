import { useTranslation } from "react-i18next";
import type { FunctionComponent } from "../common/types";

export const Home = (): FunctionComponent => {
	const { t, i18n } = useTranslation();

	const changeLanguage = async (lang: string): Promise<void> => {
		await i18n.changeLanguage(lang);
	};

	return (
		<div className="bg-blue-300 font-bold w-screen h-screen flex flex-col justify-center items-center gap-4">
			<p className="text-white text-6xl">{t("home.greeting")}</p>

			<div className="flex gap-2">
				<button
					type="button"
					className={`px-4 py-2 rounded ${
						i18n.resolvedLanguage === "ko"
							? "bg-blue-500 text-white"
							: "bg-white text-blue-500"
					}`}
					onClick={() => changeLanguage("ko")}
				>
					한국어
				</button>
				<button
					type="button"
					className={`px-4 py-2 rounded ${
						i18n.resolvedLanguage === "en"
							? "bg-blue-500 text-white"
							: "bg-white text-blue-500"
					}`}
					onClick={() => changeLanguage("en")}
				>
					English
				</button>
				<button
					type="button"
					className={`px-4 py-2 rounded ${
						i18n.resolvedLanguage === "es"
							? "bg-blue-500 text-white"
							: "bg-white text-blue-500"
					}`}
					onClick={() => changeLanguage("es")}
				>
					Español
				</button>
			</div>
		</div>
	);
};
