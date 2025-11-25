import { useState, useCallback, useRef, useEffect } from 'react';
import { useAuthStore } from '@store';
import { usePlansStore } from '@store';
import { useUserStateStore } from '@store';
import { planService } from '@services/api/planService';
import { profileService } from '@services/api/profileService';
import { lessonService } from '@services/api/lessonService';
import { ttsService, GenerationStatusResult } from '@services/audio/ttsService';
import { useLessonsStore } from '@store';
import { generateMockLessonsForPlan } from '@services/api/mocks/mockLessons';
import { USE_MOCK_DATA } from '@utils/env';

export type DaysPerWeekOption = 1 | 2 | 3 | 4 | 5;
export type LessonDurationOption = '5' | '8-10' | '10-15' | '15-20';

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

  const lessonCount = formData.daysPerWeek 
    ? (formData.daysPerWeek === 1 ? 1 : formData.daysPerWeek * 2) 
    : 0;

  const isFormValid =
    formData.topicPrompt.trim().length > 0 &&
    formData.daysPerWeek !== null &&
    formData.lessonDuration !== null;

  const createPlan = useCallback(async () => {
    // Compute validity inside the callback to avoid stale closure issues
    const currentFormValid = 
      formData.topicPrompt.trim().length > 0 &&
      formData.daysPerWeek !== null &&
      formData.lessonDuration !== null;
    
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

      // Use user ID if available, otherwise use mock user ID for mock data mode
      const userId = user?.id ?? (USE_MOCK_DATA ? 'mock-user' : undefined);

      if (!userId) {
        const errorMsg = 'You must be logged in to create a plan';
        console.warn('createPlan: User not authenticated', errorMsg);
        setError(errorMsg);
        isSubmittingRef.current = false;
        setIsSubmitting(false);
        return;
      }

      // Save learning preferences only if we have a real user (not mock mode)
      if (user?.id && !USE_MOCK_DATA) {
        try {
          await profileService.updateLearningPreferences(userId, {
            primary_goal: formData.topicPrompt.trim(),
            topics: [formData.topicPrompt.trim()],
            lessons_per_week: lessonCount,
            lesson_duration_minutes:
              formData.lessonDuration === '5'
                ? 5
                : formData.lessonDuration === '8-10'
                ? 9
                : formData.lessonDuration === '10-15'
                ? 12
                : 17,
            commute_days: [],
          });
        } catch (prefError) {
          console.warn('Failed to update learning preferences, continuing with plan creation:', prefError);
        }
      }

      // Calculate duration in minutes
      const durationMinutes =
        formData.lessonDuration === '5'
          ? 5
          : formData.lessonDuration === '8-10'
          ? 9
          : formData.lessonDuration === '10-15'
          ? 12
          : 17;

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
          'beginner',
          userId
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
          daysPerWeek: formData.daysPerWeek!,
          lessonDuration: formData.lessonDuration!,
          lessonCount,
        });

        planId = plan.id;
        setActivePlanId(plan.id);
        setActivePlan(plan);

        // Generate mock lessons immediately
        const mockLessons = generateMockLessonsForPlan(
          formData.topicPrompt.trim(),
          lessonCount,
          formData.lessonDuration!
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
