import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type OnboardingState = {
  gender: string;
  goal: string;
  motivation: string;
  commuteTimeOfDay: 'Morning' | 'Afternoon' | 'Evening';
  commuteDurationMinutes: number;
  learningStyle: string;
  obstacles: string[];
  pace: 'Light' | 'Standard' | 'Fast';
  isCompleted: boolean;
};

const STORAGE_KEY = 'daydif-onboarding-state';

const defaultState: OnboardingState = {
  gender: '',
  goal: '',
  motivation: '',
  commuteTimeOfDay: 'Morning',
  commuteDurationMinutes: 30,
  learningStyle: '',
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

export const OnboardingProvider: React.FC<OnboardingProviderProps> = ({ children }) => {
  const [state, setState] = useState<OnboardingState>(defaultState);
  const [isLoading, setIsLoading] = useState(true);

  // Load state from storage on mount
  useEffect(() => {
    const loadState = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          const loadedState = { ...defaultState, ...parsed };
          
          // Validate: if isCompleted is true but critical fields are empty, reset it
          // This handles cases where stale data might mark onboarding as complete
          if (loadedState.isCompleted) {
            const hasRequiredFields = 
              loadedState.gender && 
              loadedState.goal && 
              loadedState.motivation && 
              loadedState.learningStyle;
            
            if (!hasRequiredFields) {
              console.log('Onboarding marked as completed but data incomplete, resetting...');
              loadedState.isCompleted = false;
            }
          }
          
          setState(loadedState);
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
      await AsyncStorage.removeItem(STORAGE_KEY);
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

