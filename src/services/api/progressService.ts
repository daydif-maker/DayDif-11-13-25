import { supabase } from '@lib/supabase/client';
import { Database } from '@lib/supabase/database.types';
import { LearningHistoryEntry, KPIs, Streak, WeeklyGoal } from '@store/types';

type DayEntryRow = Database['public']['Tables']['day_entries']['Row'];
type SessionRow = Database['public']['Tables']['sessions']['Row'];

export const progressService = {
  /**
   * Get week summary aggregated from day_entries
   */
  async getWeekSummary(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<{
    lessonsCompleted: number;
    minutesLearned: number;
    daysActive: number;
    entries: DayEntryRow[];
  }> {
    try {
      const { data, error } = await supabase
        .from('day_entries')
        .select('*')
        .eq('user_id', userId)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: true });

      if (error) throw error;

      const entries = data || [];
      const lessonsCompleted = entries.reduce(
        (sum, e) => sum + e.lessons_completed,
        0
      );
      const minutesLearned = entries.reduce(
        (sum, e) => sum + e.minutes_learned,
        0
      );
      const daysActive = entries.filter(e => e.lessons_completed > 0).length;

      return {
        lessonsCompleted,
        minutesLearned,
        daysActive,
        entries,
      };
    } catch (error) {
      console.error('Failed to fetch week summary:', error);
      throw error;
    }
  },

  /**
   * Get calendar range - fetch day_entries for calendar view
   */
  async getCalendarRange(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<LearningHistoryEntry[]> {
    try {
      const { data, error } = await supabase
        .from('day_entries')
        .select('*')
        .eq('user_id', userId)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: true });

      if (error) throw error;

      // Map to domain objects
      const entries: LearningHistoryEntry[] = (data || []).map(entry => ({
        date: entry.date,
        lessonsCompleted: entry.lessons_completed,
        timeSpent: entry.minutes_learned,
        lessons: [], // Can be populated separately if needed
      }));

      return entries;
    } catch (error) {
      console.error('Failed to fetch calendar range:', error);
      throw error;
    }
  },

  /**
   * Get streak data calculated from day_entries
   */
  async getStreakData(userId: string): Promise<Streak> {
    try {
      const { data, error } = await supabase
        .from('day_entries')
        .select('date, streak_active')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (error) throw error;

      const entries = data || [];
      let currentStreak = 0;
      let longestStreak = 0;
      let tempStreak = 0;
      let lastDate: Date | null = null;
      let consecutiveActive = 0;

      // Process entries in reverse chronological order
      for (const entry of entries) {
        const entryDate = new Date(entry.date);
        entryDate.setHours(0, 0, 0, 0);

        if (entry.streak_active) {
          if (lastDate) {
            const daysDiff = Math.floor(
              (lastDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24)
            );
            if (daysDiff === 1) {
              // Consecutive day
              consecutiveActive++;
            } else if (daysDiff > 1) {
              // Gap in streak
              longestStreak = Math.max(longestStreak, consecutiveActive);
              consecutiveActive = 1;
            }
          } else {
            consecutiveActive = 1;
          }
          lastDate = entryDate;
        } else {
          longestStreak = Math.max(longestStreak, consecutiveActive);
          consecutiveActive = 0;
        }
      }

      longestStreak = Math.max(longestStreak, consecutiveActive);
      currentStreak = consecutiveActive;

      // Find last active date
      const lastActiveEntry = entries.find(e => e.streak_active);
      const lastActiveDate = lastActiveEntry?.date || '';

      return {
        current: currentStreak,
        longest: longestStreak,
        lastActiveDate,
      };
    } catch (error) {
      console.error('Failed to fetch streak data:', error);
      throw error;
    }
  },

  /**
   * Get KPIs aggregated from sessions and day_entries
   */
  async getKPIs(userId: string): Promise<KPIs> {
    try {
      // Get total minutes from sessions
      const { data: sessions, error: sessionsError } = await supabase
        .from('sessions')
        .select('progress_seconds, completed')
        .eq('user_id', userId)
        .eq('completed', true);

      if (sessionsError) throw sessionsError;

      const totalMinutesFromSessions = Math.floor(
        ((sessions || []).reduce(
          (sum, s) => sum + (s.progress_seconds || 0),
          0
        ) || 0) / 60
      );

      // Get lessons completed from day_entries
      const { data: entries, error: entriesError } = await supabase
        .from('day_entries')
        .select('lessons_completed')
        .eq('user_id', userId);

      if (entriesError) throw entriesError;

      const totalLessonsCompleted = (entries || []).reduce(
        (sum, e) => sum + e.lessons_completed,
        0
      );

      // Get streak data
      const streakData = await this.getStreakData(userId);

      return {
        totalTimeLearned: totalMinutesFromSessions,
        totalLessonsCompleted,
        currentStreak: streakData.current,
        longestStreak: streakData.longest,
      };
    } catch (error) {
      console.error('Failed to fetch KPIs:', error);
      throw error;
    }
  },

  /**
   * Get weekly goal progress
   */
  async getWeeklyGoalProgress(
    userId: string,
    weekStart: string
  ): Promise<WeeklyGoal | null> {
    try {
      // Find plan for this week
      const { data: plan, error: planError } = await supabase
        .from('plans')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .lte('start_date', weekStart)
        .gte('end_date', weekStart)
        .single();

      if (planError || !plan) {
        if (planError?.code === 'PGRST116') {
          return null; // No plan for this week
        }
        throw planError;
      }

      // Get progress from day_entries for this week
      const { data: entries, error: entriesError } = await supabase
        .from('day_entries')
        .select('lessons_completed, minutes_learned')
        .eq('user_id', userId)
        .gte('date', plan.start_date)
        .lte('date', plan.end_date);

      if (entriesError) throw entriesError;

      const currentLessons = (entries || []).reduce(
        (sum, e) => sum + e.lessons_completed,
        0
      );
      const currentMinutes = (entries || []).reduce(
        (sum, e) => sum + e.minutes_learned,
        0
      );

      return {
        targetLessons: plan.lessons_goal,
        targetMinutes: plan.minutes_goal,
        currentLessons,
        currentMinutes,
        weekStart: plan.start_date,
      };
    } catch (error) {
      console.error('Failed to fetch weekly goal progress:', error);
      throw error;
    }
  },
};

