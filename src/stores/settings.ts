'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type TextSize = 'small' | 'medium' | 'large';

interface SettingsState {
  language: string;
  sound: boolean;
  motion: boolean;
  highContrast: boolean;
  textSize: TextSize;
  haptics: boolean;
  setLanguage: (l: string) => void;
  setSound: (v: boolean) => void;
  setMotion: (v: boolean) => void;
  setHighContrast: (v: boolean) => void;
  setTextSize: (v: TextSize) => void;
  setHaptics: (v: boolean) => void;
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      language: 'fa',
      sound: true,
      motion: true,
      highContrast: false,
      textSize: 'medium',
      haptics: true,
      setLanguage: (language) => set({ language }),
      setSound: (sound) => set({ sound }),
      setMotion: (motion) => set({ motion }),
      setHighContrast: (highContrast) => set({ highContrast }),
      setTextSize: (textSize) => set({ textSize }),
      setHaptics: (haptics) => set({ haptics }),
    }),
    { name: 'cq-settings' },
  ),
);
