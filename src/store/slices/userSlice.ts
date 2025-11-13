import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile, UserPreferences } from '../types';

export type ThemeVariant = 'light' | 'dark' | 'system';

interface UserState {
  userProfile: UserProfile | null;
  preferences: UserPreferences;
  themePreference: ThemeVariant | 'system';
  updateProfile: (profile: Partial<UserProfile>) => void;
  updatePreferences: (preferences: Partial<UserPreferences>) => void;
  setTheme: (theme: ThemeVariant | 'system') => void;
  setUserProfile: (profile: UserProfile) => void;
}

const defaultPreferences: UserPreferences = {
  notificationsEnabled: true,
  audioSpeed: 1.0,
  autoPlay: false,
};

export const useUserStore = create<UserState>()(
  persist(
    set => ({
      userProfile: null,
      preferences: defaultPreferences,
      themePreference: 'system',
      updateProfile: profile =>
        set(state => ({
          userProfile: state.userProfile
            ? { ...state.userProfile, ...profile }
            : null,
        })),
      updatePreferences: preferences =>
        set(state => ({
          preferences: { ...state.preferences, ...preferences },
        })),
      setTheme: themePreference => set({ themePreference }),
      setUserProfile: profile => set({ userProfile: profile }),
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: state => ({
        userProfile: state.userProfile,
        preferences: state.preferences,
        themePreference: state.themePreference,
      }),
    }
  )
);

