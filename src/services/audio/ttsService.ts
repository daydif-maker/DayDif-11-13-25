/**
 * TTS Service - Connects to DayDif Backend
 * Handles lesson generation and audio creation
 */

import { supabase } from '@lib/supabase/client';
import { USE_MOCK_DATA } from '@utils/env';

/**
 * Check if this is a mock user ID (from mock authentication)
 */
function isMockUserId(userId: string): boolean {
  return userId.startsWith('mock-user') || userId === 'mock-user';
}

/**
 * Verify user session matches the expected userId
 * This helps debug RLS policy issues
 * Skips verification for mock users in development
 */
async function verifySession(userId: string): Promise<void> {
  // Skip session verification for mock users
  if (USE_MOCK_DATA || isMockUserId(userId)) {
    console.log('[TTSService] Skipping session verification (mock mode)');
    return;
  }

  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error) {
    console.error('[TTSService] Session error:', error);
    throw new Error('Authentication session error');
  }
  
  if (!session) {
    console.error('[TTSService] No active session');
    throw new Error('No active session. Please sign in again.');
  }
  
  if (session.user.id !== userId) {
    console.error('[TTSService] User ID mismatch:', {
      sessionUserId: session.user.id,
      providedUserId: userId,
    });
    throw new Error('User ID mismatch. Please sign in again.');
  }
  
  console.log('[TTSService] Session verified for user:', userId);
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
   */
  async generatePlan(
    topic: string,
    numberOfLessons: number,
    durationMinutes: number,
    userLevel: string,
    userId: string
  ): Promise<PlanGenerationResponse> {
    try {
      console.log('[TTSService] Creating plan:', {
        topic,
        numberOfLessons,
        durationMinutes,
        mockMode: USE_MOCK_DATA || isMockUserId(userId),
      });

      // Verify session before making database calls (skipped in mock mode)
      await verifySession(userId);

      // Handle mock mode - create mock plan and lessons without database
      if (USE_MOCK_DATA || isMockUserId(userId)) {
        console.log('[TTSService] Mock mode - creating plan locally');
        const mockPlanId = `mock-plan-${Date.now()}`;
        
        // Simulate lesson generation for mock mode
        const mockLessons = [];
        for (let i = 0; i < numberOfLessons; i++) {
          const mockLessonId = `mock-lesson-${Date.now()}-${i}`;
          mockLessons.push({
            id: mockLessonId,
            day_index: i,
          });
          
          // Fire and forget mock lesson generation
          this.generateLesson({
            planId: mockPlanId,
            lessonId: mockLessonId,
            topic,
            lessonNumber: i + 1,
            totalLessons: numberOfLessons,
            userLevel: userLevel as 'beginner' | 'intermediate' | 'advanced',
            durationMinutes,
            userId,
          }).catch((err) => {
            console.error(
              `[TTSService] Failed to generate mock lesson ${i + 1}:`,
              err
            );
          });
        }
        
        return { success: true, planId: mockPlanId };
      }

      // 1. Create the plan record
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + numberOfLessons);

      const { data: plan, error: planError } = await supabase
        .from('plans')
        .insert({
          user_id: userId,
          start_date: startDate.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0],
          lessons_goal: numberOfLessons,
          minutes_goal: numberOfLessons * durationMinutes,
          status: 'active',
          source: 'ai_generated',
          meta: {
            topic,
            lessonDuration: durationMinutes,
            userLevel,
          },
        })
        .select()
        .single();

      if (planError) {
        throw new Error(`Failed to create plan: ${planError.message}`);
      }

      console.log('[TTSService] Plan created:', plan.id);

      // 2. Create lesson placeholders
      const lessons = [];
      for (let i = 0; i < numberOfLessons; i++) {
        const lessonDate = new Date();
        lessonDate.setDate(lessonDate.getDate() + i);

        lessons.push({
          plan_id: plan.id,
          user_id: userId,
          day_index: i,
          date: lessonDate.toISOString().split('T')[0],
          title: `${topic} - Part ${i + 1}`,
          description: 'Generating...',
          status: 'pending',
          primary_topic: topic,
        });
      }

      const { data: createdLessons, error: lessonsError } = await supabase
        .from('plan_lessons')
        .insert(lessons)
        .select();

      if (lessonsError) {
        throw new Error(`Failed to create lessons: ${lessonsError.message}`);
      }

      console.log('[TTSService] Lessons created:', createdLessons.length);

      // 3. Trigger generation for each lesson (fire and forget)
      // These will run asynchronously on the backend
      for (const lesson of createdLessons) {
        this.generateLesson({
          planId: plan.id,
          lessonId: lesson.id,
          topic,
          lessonNumber: lesson.day_index + 1,
          totalLessons: numberOfLessons,
          userLevel: userLevel as 'beginner' | 'intermediate' | 'advanced',
          durationMinutes,
          userId,
        }).catch((err) => {
          console.error(
            `[TTSService] Failed to generate lesson ${lesson.day_index + 1}:`,
            err
          );
        });
      }

      return { success: true, planId: plan.id };
    } catch (error) {
      console.error('[TTSService] generatePlan error:', error);
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * Generate a single lesson by calling the Edge Function
   */
  async generateLesson(
    request: LessonGenerationRequest
  ): Promise<LessonGenerationResponse> {
    console.log(
      '[TTSService] Generating lesson:',
      request.lessonNumber,
      'of',
      request.totalLessons
    );

    try {
      // In mock mode, return a successful mock response
      if (USE_MOCK_DATA || isMockUserId(request.userId)) {
        console.log('[TTSService] Mock mode - simulating lesson generation');
        // Simulate some processing time
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

      const { data: session } = await supabase.auth.getSession();

      if (!session?.session?.access_token) {
        throw new Error('User not authenticated');
      }

      const response = await fetch(`${this.edgeFunctionUrl}/generate-lesson`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.session.access_token}`,
        },
        body: JSON.stringify({
          planId: request.planId,
          lessonId: request.lessonId,
          topic: request.topic,
          lessonNumber: request.lessonNumber,
          totalLessons: request.totalLessons,
          userLevel: request.userLevel,
          durationMinutes: request.durationMinutes,
          sourceUrls: request.sourceUrls,
          userId: request.userId,
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
    // Handle mock mode
    if (USE_MOCK_DATA || planId.startsWith('mock-plan-')) {
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

    if (error || !lessons) {
      return {
        total: 0,
        completed: 0,
        inProgress: 0,
        pending: 0,
        failed: 0,
      };
    }

    // Find first completed lesson
    const completedLessons = lessons.filter((l) => l.status === 'completed');
    const inProgressLessons = lessons.filter((l) => l.status === 'in_progress');
    const firstCompleted = completedLessons[0];
    
    // Find current lesson being generated (first in_progress or first pending if none in progress)
    const currentLesson = inProgressLessons[0] || 
      lessons.find((l) => l.status === 'pending');

    return {
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
    options: { intervalMs?: number } = {}
  ): () => void {
    const { intervalMs = 3000 } = options;
    let isActive = true;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const poll = async () => {
      if (!isActive) return;

      try {
        const status = await this.getPlanGenerationStatus(planId);
        if (isActive) {
          onProgress(status);
        }

        // Continue polling if not all completed
        if (isActive && (status.pending > 0 || status.inProgress > 0)) {
          timeoutId = setTimeout(poll, intervalMs);
        }
      } catch (error) {
        console.error('[TTSService] pollGenerationStatus error:', error);
        // Continue polling on error
        if (isActive) {
          timeoutId = setTimeout(poll, intervalMs);
        }
      }
    };

    // Start polling immediately
    poll();

    // Return cleanup function
    return () => {
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
