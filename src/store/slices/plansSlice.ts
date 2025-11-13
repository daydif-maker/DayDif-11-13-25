import { create } from 'zustand';
import { LearningHistoryEntry, WeeklyGoal, Streak, KPIs } from '../types';

interface PlansState {
  learningHistory: LearningHistoryEntry[];
  weeklyGoal: WeeklyGoal | null;
  streak: Streak;
  kpis: KPIs;
  addHistoryEntry: (entry: LearningHistoryEntry) => void;
  updateGoal: (goal: Partial<WeeklyGoal>) => void;
  updateStreak: (streak: Partial<Streak>) => void;
  updateKPIs: (kpis: Partial<KPIs>) => void;
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

export const usePlansStore = create<PlansState>(set => ({
  learningHistory: [],
  weeklyGoal: null,
  streak: defaultStreak,
  kpis: defaultKPIs,
  addHistoryEntry: entry =>
    set(state => {
      const existingIndex = state.learningHistory.findIndex(
        e => e.date === entry.date
      );
      if (existingIndex >= 0) {
        // Update existing entry
        const updated = [...state.learningHistory];
        updated[existingIndex] = entry;
        return { learningHistory: updated };
      }
      // Add new entry
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
  getHistoryByDate: date => {
    const state = usePlansStore.getState();
    return state.learningHistory.find(e => e.date === date) || null;
  },
  getWeeklyProgress: () => {
    const state = usePlansStore.getState();
    if (!state.weeklyGoal) {
      return { lessons: 0, minutes: 0, percentage: 0 };
    }
    const lessonsPercentage =
      state.weeklyGoal.targetLessons > 0
        ? (state.weeklyGoal.currentLessons / state.weeklyGoal.targetLessons) *
          100
        : 0;
    const minutesPercentage =
      state.weeklyGoal.targetMinutes > 0
        ? (state.weeklyGoal.currentMinutes / state.weeklyGoal.targetMinutes) *
          100
        : 0;
    const percentage = (lessonsPercentage + minutesPercentage) / 2;
    return {
      lessons: state.weeklyGoal.currentLessons,
      minutes: state.weeklyGoal.currentMinutes,
      percentage: Math.min(percentage, 100),
    };
  },
  getStreakCount: () => {
    const state = usePlansStore.getState();
    return state.streak.current;
  },
}));


