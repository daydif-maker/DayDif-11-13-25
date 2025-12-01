/**
 * Shared types for Learning Plan configuration
 * Used by both frontend and backend (Supabase Edge Functions)
 * 
 * This file defines the contract between UI selections and backend processing.
 */

// ============================================================================
// UI Selection Types (Frontend)
// ============================================================================

/**
 * Valid days per week selections
 * Maps to lesson counts: 1→1, 2→4, 3→6, 4→8, 5→10
 */
export type DaysPerWeekOption = 1 | 2 | 3 | 4 | 5;

/**
 * Valid lesson duration selections (string ranges from UI)
 */
export type LessonDurationOption = '5' | '8-10' | '10-15' | '15-20';

// ============================================================================
// Plan Configuration Types
// ============================================================================

/**
 * Typed config object for lesson plan creation
 * This is what the frontend assembles before sending to the backend
 */
export interface LessonPlanConfig {
  topic: string;
  lessonsPerWeek: number;
  minutesPerLesson: number;
}

/**
 * Raw form data from the UI selections
 */
export interface CreatePlanFormData {
  topicPrompt: string;
  daysPerWeek: DaysPerWeekOption | null;
  lessonDuration: LessonDurationOption | null;
  // New fields for exact control
  customLessonCount?: number;
  customDuration?: number;
}

// ============================================================================
// API Request/Response Types
// ============================================================================

/**
 * Request payload sent to the create-plan edge function
 * NOTE: numberOfLessons and durationMinutes are the primary values.
 * daysPerWeek and lessonDuration are passed for metadata/fallback only.
 */
export interface CreatePlanRequest {
  /** The learning topic/prompt */
  topic: string;
  /** Number of lessons to generate (computed from daysPerWeek) */
  numberOfLessons: number;
  /** Duration per lesson in minutes (computed from lessonDuration range) */
  durationMinutes: number;
  /** User expertise level */
  userLevel: 'beginner' | 'intermediate' | 'advanced';
  /** User ID for database relations */
  userId: string;
  /** Original days per week selection (for metadata) */
  daysPerWeek?: number;
  /** Original duration range selection (for metadata) */
  lessonDuration?: LessonDurationOption;
}

/**
 * Response from the create-plan edge function
 */
export interface CreatePlanResponse {
  success: boolean;
  planId?: string;
  lessonCount?: number;
  error?: string;
  lessons?: Array<{
    id: string;
    dayIndex: number;
    title: string;
  }>;
}

// ============================================================================
// Conversion Utilities
// ============================================================================

/**
 * Duration mapping: UI option string → numeric minutes (upper bound)
 * Using upper bound ensures better content quality
 */
export const LESSON_DURATION_MAP: Record<LessonDurationOption, number> = {
  '5': 5,
  '8-10': 10,
  '10-15': 15,
  '15-20': 20,
};

/**
 * Convert days per week to lesson count
 * Formula: 1 day = 1 lesson, 2+ days = days × 2 lessons
 */
export function daysPerWeekToLessonCount(daysPerWeek: DaysPerWeekOption): number {
  return daysPerWeek === 1 ? 1 : daysPerWeek * 2;
}

/**
 * Convert lesson duration option to numeric minutes
 * Uses upper bound of range for better content quality
 */
export function lessonDurationToMinutes(lessonDuration: LessonDurationOption): number {
  return LESSON_DURATION_MAP[lessonDuration];
}

/**
 * Get display label for days per week option
 */
export function getDaysPerWeekLabel(daysPerWeek: DaysPerWeekOption): string {
  const lessonCount = daysPerWeekToLessonCount(daysPerWeek);
  const lessonText = lessonCount === 1 ? 'lesson' : 'lessons';
  return `${daysPerWeek} day${daysPerWeek === 1 ? '' : 's'} (${lessonCount} ${lessonText})`;
}

/**
 * Get display label for lesson duration option
 */
export function getLessonDurationLabel(lessonDuration: LessonDurationOption): string {
  if (lessonDuration === '5') return '5 minutes';
  return `${lessonDuration} minutes`;
}

/**
 * Convert form data to API request format
 * This is the single source of truth for frontend → backend conversion
 */
export function formDataToApiRequest(
  formData: CreatePlanFormData,
  userId: string,
  userLevel: 'beginner' | 'intermediate' | 'advanced' = 'intermediate'
): CreatePlanRequest | null {
  if (!formData.topicPrompt.trim() || !formData.daysPerWeek || !formData.lessonDuration) {
    return null;
  }

  // Prioritize custom values if they exist
  const numberOfLessons = formData.customLessonCount || daysPerWeekToLessonCount(formData.daysPerWeek);
  const durationMinutes = formData.customDuration || lessonDurationToMinutes(formData.lessonDuration);

  return {
    topic: formData.topicPrompt.trim(),
    numberOfLessons,
    durationMinutes,
    userLevel,
    userId,
    daysPerWeek: formData.daysPerWeek,
    lessonDuration: formData.lessonDuration,
  };
}

// ============================================================================
// Validation
// ============================================================================

/** Valid range for lesson count */
export const LESSON_COUNT_RANGE = { min: 1, max: 20 } as const;

/** Valid range for duration in minutes */
export const DURATION_MINUTES_RANGE = { min: 5, max: 30 } as const;

/** Valid lesson duration options */
export const VALID_DURATION_OPTIONS: LessonDurationOption[] = ['5', '8-10', '10-15', '15-20'];

/**
 * Validate a CreatePlanRequest
 * Returns null if valid, or an error message string if invalid
 */
export function validateCreatePlanRequest(request: Partial<CreatePlanRequest>): string | null {
  if (!request.topic || request.topic.trim().length === 0) {
    return 'Topic is required';
  }

  if (typeof request.numberOfLessons !== 'number' || !Number.isFinite(request.numberOfLessons)) {
    return 'numberOfLessons must be a valid number';
  }

  if (request.numberOfLessons < LESSON_COUNT_RANGE.min || request.numberOfLessons > LESSON_COUNT_RANGE.max) {
    return `numberOfLessons must be between ${LESSON_COUNT_RANGE.min} and ${LESSON_COUNT_RANGE.max}`;
  }

  if (typeof request.durationMinutes !== 'number' || !Number.isFinite(request.durationMinutes)) {
    return 'durationMinutes must be a valid number';
  }

  if (request.durationMinutes < DURATION_MINUTES_RANGE.min || request.durationMinutes > DURATION_MINUTES_RANGE.max) {
    return `durationMinutes must be between ${DURATION_MINUTES_RANGE.min} and ${DURATION_MINUTES_RANGE.max}`;
  }

  if (!request.userId || request.userId.trim().length === 0) {
    return 'userId is required';
  }

  return null;
}


