import { create } from 'zustand';

interface UIState {
  theme: 'light' | 'dark' | 'system';
  mobileMenuOpen: boolean;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  toggleMobileMenu: () => void;
  setMobileMenuOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  theme: 'system',
  mobileMenuOpen: false,

  setTheme: (theme) => set({ theme }),
  toggleMobileMenu: () =>
    set((state) => ({ mobileMenuOpen: !state.mobileMenuOpen })),
  setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),
}));
