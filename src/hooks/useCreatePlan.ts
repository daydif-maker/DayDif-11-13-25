import { useState, useCallback, useRef, useEffect } from 'react';
import { useAuthStore } from '@store';
import { usePlansStore } from '@store';
import { useUserStateStore } from '@store';
import { planService } from '@services/api/planService';
import { lessonService } from '@services/api/lessonService';
import { ttsService, GenerationStatusResult } from '@services/audio/ttsService';
import { useLessonsStore } from '@store';
import { generateMockLessonsForPlan } from '@services/api/mocks/mockLessons';
import { USE_MOCK_DATA, AUTH_BYPASS_ENABLED, ANONYMOUS_USER_ID } from '@utils/env';
import {
  DaysPerWeekOption,
  LessonDurationOption,
  CreatePlanFormData,
  daysPerWeekToLessonCount,
  lessonDurationToMinutes,
} from '@/types/lessonPlan';

// Re-export types for backward compatibility
export type { DaysPerWeekOption, LessonDurationOption, CreatePlanFormData };

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
  const {
    setActivePlanId,
    setTodayLesson,
    setLessons,
    startGeneration,
    completeGeneration,
    updateGenerationProgress,
  } = useUserStateStore();
  const { setDailyLesson, addToQueue, clearQueue } = useLessonsStore();
  const { setActivePlan, setTodayLesson: setPlansTodayLesson } = usePlansStore();

  const [formData, setFormData] = useState<CreatePlanFormData>({
    topicPrompt: '',
    daysPerWeek: null,
    lessonDuration: null,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Ref to track submission state to avoid stale closure issues
  const isSubmittingRef = useRef(false);

  // Ref to track polling cleanup function
  const pollCleanupRef = useRef<(() => void) | null>(null);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollCleanupRef.current) {
        pollCleanupRef.current();
        pollCleanupRef.current = null;
      }
    };
  }, []);

  // Use shared utility function for consistent lesson count calculation
  // Prioritize custom count if available
  const lessonCount = formData.customLessonCount
    ? formData.customLessonCount
    : formData.daysPerWeek
      ? daysPerWeekToLessonCount(formData.daysPerWeek)
      : 0;

  const isFormValid =
    formData.topicPrompt.trim().length > 0 &&
    (formData.daysPerWeek !== null || (formData.customLessonCount !== undefined && formData.customLessonCount > 0)) &&
    (formData.lessonDuration !== null || (formData.customDuration !== undefined && formData.customDuration > 0));

  const createPlan = useCallback(async () => {
    // Compute validity inside the callback to avoid stale closure issues
    const currentFormValid =
      formData.topicPrompt.trim().length > 0 &&
      (formData.daysPerWeek !== null || (formData.customLessonCount !== undefined && formData.customLessonCount > 0)) &&
      (formData.lessonDuration !== null || (formData.customDuration !== undefined && formData.customDuration > 0));

    console.log('createPlan called', {
      currentFormValid,
      isFormValid,
      isSubmitting,
      hasUserId: !!user?.id,
      formData
    });

    if (!currentFormValid) {
      const errorMsg = 'Please fill in all fields before creating a plan';
      console.warn('createPlan: Form validation failed', {
        topicPrompt: formData.topicPrompt.trim().length > 0,
        daysPerWeek: formData.daysPerWeek,
        lessonDuration: formData.lessonDuration,
      });
      setError(errorMsg);
      return;
    }

    // Use ref to check submission state to avoid stale closure issues
    if (isSubmittingRef.current) {
      console.warn('createPlan: Already submitting (ref check)');
      return;
    }

    try {
      console.log('createPlan: Starting plan creation...');
      isSubmittingRef.current = true;
      setIsSubmitting(true);
      setError(null);

      // Simplified auth: Use real user if available, otherwise use anonymous user ID
      // This allows the app to work without authentication during development
      const userId = user?.id ?? ANONYMOUS_USER_ID;

      console.log('createPlan: Using userId:', userId, {
        isAnonymous: userId === ANONYMOUS_USER_ID,
        authBypass: AUTH_BYPASS_ENABLED,
        mockData: USE_MOCK_DATA
      });

      // Use shared utility for consistent duration calculation
      // This uses the upper bound of the range for better content quality
      // Prioritize custom duration if available
      const durationMinutes = formData.customDuration
        ? formData.customDuration
        : formData.lessonDuration
          ? lessonDurationToMinutes(formData.lessonDuration)
          : 10; // Default fallback (shouldn't happen due to validation)

      console.log('[useCreatePlan] Computed values:', {
        daysPerWeek: formData.daysPerWeek,
        lessonCount,
        lessonDuration: formData.lessonDuration,
        durationMinutes,
      });

      let planId: string;

      // Use ttsService for real backend integration (content generation + TTS)
      // Fall back to planService for mock mode or if ttsService is unavailable
      if (!USE_MOCK_DATA && ttsService.isAvailable()) {
        console.log('createPlan: Using ttsService for backend integration');

        // Use ttsService which creates plan, lessons, and triggers Edge Function
        const result = await ttsService.generatePlan(
          formData.topicPrompt.trim(),
          lessonCount,
          durationMinutes,
          'intermediate', // Use intermediate for more depth/length
          userId,
          {
            daysPerWeek: formData.daysPerWeek || undefined,
            lessonDuration: formData.lessonDuration || undefined,
          }
        );

        if (!result.success || !result.planId) {
          throw new Error(result.error || 'Failed to generate plan');
        }

        planId = result.planId;

        // Set active plan ID and start generation tracking
        setActivePlanId(planId);
        startGeneration(planId, lessonCount);

        // Fetch the created plan from database
        const plan = await planService.getActivePlan(userId);
        if (plan) {
          setActivePlan(plan);
        }

        // Start polling for generation progress
        const handleProgress = (status: GenerationStatusResult) => {
          console.log('[useCreatePlan] Generation progress:', status);
          updateGenerationProgress({
            total: status.total,
            completed: status.completed,
            inProgress: status.inProgress,
            pending: status.pending,
            failed: status.failed,
            currentLessonTitle: status.currentLessonTitle,
          });
        };

        // Start continuous polling
        pollCleanupRef.current = ttsService.pollGenerationStatus(
          planId,
          handleProgress,
          { intervalMs: 3000 }
        );

        // Wait for first lesson to complete
        console.log('createPlan: Waiting for first lesson to complete...');
        const waitResult = await ttsService.waitForFirstLesson(planId, {
          intervalMs: 3000,
          timeoutMs: 300000, // 5 minute timeout
          onProgress: handleProgress,
        });

        // Stop polling when first lesson is ready
        if (pollCleanupRef.current) {
          pollCleanupRef.current();
          pollCleanupRef.current = null;
        }

        if (waitResult.success && waitResult.lesson) {
          console.log('createPlan: First lesson ready:', waitResult.lesson.title);

          // Load today's lesson and queue from API
          const todayLesson = await lessonService.getDailyLesson(userId);
          const queue = await lessonService.getLessonQueue(userId);

          // Update lessons store
          clearQueue();
          if (todayLesson) {
            setDailyLesson(todayLesson);
            setTodayLesson(todayLesson);
            setPlansTodayLesson(todayLesson);
          }
          queue.forEach(lesson => addToQueue(lesson));

          // Set lessons array
          const allLessons = todayLesson ? [todayLesson, ...queue] : queue;
          setLessons(allLessons);

          // Complete generation
          completeGeneration();
        } else {
          // Handle timeout or error - lessons are still generating in background
          console.warn('createPlan: First lesson not ready:', waitResult.error);
          // Don't throw error, just complete generation state
          // User can refresh later to see completed lessons
          completeGeneration();
        }

        isSubmittingRef.current = false;
        setIsSubmitting(false);
        console.log('createPlan: Plan created successfully', planId);

      } else {
        // Mock mode or ttsService unavailable - use planService
        console.log('createPlan: Using planService (mock mode or ttsService unavailable)');

        const plan = await planService.createPlanFromPreferences(userId, {
          topicPrompt: formData.topicPrompt.trim(),
          daysPerWeek: formData.daysPerWeek || undefined,
          lessonDuration: formData.lessonDuration || undefined,
          durationMinutes,
          lessonCount,
        });

        planId = plan.id;
        setActivePlanId(plan.id);
        setActivePlan(plan);

        // Generate mock lessons immediately using the shared types
        const mockLessons = generateMockLessonsForPlan(
          formData.topicPrompt.trim(),
          lessonCount,
          durationMinutes
        );

        // Set today's lesson (first lesson)
        const todayLesson = mockLessons[0];
        setDailyLesson(todayLesson);
        setTodayLesson(todayLesson);
        setPlansTodayLesson(todayLesson);

        // Set queue (remaining lessons)
        clearQueue();
        mockLessons.slice(1).forEach(lesson => addToQueue(lesson));

        // Set lessons array
        setLessons(mockLessons);

        isSubmittingRef.current = false;
        setIsSubmitting(false);
        console.log('createPlan: Plan created successfully (mock mode)', planId);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to create plan';
      console.error('createPlan: Error creating plan', err);
      setError(errorMessage);
      isSubmittingRef.current = false;
      setIsSubmitting(false);
      completeGeneration(); // Reset generation state on error
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
    startGeneration,
    completeGeneration,
    updateGenerationProgress,
    setTodayLesson,
    setPlansTodayLesson,
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
