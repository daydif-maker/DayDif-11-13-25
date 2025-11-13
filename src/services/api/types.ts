import { Lesson, UserProfile, UserPreferences, LearningHistoryEntry, KPIs, Streak, WeeklyGoal, Plan } from '@store/types';

// API Response wrappers
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

// Lesson API types
export interface GetDailyLessonResponse {
  lesson: Lesson;
}

export interface GetLessonQueueResponse {
  lessons: Lesson[];
}

export interface GetLessonByIdResponse {
  lesson: Lesson;
}

export interface MarkLessonCompleteRequest {
  lessonId: string;
  completedAt: string;
}

export interface MarkLessonCompleteResponse {
  success: boolean;
}

// User API types
export interface GetUserProfileResponse {
  profile: UserProfile;
}

export interface UpdateUserProfileRequest {
  name?: string;
  email?: string;
  avatarUrl?: string;
}

export interface UpdateUserProfileResponse {
  profile: UserProfile;
}

export interface GetUserPreferencesResponse {
  preferences: UserPreferences;
}

// Plans API types
export interface GetLearningHistoryRequest {
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
}

export interface GetLearningHistoryResponse {
  history: LearningHistoryEntry[];
}

export interface GetKPIsResponse {
  kpis: KPIs;
}

export interface UpdateWeeklyGoalRequest {
  targetLessons: number;
  targetMinutes: number;
  weekStart: string; // YYYY-MM-DD
}

export interface UpdateWeeklyGoalResponse {
  goal: WeeklyGoal;
}

export interface GetStreakDataResponse {
  streak: Streak;
}

export interface CreatePlanRequest {
  topicPrompt: string;
  daysPerWeek: number;
  lessonDuration: '8-10' | '10-15' | '15-20';
  lessonCount: number;
}

export interface CreatePlanResponse {
  plan: Plan;
}


