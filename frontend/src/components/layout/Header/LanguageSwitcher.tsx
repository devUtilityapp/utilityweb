import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import type { FunctionComponent } from "../../../common/types";
import {
	LANGUAGES,
	LANGUAGE_NAMES,
	LANGUAGE_TAGS,
	localizePath,
} from "../../../common/languages";
import { useLanguagePath } from "../../../hooks/useLanguage";

/**
 * 지금 보고 있는 페이지의 다른 언어판으로 넘어간다.
 * 언어만 바꾸고 페이지는 그대로 두는 것이 핵심이라 첫 화면으로 보내지 않는다.
 *
 * 네 개를 나란히 두면 좁은 화면에서 글자가 세로로 눌리므로 목록으로 접어 둔다.
 * 접혀 있어도 각 항목은 진짜 링크라서 새 탭으로 열거나 주소를 복사할 수 있다.
 */
export const LanguageSwitcher = (): FunctionComponent => {
	const { t } = useTranslation();
	const { language, path } = useLanguagePath();
	const [open, setOpen] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);

	// 바깥을 누르거나 Esc를 누르면 닫는다. 열려 있을 때만 듣는다.
	useEffect(() => {
		if (!open) return;

		const closeOnOutside = (event: MouseEvent): void => {
			if (!containerRef.current?.contains(event.target as Node)) {
				setOpen(false);
			}
		};
		const closeOnEscape = (event: KeyboardEvent): void => {
			if (event.key === "Escape") setOpen(false);
		};

		document.addEventListener("mousedown", closeOnOutside);
		document.addEventListener("keydown", closeOnEscape);
		return (): void => {
			document.removeEventListener("mousedown", closeOnOutside);
			document.removeEventListener("keydown", closeOnEscape);
		};
	}, [open]);

	return (
		<div ref={containerRef} className="relative shrink-0">
			<button
				aria-expanded={open}
				aria-haspopup="menu"
				aria-label={t("nav.language")}
				type="button"
				className="flex items-center gap-1.5 h-9 px-2 lg:px-3 rounded-lg border border-neutral-50
					text-neutral-10 hover:text-neutral-05 hover:border-neutral-15 transition-colors"
				onClick={() => {
					setOpen(!open);
				}}
			>
				<svg
					aria-hidden="true"
					fill="none"
					height="16"
					viewBox="0 0 20 20"
					width="16"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM2.5 10h15M10 2.2c3.5 4.3 3.5 11.3 0 15.6M10 2.2c-3.5 4.3-3.5 11.3 0 15.6"
						stroke="currentColor"
						strokeLinecap="round"
						strokeWidth="1.4"
					/>
				</svg>
				<span className="text-sm font-medium whitespace-nowrap">
					{LANGUAGE_NAMES[language]}
				</span>
				<svg
					aria-hidden="true"
					className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
					fill="none"
					height="14"
					viewBox="0 0 20 20"
					width="14"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						d="M5.5 8L10 12.5L14.5 8"
						stroke="currentColor"
						strokeLinecap="round"
						strokeWidth="1.6"
					/>
				</svg>
			</button>

			{open && (
				<div
					role="menu"
					className="absolute right-0 top-full mt-2 min-w-[140px] rounded-xl border border-neutral-50
						bg-main-10 shadow-lg overflow-hidden z-50"
				>
					{LANGUAGES.map((option) => (
						<Link
							key={option}
							hrefLang={LANGUAGE_TAGS[option]}
							role="menuitem"
							// 경로를 실행 중에 조합하므로 라우터가 만든 경로 타입과 맞지 않는다.
							to={localizePath(path, option) as never}
							className={`block px-4 py-2.5 text-sm whitespace-nowrap transition-colors ${
								option === language
									? "text-neutral-00 font-medium bg-main-05"
									: "text-neutral-10 hover:text-neutral-05 hover:bg-main-05"
							}`}
							onClick={() => {
								setOpen(false);
							}}
						>
							{LANGUAGE_NAMES[option]}
						</Link>
					))}
				</div>
			)}
		</div>
	);
};
