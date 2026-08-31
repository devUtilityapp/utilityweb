import type { defaultNS, resources } from "./common/i18n";

declare module "i18next" {
	interface CustomTypeOptions {
		defaultNS: typeof defaultNS;
		// 영어 리소스가 키의 기준이다. 다른 언어는 빠진 키를 영어로 채운다.
		resources: (typeof resources)["en"];
	}
}
