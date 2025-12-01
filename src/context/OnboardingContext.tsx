import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLessonsStore } from '@store/slices/lessonsSlice';
import { usePlansStore } from '@store/slices/plansSlice';
import { usePlaybackStore } from '@store/slices/playbackSlice';
import { useUserStateStore } from '@store/slices/userStateSlice';
import { AUTH_BYPASS_ENABLED } from '@utils/env';

export type OnboardingState = {
  goal: string;
  motivation: string;
  commuteTimeOfDay: 'Morning' | 'Afternoon' | 'Evening';
  commuteDurationMinutes: number;
  commuteTypes: string[];
  obstacles: string[];
  pace: 'Light' | 'Standard' | 'Fast';
  isCompleted: boolean;
};

const STORAGE_KEY = 'daydif-onboarding-state';
const PERSISTED_STATE_KEYS = [
  STORAGE_KEY,
  'auth-storage',
  'user-state-storage',
  'user-storage',
];

// By default in dev (with auth bypass) we wipe storage on launch so the app always starts at Welcome
// Set EXPO_PUBLIC_FORCE_FRESH_START=false to keep local state, or true to force it in any build
const FORCE_FRESH_START =
  process.env.EXPO_PUBLIC_FORCE_FRESH_START === 'true' ||
  (__DEV__ &&
    AUTH_BYPASS_ENABLED &&
    process.env.EXPO_PUBLIC_FORCE_FRESH_START !== 'false');

const defaultState: OnboardingState = {
  goal: '',
  motivation: '',
  commuteTimeOfDay: 'Morning',
  commuteDurationMinutes: 30,
  commuteTypes: [],
  obstacles: [],
  pace: 'Standard',
  isCompleted: false,
};

type OnboardingContextType = {
  state: OnboardingState;
  updateState: (updates: Partial<OnboardingState>) => void;
  completeOnboarding: () => Promise<void>;
  resetOnboarding: () => Promise<void>;
  isLoading: boolean;
};

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within OnboardingProvider');
  }
  return context;
};

type OnboardingProviderProps = {
  children: ReactNode;
};

const resetAllStores = async () => {
  useLessonsStore.getState().reset();
  usePlansStore.getState().reset();
  usePlaybackStore.getState().reset();
  await useUserStateStore.getState().reset();
};

export const OnboardingProvider: React.FC<OnboardingProviderProps> = ({ children }) => {
  const [state, setState] = useState<OnboardingState>(defaultState);
  const [isLoading, setIsLoading] = useState(true);

  // Load state from storage on mount
  useEffect(() => {
    const loadState = async () => {
      try {
        if (FORCE_FRESH_START) {
          console.log('Force fresh start enabled, clearing persisted app state');
          await AsyncStorage.multiRemove(PERSISTED_STATE_KEYS);
          await resetAllStores();
          setState(defaultState);
          return;
        }

        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          const loadedState = { ...defaultState, ...parsed };
          
          // Validate: if isCompleted is true but critical fields are empty, reset it
          // This handles cases where stale data might mark onboarding as complete
          if (loadedState.isCompleted) {
            const hasRequiredFields = 
              loadedState.goal && 
              loadedState.motivation;
            
            // Also check if there's an active plan - onboarding shouldn't be complete without one
            // We need to wait for userStateStore to rehydrate before checking
            const userStateStorage = await AsyncStorage.getItem('user-state-storage');
            const userState = userStateStorage ? JSON.parse(userStateStorage) : null;
            const hasActivePlan = userState?.state?.activePlanId;
            
            if (!hasRequiredFields || !hasActivePlan) {
              console.log('Onboarding marked as completed but data incomplete or no plan, resetting...', {
                hasRequiredFields,
                hasActivePlan,
              });
              loadedState.isCompleted = false;
            }
          }
          
          // If onboarding is not completed, clear all stores to ensure clean state
          // This handles fresh installs and incomplete onboarding flows
          if (!loadedState.isCompleted) {
            console.log('Onboarding not completed, clearing all stores for clean state...');
            await resetAllStores();
          }
          
          setState(loadedState);
        } else {
          // No stored state means fresh install - ensure stores are clean
          console.log('No onboarding state found, clearing all stores for fresh start...');
          await resetAllStores();
        }
      } catch (error) {
        console.error('Failed to load onboarding state:', error);
        // On error, use default state (which has isCompleted: false)
      } finally {
        setIsLoading(false);
      }
    };

    loadState();
  }, []);

  // Persist state to storage whenever it changes
  useEffect(() => {
    if (!isLoading) {
      const saveState = async () => {
        try {
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        } catch (error) {
          console.error('Failed to save onboarding state:', error);
        }
      };
      saveState();
    }
  }, [state, isLoading]);

  const updateState = (updates: Partial<OnboardingState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  };

  const completeOnboarding = async () => {
    const completedState = { ...state, isCompleted: true };
    setState(completedState);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(completedState));
    } catch (error) {
      console.error('Failed to save completed onboarding state:', error);
    }
  };

  const resetOnboarding = async () => {
    setState(defaultState);
    try {
      await AsyncStorage.multiRemove(PERSISTED_STATE_KEYS);
      
      // Reset all related stores to ensure a clean slate for new users
      await resetAllStores();
    } catch (error) {
      console.error('Failed to reset onboarding state:', error);
    }
  };

  return (
    <OnboardingContext.Provider
      value={{
        state,
        updateState,
        completeOnboarding,
        resetOnboarding,
        isLoading,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
};
