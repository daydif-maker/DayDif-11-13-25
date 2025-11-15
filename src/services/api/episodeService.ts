import { supabase } from '@lib/supabase/client';
import { Database } from '@lib/supabase/database.types';

type EpisodeRow = Database['public']['Tables']['episodes']['Row'];
type EpisodeInsert = Database['public']['Tables']['episodes']['Insert'];
type SessionRow = Database['public']['Tables']['sessions']['Row'];
type SessionInsert = Database['public']['Tables']['sessions']['Insert'];
type DayEntryRow = Database['public']['Tables']['day_entries']['Row'];
type DayEntryInsert = Database['public']['Tables']['day_entries']['Insert'];
type DayEntryUpdate = Database['public']['Tables']['day_entries']['Update'];

export interface Episode {
  id: string;
  lessonId: string;
  userId: string;
  type: 'intro' | 'content' | 'summary' | 'quiz';
  title: string;
  body: string;
  audioPath: string | null;
  durationSeconds: number | null;
  orderIndex: number;
  meta: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface Session {
  id: string;
  episodeId: string;
  userId: string;
  startedAt: string;
  endedAt: string | null;
  progressSeconds: number;
  completed: boolean;
  source: string | null;
  device: string | null;
  createdAt: string;
  updatedAt: string;
}

export const episodeService = {
  /**
   * Get all episodes for a lesson
   */
  async getEpisodesForLesson(lessonId: string): Promise<Episode[]> {
    try {
      const { data, error } = await supabase
        .from('episodes')
        .select('*')
        .eq('lesson_id', lessonId)
        .order('order_index', { ascending: true });

      if (error) throw error;

      return (data || []).map(episode => ({
        id: episode.id,
        lessonId: episode.lesson_id,
        userId: episode.user_id,
        type: episode.type,
        title: episode.title,
        body: episode.body,
        audioPath: episode.audio_path,
        durationSeconds: episode.duration_seconds,
        orderIndex: episode.order_index,
        meta: (episode.meta as Record<string, unknown>) || {},
        createdAt: episode.created_at,
        updatedAt: episode.updated_at,
      }));
    } catch (error) {
      console.error('Failed to fetch episodes:', error);
      throw error;
    }
  },

  /**
   * Create a new episode
   */
  async createEpisode(episode: EpisodeInsert): Promise<EpisodeRow> {
    try {
      const { data, error } = await supabase
        .from('episodes')
        .insert(episode)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('Failed to create episode');

      return data;
    } catch (error) {
      console.error('Failed to create episode:', error);
      throw error;
    }
  },

  /**
   * Create multiple episodes at once
   */
  async createEpisodes(episodes: EpisodeInsert[]): Promise<EpisodeRow[]> {
    try {
      const { data, error } = await supabase
        .from('episodes')
        .insert(episodes)
        .select();

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Failed to create episodes:', error);
      throw error;
    }
  },

  /**
   * Start a listening session
   */
  async createSession(session: SessionInsert): Promise<SessionRow> {
    try {
      const { data, error } = await supabase
        .from('sessions')
        .insert({
          ...session,
          started_at: session.started_at || new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('Failed to create session');

      return data;
    } catch (error) {
      console.error('Failed to create session:', error);
      throw error;
    }
  },

  /**
   * Update session progress
   */
  async updateSession(
    sessionId: string,
    updates: {
      progressSeconds?: number;
      endedAt?: string;
      completed?: boolean;
    }
  ): Promise<SessionRow> {
    try {
      const { data, error } = await supabase
        .from('sessions')
        .update(updates)
        .eq('id', sessionId)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('Session not found');

      return data;
    } catch (error) {
      console.error('Failed to update session:', error);
      throw error;
    }
  },

  /**
   * Complete a session and update day_entries
   */
  async completeSession(
    sessionId: string,
    updates?: {
      progressSeconds?: number;
      endedAt?: string;
    }
  ): Promise<{ session: SessionRow; dayEntry: DayEntryRow | null }> {
    try {
      // Get the session with episode info
      const { data: session, error: sessionError } = await supabase
        .from('sessions')
        .select('*, episodes!inner(lesson_id, duration_seconds)')
        .eq('id', sessionId)
        .single();

      if (sessionError) throw sessionError;
      if (!session) throw new Error('Session not found');

      const episode = (session as unknown as { episodes: EpisodeRow }).episodes;
      const endedAt = updates?.endedAt || new Date().toISOString();
      const progressSeconds = updates?.progressSeconds || session.progress_seconds || 0;

      // Update session as completed
      const { data: updatedSession, error: updateError } = await supabase
        .from('sessions')
        .update({
          ended_at: endedAt,
          progress_seconds: progressSeconds,
          completed: true,
        })
        .eq('id', sessionId)
        .select()
        .single();

      if (updateError) throw updateError;
      if (!updatedSession) throw new Error('Failed to update session');

      // Get lesson to find the date
      const { data: lesson, error: lessonError } = await supabase
        .from('plan_lessons')
        .select('date, user_id')
        .eq('id', episode.lesson_id)
        .single();

      if (lessonError) throw lessonError;
      if (!lesson) throw new Error('Lesson not found');

      // Update or create day_entry
      const today = lesson.date;
      const minutesLearned = Math.floor(progressSeconds / 60);

      // Check if day_entry exists
      const { data: existingEntry } = await supabase
        .from('day_entries')
        .select('*')
        .eq('user_id', lesson.user_id)
        .eq('date', today)
        .single();

      let dayEntry: DayEntryRow | null = null;

      if (existingEntry) {
        // Update existing entry
        const { data: updatedEntry, error: entryUpdateError } = await supabase
          .from('day_entries')
          .update({
            minutes_learned: existingEntry.minutes_learned + minutesLearned,
            streak_active: true, // Mark streak as active if session completed
          })
          .eq('id', existingEntry.id)
          .select()
          .single();

        if (entryUpdateError) {
          console.error('Failed to update day entry:', entryUpdateError);
          // Don't throw - session is completed
        } else {
          dayEntry = updatedEntry;
        }
      } else {
        // Create new entry
        const { data: plan } = await supabase
          .from('plan_lessons')
          .select('plan_id')
          .eq('id', episode.lesson_id)
          .single();

        const newEntry: DayEntryInsert = {
          user_id: lesson.user_id,
          date: today,
          plan_id: plan?.plan_id || null,
          lessons_completed: 0, // Will be updated when lesson is marked complete
          minutes_learned: minutesLearned,
          streak_active: true,
        };

        const { data: createdEntry, error: entryCreateError } = await supabase
          .from('day_entries')
          .insert(newEntry)
          .select()
          .single();

        if (entryCreateError) {
          console.error('Failed to create day entry:', entryCreateError);
          // Don't throw - session is completed
        } else {
          dayEntry = createdEntry;
        }
      }

      return { session: updatedSession, dayEntry };
    } catch (error) {
      console.error('Failed to complete session:', error);
      throw error;
    }
  },

  /**
   * Get sessions for a user
   */
  async getSessions(
    userId: string,
    options?: {
      episodeId?: string;
      completed?: boolean;
      limit?: number;
    }
  ): Promise<SessionRow[]> {
    try {
      let query = supabase
        .from('sessions')
        .select('*')
        .eq('user_id', userId)
        .order('started_at', { ascending: false });

      if (options?.episodeId) {
        query = query.eq('episode_id', options.episodeId);
      }

      if (options?.completed !== undefined) {
        query = query.eq('completed', options.completed);
      }

      if (options?.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
      throw error;
    }
  },
};

