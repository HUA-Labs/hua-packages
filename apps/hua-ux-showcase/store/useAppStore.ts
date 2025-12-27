import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
  language: 'ko' | 'en';
  setLanguage: (lang: 'ko' | 'en') => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      language: 'ko',
      setLanguage: (lang) => set({ language: lang }),
    }),
    {
      name: 'hua-ux-showcase-storage',
      partialize: (state) => ({ language: state.language }),
    }
  )
);
