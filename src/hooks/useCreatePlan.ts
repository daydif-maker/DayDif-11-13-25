import { useState, useCallback } from 'react';
import { useAuthStore } from '@store';
import { usePlansStore } from '@store';
import { useUserStateStore } from '@store';
import { planService } from '@services/api/planService';
import { profileService } from '@services/api/profileService';
import { lessonService } from '@services/api/lessonService';
import { useLessonsStore } from '@store';

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
    if (!isFormValid || isSubmitting || !user?.id) return;

    try {
      setIsSubmitting(true);
      setError(null);

      const userId = user.id;

      // Save learning preferences
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
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to create plan';
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

