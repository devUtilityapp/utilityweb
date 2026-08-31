import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

/**
 * 새 버전이 배포되면 알려 준다.
 *
 * 서비스 워커는 새 파일을 내려받아 캐시를 갈아 끼우지만, 이미 열려 있는 탭은
 * 예전 자바스크립트를 그대로 들고 있어서 새로고침 전까지 옛 화면이 보인다.
 * 도구에 파일을 올려 둔 사람의 작업을 날리지 않도록, 강제로 다시 불러오지 않고
 * 새로고침할지 물어본다.
 */
export const useAppUpdate = (): void => {
	const { t } = useTranslation();

	useEffect(() => {
		const container = globalThis.navigator?.serviceWorker;
		// 제어 중인 워커가 없으면 이번이 첫 방문이다. 그때의 제어권 이양은 갱신이 아니다.
		if (!container?.controller) return;

		let notified = false;
		const onControllerChange = (): void => {
			if (notified) return;
			notified = true;

			toast.info(t("update.ready"), {
				autoClose: false,
				closeOnClick: false,
				onClick: () => {
					globalThis.location.reload();
				},
			});
		};

		container.addEventListener("controllerchange", onControllerChange);
		return (): void => {
			container.removeEventListener("controllerchange", onControllerChange);
		};
	}, [t]);
};
