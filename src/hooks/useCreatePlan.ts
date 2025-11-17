import { useState, useCallback } from 'react';
import { useAuthStore } from '@store';
import { usePlansStore } from '@store';
import { useUserStateStore } from '@store';
import { planService } from '@services/api/planService';
import { profileService } from '@services/api/profileService';
import { lessonService } from '@services/api/lessonService';
import { useLessonsStore } from '@store';

const USE_MOCK_DATA = process.env.EXPO_PUBLIC_USE_MOCK_DATA !== 'false';

export type DaysPerWeekOption = 2 | 3 | 4 | 5;
export type LessonDurationOption = '8-10' | '10-15' | '15-20';

export interface CreatePlanFormData {
  topicPrompt: string;
  daysPerWeek: DaysPerWeekOption | null;
  lessonDuration: LessonDurationOption | null;
}

export interface UseCreatePlanReturn {
  formData: CreatePlanFormData;
  setFormData: (data: CreatePlanFormData | ((prev: CreatePlanFormData) => CreatePlanFormData)) => void;
  isSubmitting: boolean;
  error: string | null;
  lessonCount: number;
  isFormValid: boolean;
  createPlan: () => Promise<void>;
}

export const useCreatePlan = (): UseCreatePlanReturn => {
  const { user } = useAuthStore();
  const { setActivePlanId, setIsGenerating, setTodayLesson, setLessons } = useUserStateStore();
  const { setDailyLesson, addToQueue, clearQueue } = useLessonsStore();
  const { setActivePlan } = usePlansStore();

  const [formData, setFormData] = useState<CreatePlanFormData>({
    topicPrompt: '',
    daysPerWeek: null,
    lessonDuration: null,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lessonCount = formData.daysPerWeek ? formData.daysPerWeek * 2 : 0;

  const isFormValid =
    formData.topicPrompt.trim().length > 0 &&
    formData.daysPerWeek !== null &&
    formData.lessonDuration !== null;

  const createPlan = useCallback(async () => {
    console.log('createPlan called', { isFormValid, isSubmitting, hasUserId: !!user?.id, formData });
    
    if (!isFormValid) {
      const errorMsg = 'Please fill in all fields before creating a plan';
      console.warn('createPlan: Form validation failed', errorMsg);
      setError(errorMsg);
      return;
    }
    
    if (isSubmitting) {
      console.warn('createPlan: Already submitting');
      return;
    }
    
    // TODO: Bypass authentication check for now - remove this when auth is implemented
    // if (!user?.id) {
    //   const errorMsg = 'You must be logged in to create a plan';
    //   console.warn('createPlan: User not authenticated', errorMsg);
    //   setError(errorMsg);
    //   return;
    // }

    try {
      console.log('createPlan: Starting plan creation...');
      setIsSubmitting(true);
      setError(null);

      // Use user ID if available, otherwise use mock user ID for mock data mode
      const userId = user?.id ?? (USE_MOCK_DATA ? 'mock-user' : undefined);

      if (!userId) {
        const errorMsg = 'You must be logged in to create a plan';
        console.warn('createPlan: User not authenticated', errorMsg);
        setError(errorMsg);
        setIsSubmitting(false);
        return;
      }

      // Save learning preferences only if we have a real user (not mock mode)
      // In mock mode, planService will handle everything with mock data
      if (user?.id && !USE_MOCK_DATA) {
        try {
          await profileService.updateLearningPreferences(userId, {
            primary_goal: formData.topicPrompt.trim(),
            topics: [formData.topicPrompt.trim()],
            lessons_per_week: lessonCount,
            lesson_duration_minutes:
              formData.lessonDuration === '8-10'
                ? 9
                : formData.lessonDuration === '10-15'
                ? 12
                : 17,
            commute_days: [], // Can be set separately
          });
        } catch (prefError) {
          // Log but don't fail plan creation if preferences update fails
          console.warn('Failed to update learning preferences, continuing with plan creation:', prefError);
        }
      }

      // Create plan from preferences
      const plan = await planService.createPlanFromPreferences(userId, {
        topicPrompt: formData.topicPrompt.trim(),
        daysPerWeek: formData.daysPerWeek!,
        lessonDuration: formData.lessonDuration!,
        lessonCount,
      });

      // Set active plan
      setActivePlanId(plan.id);
      setActivePlan(plan);

      // Load today's lesson and queue
      const todayLesson = await lessonService.getDailyLesson(userId);
      const queue = await lessonService.getLessonQueue(userId);

      // Update lessons store
      clearQueue();
      if (todayLesson) {
        setDailyLesson(todayLesson);
        setTodayLesson(todayLesson);
      }
      queue.forEach(lesson => addToQueue(lesson));

      // Set lessons array
      const allLessons = todayLesson ? [todayLesson, ...queue] : queue;
      setLessons(allLessons);

      // Set generating to false
      setIsGenerating(false);

      setIsSubmitting(false);
      console.log('createPlan: Plan created successfully', plan.id);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to create plan';
      console.error('createPlan: Error creating plan', err);
      setError(errorMessage);
      setIsSubmitting(false);
      throw err;
    }
  }, [
    isFormValid,
    isSubmitting,
    user?.id,
    formData,
    lessonCount,
    setActivePlanId,
    setActivePlan,
    setIsGenerating,
    setTodayLesson,
    setLessons,
    setDailyLesson,
    addToQueue,
    clearQueue,
  ]);

  return {
    formData,
    setFormData,
    isSubmitting,
    error,
    lessonCount,
    isFormValid,
    createPlan,
  };
};

