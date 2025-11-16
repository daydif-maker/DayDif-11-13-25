import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { Lesson, LearningHistoryEntry } from '../types';

interface OnboardingData {
  goal?: string;
  minutesPerDay?: number;
  daysPerWeek?: number;
  lessonLength?: number;
  difficulty?: string;
  audioStyle?: string;
}

interface UserStateState {
  // Persisted state
  hasSeenOnboarding: boolean;
  activePlanId: string | null;
  onboardingData: OnboardingData;

  // Ephemeral state
  lessons: Lesson[] | null;
  history: LearningHistoryEntry[];
  todayLesson: Lesson | null;
  isGenerating: boolean;
  isOffline: boolean;
  error: string | null;

  // Actions
  setHasSeenOnboarding: (seen: boolean) => void;
  setActivePlanId: (planId: string | null) => void;
  setOnboardingData: (data: Partial<OnboardingData>) => void;
  clearOnboardingData: () => void;
  setLessons: (lessons: Lesson[] | null) => void;
  setHistory: (history: LearningHistoryEntry[]) => void;
  setTodayLesson: (lesson: Lesson | null) => void;
  setIsGenerating: (generating: boolean) => void;
  setIsOffline: (offline: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => Promise<void>;

  // Computed selectors
  isFirstTime: () => boolean;
  hasPlan: () => boolean;
  isMissingPlan: () => boolean;
  isGeneratingLessons: () => boolean;
  isActive: () => boolean;
  isReturning: () => boolean;
  isOfflineMode: () => boolean;
  isError: () => boolean;
}

// NetInfo listener reference for cleanup
let netInfoUnsubscribe: (() => void) | null = null;

const initializeNetInfo = (setIsOffline: (offline: boolean) => void) => {
  // Initial state check
  NetInfo.fetch().then((state: NetInfoState) => {
    setIsOffline(!state.isConnected);
  });

  // Subscribe to network state changes
  netInfoUnsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
    setIsOffline(!state.isConnected);
  });
};

export const useUserStateStore = create<UserStateState>()(
  persist(
    (set, get) => {
      // Initialize NetInfo listener
      initializeNetInfo((offline: boolean) => {
        set({ isOffline: offline });
      });

      return {
        // Initial state
        hasSeenOnboarding: false,
        activePlanId: null,
        onboardingData: {},
        lessons: null,
        history: [],
        todayLesson: null,
        isGenerating: false,
        isOffline: false,
        error: null,

        // Actions
        setHasSeenOnboarding: (seen: boolean) => set({ hasSeenOnboarding: seen }),
        setActivePlanId: (planId: string | null) => set({ activePlanId: planId }),
        setOnboardingData: (data: Partial<OnboardingData>) =>
          set((state) => ({
            onboardingData: { ...state.onboardingData, ...data },
          })),
        clearOnboardingData: () => set({ onboardingData: {} }),
        setLessons: (lessons: Lesson[] | null) => set({ lessons }),
        setHistory: (history: LearningHistoryEntry[]) => set({ history }),
        setTodayLesson: (lesson: Lesson | null) => set({ todayLesson: lesson }),
        setIsGenerating: (generating: boolean) => set({ isGenerating: generating }),
        setIsOffline: (offline: boolean) => set({ isOffline: offline }),
        setError: (error: string | null) => set({ error }),
        reset: async () => {
          // Reset all state to default values
          set({
            hasSeenOnboarding: false,
            activePlanId: null,
            onboardingData: {},
            lessons: null,
            history: [],
            todayLesson: null,
            isGenerating: false,
            error: null,
            // Note: isOffline is managed by NetInfo, so we don't reset it here
          });
          // Clear persisted storage
          await AsyncStorage.removeItem('user-state-storage');
        },

        // Computed selectors
        isFirstTime: () => !get().hasSeenOnboarding,
        hasPlan: () => !!get().activePlanId,
        isMissingPlan: () => get().hasSeenOnboarding && !get().activePlanId,
        isGeneratingLessons: () => get().isGenerating,
        isActive: () => {
          const state = get();
          return (
            !!state.activePlanId &&
            !!state.todayLesson &&
            !state.isGenerating &&
            !state.isOffline &&
            !state.error
          );
        },
        isReturning: () => {
          const state = get();
          return (
            !!state.activePlanId &&
            state.history.length > 0 &&
            !state.todayLesson &&
            !state.isGenerating
          );
        },
        isOfflineMode: () => get().isOffline,
        isError: () => !!get().error,
      };
    },
    {
      name: 'user-state-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        hasSeenOnboarding: state.hasSeenOnboarding,
        activePlanId: state.activePlanId,
        onboardingData: state.onboardingData,
      }),
    }
  )
);

// Cleanup NetInfo listener when store is destroyed (for testing)
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'test') {
  // In test environment, allow manual cleanup
  (useUserStateStore as unknown as { cleanup?: () => void }).cleanup = () => {
    if (netInfoUnsubscribe) {
      netInfoUnsubscribe();
      netInfoUnsubscribe = null;
    }
  };
}

