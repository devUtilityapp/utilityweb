import { create } from "zustand";

export const useProcessLoadingStore = create<{
	processLoading: boolean;
	setProcessLoading: (processLoading: boolean) => void;
}>((set) => ({
	processLoading: false,
	setProcessLoading: (processLoading: boolean): void => {
		set({ processLoading });
	},
}));
