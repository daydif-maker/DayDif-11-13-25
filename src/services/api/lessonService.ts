import { supabase } from '@lib/supabase/client';
import { Database } from '@lib/supabase/database.types';
import { Lesson } from '@store/types';
import { getMockDailyLesson, getMockLessonQueue, getMockLessonById } from './mocks/mockLessons';
import { planService } from './planService';
import { episodeService } from './episodeService';
import { USE_MOCK_DATA } from '@utils/env';

type PlanLessonRow = Database['public']['Tables']['plan_lessons']['Row'];

// Helper to convert PlanLessonRow to Lesson domain object with episodes
const mapPlanLessonToLesson = async (lesson: PlanLessonRow): Promise<Lesson> => {
  // Get episodes for this lesson
  const episodes = await episodeService.getEpisodesForLesson(lesson.id);
  
  // Calculate total duration from episodes
  const totalDurationSeconds = episodes.reduce(
    (sum, ep) => sum + (ep.durationSeconds || 0),
    0
  );
  const durationMinutes = Math.ceil(totalDurationSeconds / 60);

  // Combine episode bodies as content
  const content = episodes.map(ep => ep.body).join('\n\n');

  return {
    id: lesson.id,
    title: lesson.title,
    description: lesson.description || '',
    content,
    duration: durationMinutes || 10, // Default to 10 minutes if no episodes
    category: lesson.primary_topic || 'General',
    difficulty: 'intermediate', // Can be stored in meta if needed
    completed: lesson.status === 'completed',
    completedAt: lesson.status === 'completed' ? lesson.updated_at : undefined,
    createdAt: lesson.created_at,
  };
};

export const lessonService = {
  /**
   * Fetch today's daily lesson
   * Requires userId - will be obtained from auth context in slices
   */
  async getDailyLesson(userId: string): Promise<Lesson | null> {
    if (USE_MOCK_DATA) {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      return getMockDailyLesson();
    }

    try {
      const lesson = await planService.getTodayLesson(userId);
      if (!lesson) return null;

      // Get the full plan lesson row to map properly
      const { data, error } = await supabase
        .from('plan_lessons')
        .select('*')
        .eq('id', lesson.id)
        .single();

      if (error) throw error;
      if (!data) return null;

      return await mapPlanLessonToLesson(data);
    } catch (error) {
      console.error('Failed to fetch daily lesson:', error);
      throw error;
    }
  },

  /**
   * Fetch the next up lesson queue
   * Returns upcoming lessons from the active plan
   */
  async getLessonQueue(userId: string): Promise<Lesson[]> {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return getMockLessonQueue();
    }

    try {
      // Get active plan
      const plan = await planService.getActivePlan(userId);
      if (!plan) return [];

      // Get upcoming lessons (not completed, date >= today)
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('plan_lessons')
        .select('*')
        .eq('plan_id', plan.id)
        .eq('user_id', userId)
        .gte('date', today)
        .neq('status', 'completed')
        .order('date', { ascending: true })
        .order('day_index', { ascending: true })
        .limit(10); // Limit to next 10 lessons

      if (error) throw error;
      if (!data || data.length === 0) return [];

      // Map to Lesson domain objects
      const lessons = await Promise.all(
        data.map(lesson => mapPlanLessonToLesson(lesson))
      );

      return lessons;
    } catch (error) {
      console.error('Failed to fetch lesson queue:', error);
      throw error;
    }
  },

  /**
   * Fetch a specific lesson by ID
   */
  async getLessonById(id: string): Promise<Lesson> {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const lesson = getMockLessonById(id);
      if (!lesson) {
        throw new Error(`Lesson with id ${id} not found`);
      }
      return lesson;
    }

    try {
      const { data, error } = await supabase
        .from('plan_lessons')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new Error(`Lesson with id ${id} not found`);
        }
        throw error;
      }

      return await mapPlanLessonToLesson(data);
    } catch (error) {
      console.error(`Failed to fetch lesson ${id}:`, error);
      throw error;
    }
  },

  /**
   * Mark a lesson as complete
   * Updates plan_lessons status and day_entries
   */
  async markLessonComplete(
    userId: string,
    lessonId: string
  ): Promise<{ success: boolean }> {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 200));
      return { success: true };
    }

    try {
      // Get lesson to find date
      const { data: lesson, error: lessonError } = await supabase
        .from('plan_lessons')
        .select('date, plan_id')
        .eq('id', lessonId)
        .eq('user_id', userId)
        .single();

      if (lessonError) throw lessonError;
      if (!lesson) throw new Error('Lesson not found');

      // Update lesson status
      const { error: updateError } = await supabase
        .from('plan_lessons')
        .update({
          status: 'completed',
        })
        .eq('id', lessonId)
        .eq('user_id', userId);

      if (updateError) throw updateError;

      // Update or create day_entry
      const today = lesson.date;

      // Check if day_entry exists
      const { data: existingEntry } = await supabase
        .from('day_entries')
        .select('*')
        .eq('user_id', userId)
        .eq('date', today)
        .single();

      if (existingEntry) {
        // Update existing entry
        const { error: entryUpdateError } = await supabase
          .from('day_entries')
          .update({
            lessons_completed: existingEntry.lessons_completed + 1,
            streak_active: true,
          })
          .eq('id', existingEntry.id);

        if (entryUpdateError) {
          console.error('Failed to update day entry:', entryUpdateError);
          // Don't throw - lesson is marked complete
        }
      } else {
        // Create new entry
        const { error: entryCreateError } = await supabase
          .from('day_entries')
          .insert({
            user_id: userId,
            date: today,
            plan_id: lesson.plan_id,
            lessons_completed: 1,
            minutes_learned: 0, // Will be updated when sessions complete
            streak_active: true,
          });

        if (entryCreateError) {
          console.error('Failed to create day entry:', entryCreateError);
          // Don't throw - lesson is marked complete
        }
      }

      return { success: true };
    } catch (error) {
      console.error(`Failed to mark lesson ${lessonId} as complete:`, error);
      throw error;
    }
  },
};
