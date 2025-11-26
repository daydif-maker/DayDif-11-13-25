/**
 * TTS Service - Connects to DayDif Backend
 * Handles lesson generation and audio creation
 */

import { supabase } from '@lib/supabase/client';
import { USE_MOCK_DATA, ANONYMOUS_USER_ID } from '@utils/env';

/**
 * Check if this is an anonymous user (used when auth bypass is enabled)
 */
function isAnonymousUserId(userId: string): boolean {
  return userId === ANONYMOUS_USER_ID || userId.startsWith('anonymous-');
}

// ============================================================================
// Types
// ============================================================================

export interface TTSConfig {
  voice?: string;
  speed?: number;
  pitch?: number;
  language?: string;
}

export interface LessonGenerationRequest {
  planId: string;
  lessonId: string;
  topic: string;
  lessonNumber: number;
  totalLessons: number;
  userLevel: 'beginner' | 'intermediate' | 'advanced';
  durationMinutes: number;
  sourceUrls?: string[];
  userId: string;
}

export interface LessonGenerationResponse {
  success: boolean;
  lessonId?: string;
  title?: string;
  summary?: string;
  episodeCount?: number;
  keyTakeaways?: string[];
  error?: string;
}

export interface PlanGenerationResponse {
  success: boolean;
  planId?: string;
  error?: string;
}

export interface JobStatus {
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  output?: Record<string, unknown>;
}

export interface GenerationStatusResult {
  total: number;
  completed: number;
  inProgress: number;
  pending: number;
  failed: number;
  firstCompletedLesson?: {
    id: string;
    title: string;
    description: string;
  };
  currentLessonTitle?: string;
}

export interface PollOptions {
  intervalMs?: number;
  timeoutMs?: number;
  onProgress?: (status: GenerationStatusResult) => void;
}

export interface FailedLesson {
  id: string;
  title: string;
  dayIndex: number;
  error?: string;
}

export interface TTSService {
  // Plan generation (creates multiple lessons)
  generatePlan(
    topic: string,
    numberOfLessons: number,
    durationMinutes: number,
    userLevel: string,
    userId: string
  ): Promise<PlanGenerationResponse>;

  // Single lesson generation
  generateLesson(
    request: LessonGenerationRequest
  ): Promise<LessonGenerationResponse>;

  // Legacy audio generation (for simple text-to-speech)
  generateAudio(lessonContent: string, config?: TTSConfig): Promise<string>;

  // Job status tracking
  getJobStatus(jobId: string): Promise<JobStatus>;
  getPlanGenerationStatus(planId: string): Promise<GenerationStatusResult>;

  // Polling methods
  waitForFirstLesson(
    planId: string,
    options?: PollOptions
  ): Promise<{ success: boolean; lesson?: { id: string; title: string }; error?: string }>;
  
  pollGenerationStatus(
    planId: string,
    onProgress: (status: GenerationStatusResult) => void,
    options?: { intervalMs?: number }
  ): () => void; // Returns cleanup function

  // Retry methods
  getFailedLessons(planId: string): Promise<FailedLesson[]>;
  retryLesson(lessonId: string): Promise<LessonGenerationResponse>;
  retryAllFailedLessons(planId: string): Promise<{ success: boolean; retriedCount: number }>;

  // Utility
  isAvailable(): boolean;
}

// ============================================================================
// Implementation
// ============================================================================

class TTSServiceImpl implements TTSService {
  private edgeFunctionUrl: string;

  constructor() {
    const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
    this.edgeFunctionUrl = `${supabaseUrl}/functions/v1`;
  }

  /**
   * Generate a complete learning plan with multiple lessons
   * This is the main entry point for creating a new learning plan
   * Calls the create-plan edge function which handles all database operations
   */
  async generatePlan(
    topic: string,
    numberOfLessons: number,
    durationMinutes: number,
    userLevel: string,
    userId: string
  ): Promise<PlanGenerationResponse> {
    try {
      // Use provided userId or fall back to anonymous user ID
      const effectiveUserId = userId || ANONYMOUS_USER_ID;
      
      console.log('[TTSService] Creating plan via edge function:', {
        topic,
        numberOfLessons,
        durationMinutes,
        isAnonymous: isAnonymousUserId(effectiveUserId),
        userId: effectiveUserId,
      });

      // Handle mock mode - create mock plan without backend
      if (USE_MOCK_DATA) {
        console.log('[TTSService] Mock mode - creating plan locally');
        const mockPlanId = `mock-plan-${Date.now()}`;
        return { success: true, planId: mockPlanId };
      }

      // Call the create-plan edge function which handles:
      // 1. Creating the plan record
      // 2. Creating lesson placeholders
      // 3. Triggering lesson generation for each lesson
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'X-Auth-Bypass': 'true', // Always use auth bypass for plan creation
      };

      const response = await fetch(`${this.edgeFunctionUrl}/create-plan`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          topic,
          numberOfLessons,
          durationMinutes,
          userLevel,
          userId: effectiveUserId,
        }),
      });

      // Check for HTTP errors first
      if (!response.ok) {
        const errorText = await response.text();
        console.error('[TTSService] HTTP error from create-plan:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText,
        });
        throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
      }

      const result = await response.json();
      console.log('[TTSService] create-plan response:', result);

      if (!result.success) {
        console.error('[TTSService] create-plan failed:', result);
        throw new Error(result.error || 'Failed to create plan (no error details)');
      }

      console.log('[TTSService] Plan created:', result.planId);
      return { success: true, planId: result.planId };
    } catch (error) {
      console.error('[TTSService] generatePlan error:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Generate a single lesson by calling the Edge Function
   */
  async generateLesson(
    request: LessonGenerationRequest
  ): Promise<LessonGenerationResponse> {
    // Use provided userId or fall back to anonymous user ID
    const effectiveUserId = request.userId || ANONYMOUS_USER_ID;
    
    console.log(
      '[TTSService] Generating lesson:',
      request.lessonNumber,
      'of',
      request.totalLessons,
      { isAnonymous: isAnonymousUserId(effectiveUserId), userId: effectiveUserId }
    );

    try {
      // In mock mode, return a successful mock response
      if (USE_MOCK_DATA) {
        console.log('[TTSService] Mock mode - simulating lesson generation');
        await new Promise(resolve => setTimeout(resolve, 500));
        return {
          success: true,
          lessonId: request.lessonId,
          title: `${request.topic} - Part ${request.lessonNumber}`,
          summary: `Learn about ${request.topic} in this lesson.`,
          episodeCount: 3,
          keyTakeaways: [
            `Key concept 1 about ${request.topic}`,
            `Key concept 2 about ${request.topic}`,
            `Key concept 3 about ${request.topic}`,
          ],
        };
      }

      // Build headers - use auth bypass for anonymous users, or real auth for logged-in users
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (isAnonymousUserId(effectiveUserId)) {
        // Anonymous user - use auth bypass header
        headers['X-Auth-Bypass'] = 'true';
        console.log('[TTSService] Using auth bypass for anonymous user');
      } else {
        // Real user - try to get auth token, fall back to bypass if not available
        const { data: session } = await supabase.auth.getSession();
        if (session?.session?.access_token) {
          headers['Authorization'] = `Bearer ${session.session.access_token}`;
        } else {
          // Fall back to bypass if no session
          headers['X-Auth-Bypass'] = 'true';
          console.log('[TTSService] No session available, using auth bypass');
        }
      }

      const response = await fetch(`${this.edgeFunctionUrl}/generate-lesson`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          planId: request.planId,
          lessonId: request.lessonId,
          topic: request.topic,
          lessonNumber: request.lessonNumber,
          totalLessons: request.totalLessons,
          userLevel: request.userLevel,
          durationMinutes: request.durationMinutes,
          sourceUrls: request.sourceUrls,
          userId: effectiveUserId,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        console.error('[TTSService] Generation failed:', result.error);
      } else {
        console.log('[TTSService] Lesson generated:', result.title);
      }

      return result;
    } catch (error) {
      console.error('[TTSService] generateLesson error:', error);
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * Legacy audio generation for simple text-to-speech
   * Note: For full lesson generation, use generatePlan() instead
   */
  async generateAudio(
    lessonContent: string,
    config?: TTSConfig
  ): Promise<string> {
    console.log('[TTSService] generateAudio:', {
      contentLength: lessonContent.length,
      config,
    });

    // For simple TTS, we'd call the Modal TTS endpoint directly
    // This is mainly for testing or simple use cases
    // Full lesson generation should use generatePlan()

    return '';
  }

  /**
   * Get the status of a specific AI generation job
   */
  async getJobStatus(jobId: string): Promise<JobStatus> {
    const { data, error } = await supabase
      .from('ai_jobs')
      .select('status, output')
      .eq('id', jobId)
      .single();

    if (error) {
      return { status: 'failed', progress: 0 };
    }

    const progressMap: Record<string, number> = {
      pending: 0,
      processing: 50,
      completed: 100,
      failed: 0,
    };

    return {
      status: data.status as JobStatus['status'],
      progress: progressMap[data.status] || 0,
      output: data.output as Record<string, unknown>,
    };
  }

  /**
   * Get the generation status of all lessons in a plan
   */
  async getPlanGenerationStatus(planId: string): Promise<GenerationStatusResult> {
    console.log('[TTSService] getPlanGenerationStatus for plan:', planId);
    
    // Handle mock mode
    if (USE_MOCK_DATA || planId.startsWith('mock-plan-')) {
      console.log('[TTSService] Using mock data for generation status');
      // In mock mode, simulate all lessons as completed after a short delay
      return {
        total: 5,
        completed: 5,
        inProgress: 0,
        pending: 0,
        failed: 0,
        firstCompletedLesson: {
          id: `mock-lesson-${Date.now()}-0`,
          title: 'Introduction to Your Topic',
          description: 'Your first lesson is ready!',
        },
        currentLessonTitle: undefined,
      };
    }

    const { data: lessons, error } = await supabase
      .from('plan_lessons')
      .select('id, status, title, description, day_index')
      .eq('plan_id', planId)
      .order('day_index', { ascending: true });

    if (error) {
      console.error('[TTSService] Error fetching lessons:', error);
      return {
        total: 0,
        completed: 0,
        inProgress: 0,
        pending: 0,
        failed: 0,
      };
    }

    if (!lessons || lessons.length === 0) {
      console.log('[TTSService] No lessons found for plan yet');
      return {
        total: 0,
        completed: 0,
        inProgress: 0,
        pending: 0,
        failed: 0,
      };
    }

    // Log lesson statuses for debugging
    const statusCounts = lessons.reduce((acc, l) => {
      acc[l.status] = (acc[l.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    console.log('[TTSService] Lesson status counts:', statusCounts);

    // Find first completed lesson
    const completedLessons = lessons.filter((l) => l.status === 'completed');
    const inProgressLessons = lessons.filter((l) => l.status === 'in_progress');
    const firstCompleted = completedLessons[0];
    
    // Find current lesson being generated (first in_progress or first pending if none in progress)
    const currentLesson = inProgressLessons[0] || 
      lessons.find((l) => l.status === 'pending');

    const result = {
      total: lessons.length,
      completed: completedLessons.length,
      inProgress: inProgressLessons.length,
      pending: lessons.filter((l) => l.status === 'pending').length,
      failed: lessons.filter((l) => l.status === 'skipped').length,
      firstCompletedLesson: firstCompleted
        ? {
            id: firstCompleted.id,
            title: firstCompleted.title,
            description: firstCompleted.description || '',
          }
        : undefined,
      currentLessonTitle: currentLesson?.title,
    };

    console.log('[TTSService] Generation status result:', result);
    return result;
  }

  /**
   * Wait for the first lesson to be completed or in_progress
   * Useful for knowing when to transition from generation screen to content
   */
  async waitForFirstLesson(
    planId: string,
    options: PollOptions = {}
  ): Promise<{ success: boolean; lesson?: { id: string; title: string }; error?: string }> {
    const { intervalMs = 3000, timeoutMs = 300000, onProgress } = options; // Default: 3s interval, 5min timeout
    const startTime = Date.now();

    return new Promise((resolve) => {
      const checkStatus = async () => {
        try {
          const status = await this.getPlanGenerationStatus(planId);
          
          // Call progress callback if provided
          if (onProgress) {
            onProgress(status);
          }

          // Check if at least one lesson is completed
          if (status.completed > 0 && status.firstCompletedLesson) {
            resolve({
              success: true,
              lesson: {
                id: status.firstCompletedLesson.id,
                title: status.firstCompletedLesson.title,
              },
            });
            return;
          }

          // Check for timeout
          if (Date.now() - startTime > timeoutMs) {
            resolve({
              success: false,
              error: 'Generation timed out. Your lessons are still being created in the background.',
            });
            return;
          }

          // Check if all failed
          if (status.failed === status.total && status.total > 0) {
            resolve({
              success: false,
              error: 'All lesson generations failed. Please try again.',
            });
            return;
          }

          // Continue polling
          setTimeout(checkStatus, intervalMs);
        } catch (error) {
          console.error('[TTSService] waitForFirstLesson error:', error);
          resolve({
            success: false,
            error: (error as Error).message,
          });
        }
      };

      // Start polling
      checkStatus();
    });
  }

  /**
   * Poll generation status continuously
   * Returns a cleanup function to stop polling
   */
  pollGenerationStatus(
    planId: string,
    onProgress: (status: GenerationStatusResult) => void,
    options: { intervalMs?: number; maxPolls?: number } = {}
  ): () => void {
    const { intervalMs = 3000, maxPolls = 200 } = options; // Max ~10 minutes of polling
    let isActive = true;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let pollCount = 0;

    const poll = async () => {
      if (!isActive) return;
      pollCount++;

      try {
        const status = await this.getPlanGenerationStatus(planId);
        console.log(`[TTSService] Poll #${pollCount}:`, status);
        
        if (isActive) {
          onProgress(status);
        }

        // Determine if we should continue polling:
        // - total === 0: lessons not created yet, keep polling
        // - completed < total: still generating, keep polling
        // - pending > 0 or inProgress > 0: still generating, keep polling
        const shouldContinue = 
          status.total === 0 || 
          status.completed < status.total ||
          status.pending > 0 || 
          status.inProgress > 0;

        if (isActive && shouldContinue && pollCount < maxPolls) {
          timeoutId = setTimeout(poll, intervalMs);
        } else if (pollCount >= maxPolls) {
          console.warn('[TTSService] Max poll count reached, stopping');
        } else {
          console.log('[TTSService] Generation complete, stopping polling');
        }
      } catch (error) {
        console.error('[TTSService] pollGenerationStatus error:', error);
        // Continue polling on error (up to max polls)
        if (isActive && pollCount < maxPolls) {
          timeoutId = setTimeout(poll, intervalMs);
        }
      }
    };

    // Start polling immediately
    console.log('[TTSService] Starting poll for plan:', planId);
    poll();

    // Return cleanup function
    return () => {
      console.log('[TTSService] Cleanup called, stopping poll');
      isActive = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }

  /**
   * Get all failed lessons for a plan
   */
  async getFailedLessons(planId: string): Promise<FailedLesson[]> {
    try {
      const { data: lessons, error } = await supabase
        .from('plan_lessons')
        .select('id, title, day_index, ai_prompt_used')
        .eq('plan_id', planId)
        .eq('status', 'skipped') // 'skipped' is used for failed lessons
        .order('day_index', { ascending: true });

      if (error) {
        console.error('[TTSService] getFailedLessons error:', error);
        return [];
      }

      // Also check for lessons stuck in 'pending' for too long (> 10 minutes)
      const { data: stuckLessons, error: stuckError } = await supabase
        .from('plan_lessons')
        .select('id, title, day_index, ai_prompt_used, created_at')
        .eq('plan_id', planId)
        .eq('status', 'pending');

      if (stuckError) {
        console.error('[TTSService] getStuckLessons error:', stuckError);
      }

      const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
      const stuckList = (stuckLessons || [])
        .filter((l) => l.created_at < tenMinutesAgo)
        .map((l) => ({
          id: l.id,
          title: l.title,
          dayIndex: l.day_index,
          error: 'Generation timed out',
        }));

      const failedList = (lessons || []).map((l) => ({
        id: l.id,
        title: l.title,
        dayIndex: l.day_index,
        error: 'Generation failed',
      }));

      return [...failedList, ...stuckList];
    } catch (error) {
      console.error('[TTSService] getFailedLessons error:', error);
      return [];
    }
  }

  /**
   * Retry generating a single lesson
   */
  async retryLesson(lessonId: string): Promise<LessonGenerationResponse> {
    console.log('[TTSService] Retrying lesson:', lessonId);

    try {
      // Get the lesson details
      const { data: lesson, error: lessonError } = await supabase
        .from('plan_lessons')
        .select('*, plans!inner(meta)')
        .eq('id', lessonId)
        .single();

      if (lessonError || !lesson) {
        return { success: false, error: 'Lesson not found' };
      }

      // Reset the lesson status to pending
      const { error: updateError } = await supabase
        .from('plan_lessons')
        .update({ status: 'pending' })
        .eq('id', lessonId);

      if (updateError) {
        console.error('[TTSService] Failed to reset lesson status:', updateError);
      }

      // Get plan metadata
      const planMeta = (lesson.plans as { meta: Record<string, unknown> })?.meta || {};
      const topic = (planMeta.topic as string) || lesson.primary_topic || lesson.title;
      const durationMinutes = (planMeta.lessonDuration as number) || 10;
      const userLevel = (planMeta.userLevel as string) || 'beginner';

      // Get total lessons in plan for context
      const { count } = await supabase
        .from('plan_lessons')
        .select('id', { count: 'exact', head: true })
        .eq('plan_id', lesson.plan_id);

      // Regenerate the lesson
      return await this.generateLesson({
        planId: lesson.plan_id,
        lessonId: lesson.id,
        topic,
        lessonNumber: lesson.day_index + 1,
        totalLessons: count || 1,
        userLevel: userLevel as 'beginner' | 'intermediate' | 'advanced',
        durationMinutes,
        userId: lesson.user_id,
      });
    } catch (error) {
      console.error('[TTSService] retryLesson error:', error);
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * Retry all failed lessons in a plan
   */
  async retryAllFailedLessons(
    planId: string
  ): Promise<{ success: boolean; retriedCount: number }> {
    console.log('[TTSService] Retrying all failed lessons for plan:', planId);

    try {
      const failedLessons = await this.getFailedLessons(planId);

      if (failedLessons.length === 0) {
        console.log('[TTSService] No failed lessons to retry');
        return { success: true, retriedCount: 0 };
      }

      console.log(`[TTSService] Found ${failedLessons.length} failed lessons to retry`);

      // Retry each lesson (fire and forget)
      for (const lesson of failedLessons) {
        this.retryLesson(lesson.id).catch((err) => {
          console.error(`[TTSService] Failed to retry lesson ${lesson.id}:`, err);
        });
      }

      return { success: true, retriedCount: failedLessons.length };
    } catch (error) {
      console.error('[TTSService] retryAllFailedLessons error:', error);
      return { success: false, retriedCount: 0 };
    }
  }

  /**
   * Check if the TTS service is available
   */
  isAvailable(): boolean {
    return !!process.env.EXPO_PUBLIC_SUPABASE_URL;
  }
}

// ============================================================================
// Export
// ============================================================================

export const ttsService: TTSService = new TTSServiceImpl();
