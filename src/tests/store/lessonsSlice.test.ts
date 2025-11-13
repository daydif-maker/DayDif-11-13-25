import { act } from '@testing-library/react';
import { useLessonsStore } from '@store/slices/lessonsSlice';
import { Lesson } from '@store/types';

const getStoreState = () => useLessonsStore.getState();

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

describe('lessonsSlice', () => {
  beforeEach(() => {
    useLessonsStore.setState({
      dailyLesson: null,
      nextUpQueue: [],
      completedLessons: [],
      currentLesson: null,
    });
  });

  it('sets daily lesson', () => {
    act(() => {
      useLessonsStore.getState().setDailyLesson(mockLesson);
    });

    const state = getStoreState();
    expect(state.dailyLesson?.id).toBe('1');
  });

  it('adds lesson to queue', () => {
    act(() => {
      useLessonsStore.getState().addToQueue(mockLesson);
    });

    const state = getStoreState();
    expect(state.nextUpQueue).toHaveLength(1);
    expect(state.nextUpQueue[0].id).toBe('1');
  });

  it('does not add duplicate to queue', () => {
    act(() => {
      useLessonsStore.getState().addToQueue(mockLesson);
      useLessonsStore.getState().addToQueue(mockLesson);
    });

    const state = getStoreState();
    expect(state.nextUpQueue).toHaveLength(1);
  });

  it('marks lesson as complete', () => {
    act(() => {
      useLessonsStore.getState().setDailyLesson(mockLesson);
      useLessonsStore.getState().markComplete('1');
    });

    const state = getStoreState();
    expect(state.completedLessons).toHaveLength(1);
    expect(state.completedLessons[0].completed).toBe(true);
    expect(state.dailyLesson).toBeNull();
  });

  it('removes from queue when marked complete', () => {
    act(() => {
      useLessonsStore.getState().addToQueue(mockLesson);
      useLessonsStore.getState().markComplete('1');
    });

    const state = getStoreState();
    expect(state.nextUpQueue).toHaveLength(0);
    expect(state.completedLessons).toHaveLength(1);
  });
});

