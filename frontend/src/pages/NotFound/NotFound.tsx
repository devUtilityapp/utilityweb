import { useTranslation } from "react-i18next";
import type { FunctionComponent } from "../../common/types";
import { LocalizedLink } from "../../components/ui/LocalizedLink";

/** 어떤 경로에도 맞지 않을 때 보여 주는 화면. */
export const NotFound = (): FunctionComponent => {
	const { t } = useTranslation();

	return (
		<div className="flex flex-col items-center justify-center gap-6 text-center min-h-[50vh]">
			<div className="text-neutral-50 text-6xl lg:text-8xl font-medium">
				{t("notFound.code")}
			</div>
			<h1 className="text-neutral-05 text-2xl lg:text-3xl font-medium">
				{t("notFound.title")}
			</h1>
			<p className="text-neutral-15 max-w-md leading-relaxed">
				{t("notFound.lead")}
			</p>

			<div className="flex flex-wrap gap-4 justify-center mt-2">
				<LocalizedLink
					to="/tools"
					className="h-12 px-6 flex items-center rounded-xl border-2 border-neutral-05
						bg-main-05 hover:bg-main-10 text-neutral-05 font-medium transition-colors"
				>
					{t("notFound.browse")}
				</LocalizedLink>
				<LocalizedLink
					to="/"
					className="h-12 px-6 flex items-center rounded-xl border border-neutral-50
						text-neutral-10 hover:text-neutral-05 transition-colors"
				>
					{t("notFound.home")}
				</LocalizedLink>
			</div>
		</div>
	);
};
