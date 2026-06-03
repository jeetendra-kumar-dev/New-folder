import { create } from "zustand";

type AppState = {
  sidebarOpen: boolean;
  commandPaletteOpen: boolean;
  density: "comfortable" | "compact";
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setCommandPaletteOpen: (open: boolean) => void;
  toggleCommandPalette: () => void;
  setDensity: (density: "comfortable" | "compact") => void;
  toggleDensity: () => void;
};

export const useAppStore = create<AppState>((set) => ({
  sidebarOpen: false,
  commandPaletteOpen: false,
  density: "comfortable",
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
  toggleCommandPalette: () => set((state) => ({ commandPaletteOpen: !state.commandPaletteOpen })),
  setDensity: (density) => set({ density }),
  toggleDensity: () => set((state) => ({ density: state.density === "comfortable" ? "compact" : "comfortable" })),
}));
