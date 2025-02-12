import { create } from "zustand";

type SidebarStore = {
	sidebarOpen: boolean;
	setSidebarOpen: (open: boolean) => void;
};

export const useSidebarStore = create<SidebarStore>((set) => ({
	sidebarOpen: false,
	setSidebarOpen: (open: boolean): void => {
		set({ sidebarOpen: open });
	},
}));
