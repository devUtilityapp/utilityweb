import { create } from "zustand";

type YoutubeStore = {
	currentYoutubeInfo: string;
	setCurrentYoutubeInfo: (info: string) => void;
};

export const useYoutubeStore = create<YoutubeStore>((set) => ({
	currentYoutubeInfo: "",
	setCurrentYoutubeInfo: (info: string): void => {
		set({ currentYoutubeInfo: info });
	},
}));
