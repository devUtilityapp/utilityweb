import { useTranslation } from "react-i18next";
import type { FunctionComponent } from "../../../common/types";
import { LocalizedLink } from "../../ui/LocalizedLink";
import { NavItem } from "./HeaderItem/NavItem";
import { LanguageSwitcher } from "./LanguageSwitcher";

export const Header = (): FunctionComponent => {
	const { t } = useTranslation();

	return (
		<header
			className="flex fixed top-0 left-0 right-0 px-8 lg:px-10 bg-main-00 shadow-md w-full z-40"
			id="header"
		>
			<div className="flex lg:px-5 border-b border-neutral-50 w-full">
				<div className="flex justify-between items-center h-16 w-full">
					{/* 로고 및 네비게이션 */}
					<div className="flex items-center space-x-8">
						<LocalizedLink className="flex items-center gap-5" to="/">
							<svg
								fill="none"
								height="18"
								viewBox="0 0 12 18"
								width="12"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									d="M6 0V0C9.31371 0 12 2.68629 12 6V12H6V0Z"
									fill="#F7F7F7"
								/>
								<path
									d="M0 6H6V18V18C2.68629 18 0 15.3137 0 12V6Z"
									fill="#F7F7F7"
								/>
								<path
									d="M6 12H12C12 12 8.40806 11.5919 7 13C5.59194 14.4081 6 18 6 18V12Z"
									fill="#F7F7F7"
								/>
							</svg>
							<div className="text-2xl text-neutral-05">Utility web</div>
						</LocalizedLink>
					</div>

					<nav className="gap-7 flex">
						<div className="flex gap-8 text-lg font-semibold">
							<NavItem name={t("nav.home")} to="/" />
							<NavItem name={t("nav.tools")} to="/tools" />
						</div>
					</nav>
					<LanguageSwitcher />
				</div>
			</div>
		</header>
	);
};
