import { KPIs, Streak, WeeklyGoal } from '@store/types';

export const mockKPIs: KPIs = {
  totalTimeLearned: 1250,
  totalLessonsCompleted: 87,
  currentStreak: 5,
  longestStreak: 12,
};

export const mockStreak: Streak = {
  current: 5,
  longest: 12,
  lastActiveDate: new Date().toISOString().split('T')[0],
};

export const mockWeeklyGoal: WeeklyGoal = {
  targetLessons: 5,
  targetMinutes: 60,
  currentLessons: 3,
  currentMinutes: 42,
  weekStart: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0],
};

export const getMockKPIs = (): KPIs => mockKPIs;

export const getMockStreak = (): Streak => mockStreak;

export const getMockWeeklyGoal = (): WeeklyGoal => mockWeeklyGoal;


