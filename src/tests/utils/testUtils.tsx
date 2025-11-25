import React from 'react';
import { render, RenderOptions } from '@testing-library/react-native';
import { ThemeProvider } from '@designSystem/ThemeProvider';
import { NavigationContainer } from '@react-navigation/native';

interface AllTheProvidersProps {
  children: React.ReactNode;
}

const AllTheProviders: React.FC<AllTheProvidersProps> = ({ children }) => {
  return (
    <ThemeProvider>
      <NavigationContainer>{children}</NavigationContainer>
    </ThemeProvider>
  );
};

const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react-native';
export { customRender as render };

// Mock store helpers
export const createMockStore = () => {
  return {
    user: {
      userProfile: null,
      preferences: {
        notificationsEnabled: true,
        audioSpeed: 1.0,
        autoPlay: false,
      },
    },
    lessons: {
      dailyLesson: null,
      nextUpQueue: [],
      completedLessons: [],
    },
    plans: {
      learningHistory: [],
      weeklyGoal: null,
      streak: {
        current: 0,
        longest: 0,
        lastActiveDate: '',
      },
      kpis: {
        totalTimeLearned: 0,
        totalLessonsCompleted: 0,
        currentStreak: 0,
        longestStreak: 0,
      },
    },
    ui: {
      isLoading: false,
      activeModal: null,
      activeTab: 'today' as const,
      audioState: {
        isPlaying: false,
        position: 0,
        duration: 0,
      },
    },
  };
};

// Mock navigation helpers
export const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  setParams: jest.fn(),
  dispatch: jest.fn(),
  reset: jest.fn(),
  isFocused: jest.fn(() => true),
  canGoBack: jest.fn(() => true),
  getParent: jest.fn(),
  getState: jest.fn(),
  setOptions: jest.fn(),
  addListener: jest.fn(),
  removeListener: jest.fn(),
};

export const mockRoute = {
  key: 'test-route',
  name: 'Test',
  params: {},
};









