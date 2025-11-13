import { act } from '@testing-library/react';
import { useUserStateStore } from '@store/slices/userStateSlice';
import NetInfo from '@react-native-community/netinfo';
import { Lesson, LearningHistoryEntry } from '@store/types';

// Mock NetInfo
jest.mock('@react-native-community/netinfo', () => ({
  __esModule: true,
  default: {
    fetch: jest.fn(() => Promise.resolve({ isConnected: true })),
    addEventListener: jest.fn(() => jest.fn()),
  },
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(() => Promise.resolve(null)),
    setItem: jest.fn(() => Promise.resolve()),
    removeItem: jest.fn(() => Promise.resolve()),
  },
}));

const getStoreState = () => useUserStateStore.getState();

const mockLesson: Lesson = {
  id: '1',
  title: 'Test Lesson',
  description: 'Test Description',
  content: 'Test Content',
  duration: 10,
  category: 'Test',
  difficulty: 'beginner',
  completed: false,
  createdAt: new Date().toISOString(),
};

const mockHistoryEntry: LearningHistoryEntry = {
  date: '2024-01-01',
  lessonsCompleted: 1,
  timeSpent: 10,
  lessons: [mockLesson],
};

describe('userStateSlice', () => {
  beforeEach(() => {
    // Reset store before each test
    useUserStateStore.setState({
      hasSeenOnboarding: false,
      activePlanId: null,
      lessons: null,
      history: [],
      todayLesson: null,
      isGenerating: false,
      isOffline: false,
      error: null,
    });
  });

  describe('initial state', () => {
    it('initializes with default state', () => {
      const state = getStoreState();
      expect(state.hasSeenOnboarding).toBe(false);
      expect(state.activePlanId).toBeNull();
      expect(state.lessons).toBeNull();
      expect(state.history).toEqual([]);
      expect(state.todayLesson).toBeNull();
      expect(state.isGenerating).toBe(false);
      expect(state.isOffline).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe('actions', () => {
    it('sets hasSeenOnboarding', () => {
      act(() => {
        useUserStateStore.getState().setHasSeenOnboarding(true);
      });

      const state = getStoreState();
      expect(state.hasSeenOnboarding).toBe(true);
    });

    it('sets activePlanId', () => {
      act(() => {
        useUserStateStore.getState().setActivePlanId('plan-123');
      });

      const state = getStoreState();
      expect(state.activePlanId).toBe('plan-123');
    });

    it('sets lessons', () => {
      act(() => {
        useUserStateStore.getState().setLessons([mockLesson]);
      });

      const state = getStoreState();
      expect(state.lessons).toEqual([mockLesson]);
    });

    it('sets history', () => {
      act(() => {
        useUserStateStore.getState().setHistory([mockHistoryEntry]);
      });

      const state = getStoreState();
      expect(state.history).toEqual([mockHistoryEntry]);
    });

    it('sets todayLesson', () => {
      act(() => {
        useUserStateStore.getState().setTodayLesson(mockLesson);
      });

      const state = getStoreState();
      expect(state.todayLesson).toEqual(mockLesson);
    });

    it('sets isGenerating', () => {
      act(() => {
        useUserStateStore.getState().setIsGenerating(true);
      });

      const state = getStoreState();
      expect(state.isGenerating).toBe(true);
    });

    it('sets isOffline', () => {
      act(() => {
        useUserStateStore.getState().setIsOffline(true);
      });

      const state = getStoreState();
      expect(state.isOffline).toBe(true);
    });

    it('sets error', () => {
      act(() => {
        useUserStateStore.getState().setError('Test error');
      });

      const state = getStoreState();
      expect(state.error).toBe('Test error');
    });

    it('clears error when set to null', () => {
      act(() => {
        useUserStateStore.getState().setError('Test error');
        useUserStateStore.getState().setError(null);
      });

      const state = getStoreState();
      expect(state.error).toBeNull();
    });
  });

  describe('computed selectors', () => {
    it('isFirstTime returns true when hasSeenOnboarding is false', () => {
      useUserStateStore.setState({ hasSeenOnboarding: false });
      expect(getStoreState().isFirstTime()).toBe(true);
    });

    it('isFirstTime returns false when hasSeenOnboarding is true', () => {
      useUserStateStore.setState({ hasSeenOnboarding: true });
      expect(getStoreState().isFirstTime()).toBe(false);
    });

    it('hasPlan returns false when activePlanId is null', () => {
      useUserStateStore.setState({ activePlanId: null });
      expect(getStoreState().hasPlan()).toBe(false);
    });

    it('hasPlan returns true when activePlanId is set', () => {
      useUserStateStore.setState({ activePlanId: 'plan-123' });
      expect(getStoreState().hasPlan()).toBe(true);
    });

    it('isMissingPlan returns true when hasSeenOnboarding is true and no plan', () => {
      useUserStateStore.setState({
        hasSeenOnboarding: true,
        activePlanId: null,
      });
      expect(getStoreState().isMissingPlan()).toBe(true);
    });

    it('isMissingPlan returns false when hasSeenOnboarding is false', () => {
      useUserStateStore.setState({
        hasSeenOnboarding: false,
        activePlanId: null,
      });
      expect(getStoreState().isMissingPlan()).toBe(false);
    });

    it('isMissingPlan returns false when plan exists', () => {
      useUserStateStore.setState({
        hasSeenOnboarding: true,
        activePlanId: 'plan-123',
      });
      expect(getStoreState().isMissingPlan()).toBe(false);
    });

    it('isGeneratingLessons returns true when isGenerating is true', () => {
      useUserStateStore.setState({ isGenerating: true });
      expect(getStoreState().isGeneratingLessons()).toBe(true);
    });

    it('isGeneratingLessons returns false when isGenerating is false', () => {
      useUserStateStore.setState({ isGenerating: false });
      expect(getStoreState().isGeneratingLessons()).toBe(false);
    });

    it('isActive returns true when all conditions are met', () => {
      useUserStateStore.setState({
        activePlanId: 'plan-123',
        todayLesson: mockLesson,
        isGenerating: false,
        isOffline: false,
        error: null,
      });
      expect(getStoreState().isActive()).toBe(true);
    });

    it('isActive returns false when activePlanId is null', () => {
      useUserStateStore.setState({
        activePlanId: null,
        todayLesson: mockLesson,
        isGenerating: false,
        isOffline: false,
        error: null,
      });
      expect(getStoreState().isActive()).toBe(false);
    });

    it('isActive returns false when todayLesson is null', () => {
      useUserStateStore.setState({
        activePlanId: 'plan-123',
        todayLesson: null,
        isGenerating: false,
        isOffline: false,
        error: null,
      });
      expect(getStoreState().isActive()).toBe(false);
    });

    it('isActive returns false when isGenerating is true', () => {
      useUserStateStore.setState({
        activePlanId: 'plan-123',
        todayLesson: mockLesson,
        isGenerating: true,
        isOffline: false,
        error: null,
      });
      expect(getStoreState().isActive()).toBe(false);
    });

    it('isActive returns false when isOffline is true', () => {
      useUserStateStore.setState({
        activePlanId: 'plan-123',
        todayLesson: mockLesson,
        isGenerating: false,
        isOffline: true,
        error: null,
      });
      expect(getStoreState().isActive()).toBe(false);
    });

    it('isActive returns false when error exists', () => {
      useUserStateStore.setState({
        activePlanId: 'plan-123',
        todayLesson: mockLesson,
        isGenerating: false,
        isOffline: false,
        error: 'Test error',
      });
      expect(getStoreState().isActive()).toBe(false);
    });

    it('isReturning returns true when conditions are met', () => {
      useUserStateStore.setState({
        activePlanId: 'plan-123',
        history: [mockHistoryEntry],
        todayLesson: null,
        isGenerating: false,
      });
      expect(getStoreState().isReturning()).toBe(true);
    });

    it('isReturning returns false when no plan', () => {
      useUserStateStore.setState({
        activePlanId: null,
        history: [mockHistoryEntry],
        todayLesson: null,
        isGenerating: false,
      });
      expect(getStoreState().isReturning()).toBe(false);
    });

    it('isReturning returns false when no history', () => {
      useUserStateStore.setState({
        activePlanId: 'plan-123',
        history: [],
        todayLesson: null,
        isGenerating: false,
      });
      expect(getStoreState().isReturning()).toBe(false);
    });

    it('isReturning returns false when todayLesson exists', () => {
      useUserStateStore.setState({
        activePlanId: 'plan-123',
        history: [mockHistoryEntry],
        todayLesson: mockLesson,
        isGenerating: false,
      });
      expect(getStoreState().isReturning()).toBe(false);
    });

    it('isReturning returns false when isGenerating is true', () => {
      useUserStateStore.setState({
        activePlanId: 'plan-123',
        history: [mockHistoryEntry],
        todayLesson: null,
        isGenerating: true,
      });
      expect(getStoreState().isReturning()).toBe(false);
    });

    it('isOfflineMode returns true when isOffline is true', () => {
      useUserStateStore.setState({ isOffline: true });
      expect(getStoreState().isOfflineMode()).toBe(true);
    });

    it('isOfflineMode returns false when isOffline is false', () => {
      useUserStateStore.setState({ isOffline: false });
      expect(getStoreState().isOfflineMode()).toBe(false);
    });

    it('isError returns true when error exists', () => {
      useUserStateStore.setState({ error: 'Test error' });
      expect(getStoreState().isError()).toBe(true);
    });

    it('isError returns false when error is null', () => {
      useUserStateStore.setState({ error: null });
      expect(getStoreState().isError()).toBe(false);
    });
  });

  describe('NetInfo integration', () => {
    it('initializes NetInfo listener on store creation', () => {
      expect(NetInfo.fetch).toHaveBeenCalled();
      expect(NetInfo.addEventListener).toHaveBeenCalled();
    });

    it('updates isOffline when network state changes', () => {
      const unsubscribe = NetInfo.addEventListener as jest.Mock;
      const listener = unsubscribe.mock.calls[0][0];

      act(() => {
        listener({ isConnected: false });
      });

      expect(getStoreState().isOffline).toBe(true);
    });
  });
});

