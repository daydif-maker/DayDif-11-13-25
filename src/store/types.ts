// User types
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface UserPreferences {
  notificationsEnabled: boolean;
  audioSpeed: number;
  autoPlay: boolean;
}

// Lesson types
export interface Lesson {
  id: string;
  title: string;
  description: string;
  content: string;
  duration: number; // in minutes
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  completed: boolean;
  completedAt?: string;
  createdAt: string;
}

export interface LessonQueue {
  id: string;
  lessonId: string;
  position: number;
  addedAt: string;
}

// Plans/History types
export interface LearningHistoryEntry {
  date: string; // YYYY-MM-DD format
  lessonsCompleted: number;
  timeSpent: number; // in minutes
  lessons: Lesson[];
}

// Type alias for clarity
export type HistoryEntry = LearningHistoryEntry;

export interface Plan {
  id: string;
  name: string;
  goal: WeeklyGoal;
  topics: string[];
  schedule: {
    frequency: 'daily' | 'weekly';
    daysOfWeek?: number[]; // 0-6, Sunday-Saturday
    timeOfDay?: string; // HH:mm format
  };
  createdAt: string;
  isActive: boolean;
  // New fields for basic plan creation
  topicPrompt?: string; // The exact prompt fed into the LLM
  daysPerWeek?: number; // 2-5 days per week
  lessonDuration?: '5' | '8-10' | '10-15' | '15-20'; // Duration in minutes
  lessonCount?: number; // Derived: daysPerWeek * 2
}

export interface WeeklyGoal {
  targetLessons: number;
  targetMinutes: number;
  currentLessons: number;
  currentMinutes: number;
  weekStart: string; // YYYY-MM-DD
}

export interface Streak {
  current: number;
  longest: number;
  lastActiveDate: string; // YYYY-MM-DD
}

export interface KPIs {
  totalTimeLearned: number; // in minutes
  totalLessonsCompleted: number;
  currentStreak: number;
  longestStreak: number;
}

// UI state types
export interface AudioState {
  isPlaying: boolean;
  currentLessonId?: string;
  position: number; // in seconds
  duration: number; // in seconds
}

export type ModalType = 'settings' | 'goal' | 'avatar' | null;

