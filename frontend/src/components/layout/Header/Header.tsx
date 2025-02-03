import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import type { FunctionComponent } from "../../../common/types";

export const Header = (): FunctionComponent => {
	const { i18n } = useTranslation();

	const changeLanguage = async (lang: string): Promise<void> => {
		await i18n.changeLanguage(lang);
	};

	return (
		<header className="fixed top-0 left-0 right-0 bg-white shadow-md">
			<div className="container mx-auto px-4">
				<div className="flex justify-between items-center h-16">
					{/* 로고 및 네비게이션 */}
					<div className="flex items-center space-x-8">
						<Link className="text-xl font-bold text-blue-600" to="/">
							Logo
						</Link>
						<nav className="hidden md:flex space-x-4">
							<Link
								activeProps={{ className: "text-blue-600 font-semibold" }}
								className="text-gray-600 hover:text-blue-600 transition-colors"
								to="/"
							>
								Home
							</Link>
							<Link
								activeProps={{ className: "text-blue-600 font-semibold" }}
								className="text-gray-600 hover:text-blue-600 transition-colors"
								to="/youtube-downloader"
							>
								Youtube Downloader
							</Link>
						</nav>
					</div>

					{/* 언어 선택 버튼 */}
					<div className="flex gap-2">
						<button
							type="button"
							className={`px-3 py-1 rounded text-sm ${
								i18n.resolvedLanguage === "ko"
									? "bg-blue-500 text-white"
									: "bg-gray-100 text-gray-600"
							}`}
							onClick={() => changeLanguage("ko")}
						>
							한국어
						</button>
						<button
							type="button"
							className={`px-3 py-1 rounded text-sm ${
								i18n.resolvedLanguage === "en"
									? "bg-blue-500 text-white"
									: "bg-gray-100 text-gray-600"
							}`}
							onClick={() => changeLanguage("en")}
						>
							English
						</button>
					</div>
				</div>
			</div>
		</header>
	);
};
