import { create } from 'zustand';
import { LearningHistoryEntry, WeeklyGoal, Streak, KPIs, Plan, Lesson } from '../types';
import { planService } from '@services/api/planService';
import { progressService } from '@services/api/progressService';
import { lessonService } from '@services/api/lessonService';

interface PlansState {
  // State
  learningHistory: LearningHistoryEntry[];
  weeklyGoal: WeeklyGoal | null;
  streak: Streak;
  kpis: KPIs;
  activePlan: Plan | null;
  todayLesson: Lesson | null;
  isLoading: boolean;
  error: string | null;

  // Synchronous actions
  addHistoryEntry: (entry: LearningHistoryEntry) => void;
  updateGoal: (goal: Partial<WeeklyGoal>) => void;
  updateStreak: (streak: Partial<Streak>) => void;
  updateKPIs: (kpis: Partial<KPIs>) => void;
  setActivePlan: (plan: Plan | null) => void;
  setTodayLesson: (lesson: Lesson | null) => void;

  // Async actions
  loadActivePlan: (userId: string) => Promise<void>;
  loadTodayLesson: (userId: string) => Promise<void>;
  loadWeeklyProgress: (userId: string) => Promise<void>;
  loadLearningHistory: (userId: string, startDate: string, endDate: string) => Promise<void>;
  loadStreakData: (userId: string) => Promise<void>;
  loadKPIs: (userId: string) => Promise<void>;
  refreshAll: (userId: string) => Promise<void>;

  // Computed selectors
  getHistoryByDate: (date: string) => LearningHistoryEntry | null;
  getWeeklyProgress: () => { lessons: number; minutes: number; percentage: number };
  getStreakCount: () => number;
}

const defaultStreak: Streak = {
  current: 0,
  longest: 0,
  lastActiveDate: '',
};

const defaultKPIs: KPIs = {
  totalTimeLearned: 0,
  totalLessonsCompleted: 0,
  currentStreak: 0,
  longestStreak: 0,
};

export const usePlansStore = create<PlansState>((set, get) => ({
  // Initial state
  learningHistory: [],
  weeklyGoal: null,
  streak: defaultStreak,
  kpis: defaultKPIs,
  activePlan: null,
  todayLesson: null,
  isLoading: false,
  error: null,

  // Synchronous actions
  addHistoryEntry: entry =>
    set(state => {
      const existingIndex = state.learningHistory.findIndex(
        e => e.date === entry.date
      );
      if (existingIndex >= 0) {
        const updated = [...state.learningHistory];
        updated[existingIndex] = entry;
        return { learningHistory: updated };
      }
      return { learningHistory: [...state.learningHistory, entry] };
    }),

  updateGoal: goal =>
    set(state => ({
      weeklyGoal: state.weeklyGoal
        ? { ...state.weeklyGoal, ...goal }
        : (goal as WeeklyGoal),
    })),

  updateStreak: streakUpdate =>
    set(state => ({
      streak: { ...state.streak, ...streakUpdate },
    })),

  updateKPIs: kpisUpdate =>
    set(state => ({
      kpis: { ...state.kpis, ...kpisUpdate },
    })),

  setActivePlan: plan => set({ activePlan: plan }),
  setTodayLesson: lesson => set({ todayLesson: lesson }),

  // Async actions
  loadActivePlan: async (userId: string) => {
    try {
      set({ isLoading: true, error: null });
      const plan = await planService.getActivePlan(userId);
      set({ activePlan: plan, isLoading: false });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to load active plan';
      set({ error: errorMessage, isLoading: false });
    }
  },

  loadTodayLesson: async (userId: string) => {
    try {
      set({ isLoading: true, error: null });
      const lesson = await lessonService.getDailyLesson(userId);
      set({ todayLesson: lesson, isLoading: false });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to load today lesson';
      set({ error: errorMessage, isLoading: false });
    }
  },

  loadWeeklyProgress: async (userId: string) => {
    try {
      set({ isLoading: true, error: null });
      
      // Get current week start (Monday)
      const today = new Date();
      const dayOfWeek = today.getDay();
      const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Adjust to Monday
      const weekStart = new Date(today.setDate(diff));
      weekStart.setHours(0, 0, 0, 0);
      const weekStartStr = weekStart.toISOString().split('T')[0];

      const goal = await progressService.getWeeklyGoalProgress(userId, weekStartStr);
      if (goal) {
        set({ weeklyGoal: goal, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to load weekly progress';
      set({ error: errorMessage, isLoading: false });
    }
  },

  loadLearningHistory: async (userId: string, startDate: string, endDate: string) => {
    try {
      set({ isLoading: true, error: null });
      const history = await planService.getLearningHistory(userId, startDate, endDate);
      set({ learningHistory: history, isLoading: false });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to load learning history';
      set({ error: errorMessage, isLoading: false });
    }
  },

  loadStreakData: async (userId: string) => {
    try {
      set({ isLoading: true, error: null });
      const streak = await progressService.getStreakData(userId);
      set({ streak, isLoading: false });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to load streak data';
      set({ error: errorMessage, isLoading: false });
    }
  },

  loadKPIs: async (userId: string) => {
    try {
      set({ isLoading: true, error: null });
      const kpis = await progressService.getKPIs(userId);
      set({ kpis, isLoading: false });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to load KPIs';
      set({ error: errorMessage, isLoading: false });
    }
  },

  refreshAll: async (userId: string) => {
    try {
      set({ isLoading: true, error: null });
      await Promise.all([
        get().loadActivePlan(userId),
        get().loadTodayLesson(userId),
        get().loadWeeklyProgress(userId),
        get().loadStreakData(userId),
        get().loadKPIs(userId),
      ]);
      set({ isLoading: false });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to refresh data';
      set({ error: errorMessage, isLoading: false });
    }
  },

  // Computed selectors
  getHistoryByDate: date => {
    const state = get();
    return state.learningHistory.find(e => e.date === date) || null;
  },

  getWeeklyProgress: () => {
    const state = get();
    if (!state.weeklyGoal) {
      return { lessons: 0, minutes: 0, percentage: 0 };
    }
    const lessonsPercentage =
      state.weeklyGoal.targetLessons > 0
        ? (state.weeklyGoal.currentLessons / state.weeklyGoal.targetLessons) * 100
        : 0;
    const minutesPercentage =
      state.weeklyGoal.targetMinutes > 0
        ? (state.weeklyGoal.currentMinutes / state.weeklyGoal.targetMinutes) * 100
        : 0;
    const percentage = (lessonsPercentage + minutesPercentage) / 2;
    return {
      lessons: state.weeklyGoal.currentLessons,
      minutes: state.weeklyGoal.currentMinutes,
      percentage: Math.min(percentage, 100),
    };
  },

  getStreakCount: () => {
    const state = get();
    return state.streak.current;
  },
}));
