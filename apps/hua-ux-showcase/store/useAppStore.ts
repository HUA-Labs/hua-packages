import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
  language: string;
  setLanguage: (lang: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      language: 'ko' as string,
      setLanguage: (lang) => set({ language: lang }),
    }),
    {
      name: 'hua-ux-showcase-storage',
      partialize: (state) => ({ language: state.language }),
    }
  )
);
