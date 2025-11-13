import React from 'react';
import { render } from '../utils/testUtils';
import { TodayScreen } from '@screens/TodayScreen';
import { useUserStateStore } from '@store/slices/userStateSlice';
import { OnboardingScreen } from '@screens/today/OnboardingScreen';
import { CreatePlanEmptyState } from '@screens/today/CreatePlanEmptyState';
import { GenerationScreen } from '@screens/today/GenerationScreen';
import { RegenerationScreen } from '@screens/today/RegenerationScreen';
import { OfflineScreen } from '@screens/today/OfflineScreen';
import { ErrorScreen } from '@screens/today/ErrorScreen';

// Mock the sub-screen components to verify they're rendered
jest.mock('@screens/today/OnboardingScreen', () => ({
  OnboardingScreen: () => null,
}));
jest.mock('@screens/today/CreatePlanEmptyState', () => ({
  CreatePlanEmptyState: () => null,
}));
jest.mock('@screens/today/GenerationScreen', () => ({
  GenerationScreen: () => null,
}));
jest.mock('@screens/today/RegenerationScreen', () => ({
  RegenerationScreen: () => null,
}));
jest.mock('@screens/today/OfflineScreen', () => ({
  OfflineScreen: () => null,
}));
jest.mock('@screens/today/ErrorScreen', () => ({
  ErrorScreen: () => null,
}));

// Mock the stores
jest.mock('@store', () => ({
  useUserStateStore: jest.fn(),
  useLessonsStore: jest.fn(() => ({
    dailyLesson: null,
    nextUpQueue: [],
    setDailyLesson: jest.fn(),
    addToQueue: jest.fn(),
  })),
  usePlansStore: jest.fn(() => ({
    weeklyGoal: null,
    getWeeklyProgress: jest.fn(() => ({ lessons: 0, minutes: 0, percentage: 0 })),
    learningHistory: [],
  })),
  useUserStore: jest.fn(() => ({
    userProfile: null,
  })),
}));

// Mock navigation
jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(() => ({
    navigate: jest.fn(),
  })),
}));

// Mock services
jest.mock('@services/api/lessonService', () => ({
  lessonService: {
    getDailyLesson: jest.fn(),
    getLessonQueue: jest.fn(),
  },
}));

jest.mock('@services/api/plansService', () => ({
  plansService: {
    getStreakData: jest.fn(),
  },
}));

describe('TodayScreen', () => {
  const mockUseUserStateStore = useUserStateStore as jest.MockedFunction<
    typeof useUserStateStore
  >;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders OnboardingScreen when isFirstTime is true', () => {
    mockUseUserStateStore.mockReturnValue({
      isFirstTime: jest.fn(() => true),
      isMissingPlan: jest.fn(() => false),
      isGeneratingLessons: jest.fn(() => false),
      isReturning: jest.fn(() => false),
      isActive: jest.fn(() => false),
      isOfflineMode: jest.fn(() => false),
      isError: jest.fn(() => false),
    } as any);

    const { UNSAFE_getAllByType } = render(<TodayScreen />);
    expect(UNSAFE_getAllByType(OnboardingScreen)).toHaveLength(1);
  });

  it('renders CreatePlanEmptyState when isMissingPlan is true', () => {
    mockUseUserStateStore.mockReturnValue({
      isFirstTime: jest.fn(() => false),
      isMissingPlan: jest.fn(() => true),
      isGeneratingLessons: jest.fn(() => false),
      isReturning: jest.fn(() => false),
      isActive: jest.fn(() => false),
      isOfflineMode: jest.fn(() => false),
      isError: jest.fn(() => false),
    } as any);

    const { UNSAFE_getAllByType } = render(<TodayScreen />);
    expect(UNSAFE_getAllByType(CreatePlanEmptyState)).toHaveLength(1);
  });

  it('renders GenerationScreen when isGeneratingLessons is true', () => {
    mockUseUserStateStore.mockReturnValue({
      isFirstTime: jest.fn(() => false),
      isMissingPlan: jest.fn(() => false),
      isGeneratingLessons: jest.fn(() => true),
      isReturning: jest.fn(() => false),
      isActive: jest.fn(() => false),
      isOfflineMode: jest.fn(() => false),
      isError: jest.fn(() => false),
    } as any);

    const { UNSAFE_getAllByType } = render(<TodayScreen />);
    expect(UNSAFE_getAllByType(GenerationScreen)).toHaveLength(1);
  });

  it('renders RegenerationScreen when isReturning is true', () => {
    mockUseUserStateStore.mockReturnValue({
      isFirstTime: jest.fn(() => false),
      isMissingPlan: jest.fn(() => false),
      isGeneratingLessons: jest.fn(() => false),
      isReturning: jest.fn(() => true),
      isActive: jest.fn(() => false),
      isOfflineMode: jest.fn(() => false),
      isError: jest.fn(() => false),
    } as any);

    const { UNSAFE_getAllByType } = render(<TodayScreen />);
    expect(UNSAFE_getAllByType(RegenerationScreen)).toHaveLength(1);
  });

  it('renders OfflineScreen when isOfflineMode is true', () => {
    mockUseUserStateStore.mockReturnValue({
      isFirstTime: jest.fn(() => false),
      isMissingPlan: jest.fn(() => false),
      isGeneratingLessons: jest.fn(() => false),
      isReturning: jest.fn(() => false),
      isActive: jest.fn(() => false),
      isOfflineMode: jest.fn(() => true),
      isError: jest.fn(() => false),
    } as any);

    const { UNSAFE_getAllByType } = render(<TodayScreen />);
    expect(UNSAFE_getAllByType(OfflineScreen)).toHaveLength(1);
  });

  it('renders ErrorScreen when isError is true', () => {
    mockUseUserStateStore.mockReturnValue({
      isFirstTime: jest.fn(() => false),
      isMissingPlan: jest.fn(() => false),
      isGeneratingLessons: jest.fn(() => false),
      isReturning: jest.fn(() => false),
      isActive: jest.fn(() => false),
      isOfflineMode: jest.fn(() => false),
      isError: jest.fn(() => true),
    } as any);

    const { UNSAFE_getAllByType } = render(<TodayScreen />);
    expect(UNSAFE_getAllByType(ErrorScreen)).toHaveLength(1);
  });

  it('renders TodayScreenContent when isActive is true', () => {
    mockUseUserStateStore.mockReturnValue({
      isFirstTime: jest.fn(() => false),
      isMissingPlan: jest.fn(() => false),
      isGeneratingLessons: jest.fn(() => false),
      isReturning: jest.fn(() => false),
      isActive: jest.fn(() => true),
      isOfflineMode: jest.fn(() => false),
      isError: jest.fn(() => false),
    } as any);

    const { getByText } = render(<TodayScreen />);
    // TodayScreenContent should render "For You" header
    expect(getByText('For You')).toBeTruthy();
  });

  it('prioritizes isFirstTime over other states', () => {
    mockUseUserStateStore.mockReturnValue({
      isFirstTime: jest.fn(() => true),
      isMissingPlan: jest.fn(() => true),
      isGeneratingLessons: jest.fn(() => true),
      isReturning: jest.fn(() => true),
      isActive: jest.fn(() => true),
      isOfflineMode: jest.fn(() => true),
      isError: jest.fn(() => true),
    } as any);

    const { UNSAFE_getAllByType } = render(<TodayScreen />);
    expect(UNSAFE_getAllByType(OnboardingScreen)).toHaveLength(1);
  });

  it('prioritizes isMissingPlan over later states', () => {
    mockUseUserStateStore.mockReturnValue({
      isFirstTime: jest.fn(() => false),
      isMissingPlan: jest.fn(() => true),
      isGeneratingLessons: jest.fn(() => true),
      isReturning: jest.fn(() => true),
      isActive: jest.fn(() => true),
      isOfflineMode: jest.fn(() => true),
      isError: jest.fn(() => true),
    } as any);

    const { UNSAFE_getAllByType } = render(<TodayScreen />);
    expect(UNSAFE_getAllByType(CreatePlanEmptyState)).toHaveLength(1);
  });
});

