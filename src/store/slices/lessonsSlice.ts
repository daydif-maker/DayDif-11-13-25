import { create } from 'zustand';
import { Lesson, LessonQueue } from '../types';

interface LessonsState {
  dailyLesson: Lesson | null;
  nextUpQueue: Lesson[];
  completedLessons: Lesson[];
  currentLesson: Lesson | null;
  setDailyLesson: (lesson: Lesson | null) => void;
  addToQueue: (lesson: Lesson) => void;
  removeFromQueue: (lessonId: string) => void;
  clearQueue: () => void;
  markComplete: (lessonId: string) => void;
  setCurrentLesson: (lesson: Lesson | null) => void;
  getDailyLesson: () => Lesson | null;
  getNextUp: () => Lesson[];
  getCompletedCount: () => number;
}

export const useLessonsStore = create<LessonsState>(set => ({
  dailyLesson: null,
  nextUpQueue: [],
  completedLessons: [],
  currentLesson: null,
  setDailyLesson: dailyLesson => set({ dailyLesson }),
  addToQueue: lesson =>
    set(state => {
      // Avoid duplicates
      if (state.nextUpQueue.some(l => l.id === lesson.id)) {
        return state;
      }
      return { nextUpQueue: [...state.nextUpQueue, lesson] };
    }),
  removeFromQueue: lessonId =>
    set(state => ({
      nextUpQueue: state.nextUpQueue.filter(l => l.id !== lessonId),
    })),
  clearQueue: () => set({ nextUpQueue: [] }),
  markComplete: lessonId =>
    set(state => {
      const lesson = state.dailyLesson?.id === lessonId
        ? state.dailyLesson
        : state.nextUpQueue.find(l => l.id === lessonId) ||
          state.currentLesson?.id === lessonId
        ? state.currentLesson
        : null;

      if (!lesson) return state;

      const completedLesson: Lesson = {
        ...lesson,
        completed: true,
        completedAt: new Date().toISOString(),
      };

      return {
        completedLessons: [...state.completedLessons, completedLesson],
        nextUpQueue: state.nextUpQueue.filter(l => l.id !== lessonId),
        dailyLesson:
          state.dailyLesson?.id === lessonId ? null : state.dailyLesson,
        currentLesson:
          state.currentLesson?.id === lessonId ? null : state.currentLesson,
      };
    }),
  setCurrentLesson: currentLesson => set({ currentLesson }),
  getDailyLesson: () => {
    const state = useLessonsStore.getState();
    return state.dailyLesson;
  },
  getNextUp: () => {
    const state = useLessonsStore.getState();
    return state.nextUpQueue;
  },
  getCompletedCount: () => {
    const state = useLessonsStore.getState();
    return state.completedLessons.length;
  },
}));


