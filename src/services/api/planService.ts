import { supabase } from '@lib/supabase/client';
import { Database } from '@lib/supabase/database.types';
import {
  LearningHistoryEntry,
  KPIs,
  WeeklyGoal,
  Streak,
  Plan,
  Lesson,
} from '@store/types';
import {
  getMockKPIs,
  getMockStreak,
  getMockWeeklyGoal,
} from './mocks/mockKPIs';
import { getMockHistory } from './mocks/mockHistory';
import { USE_MOCK_DATA } from '@utils/env';

type PlanRow = Database['public']['Tables']['plans']['Row'];
type PlanInsert = Database['public']['Tables']['plans']['Insert'];
type PlanLessonRow = Database['public']['Tables']['plan_lessons']['Row'];
type PlanLessonInsert = Database['public']['Tables']['plan_lessons']['Insert'];
type AIJobInsert = Database['public']['Tables']['ai_jobs']['Insert'];

// Helper to convert PlanRow to Plan domain object
const mapPlanToDomain = (plan: PlanRow, lessons?: PlanLessonRow[]): Plan => {
  const meta = (plan.meta as Record<string, unknown>) || {};
  return {
    id: plan.id,
    name: (meta.name as string) || `Plan ${plan.id.substring(0, 8)}`,
    goal: {
      targetLessons: plan.lessons_goal,
      targetMinutes: plan.minutes_goal,
      currentLessons: lessons?.filter(l => l.status === 'completed').length || 0,
      currentMinutes: 0, // Will be calculated from sessions
      weekStart: plan.start_date,
    },
    topics: (meta.topics as string[]) || [],
    schedule: {
      frequency: (meta.frequency as 'daily' | 'weekly') || 'weekly',
      daysOfWeek: (meta.daysOfWeek as number[]) || [],
      timeOfDay: (meta.timeOfDay as string) || undefined,
    },
    createdAt: plan.created_at,
    isActive: plan.status === 'active',
    topicPrompt: meta.topicPrompt as string | undefined,
    daysPerWeek: meta.daysPerWeek as number | undefined,
    lessonDuration: meta.lessonDuration as '8-10' | '10-15' | '15-20' | undefined,
    lessonCount: meta.lessonCount as number | undefined,
  };
};

// Helper to convert PlanLessonRow to Lesson domain object
const mapPlanLessonToLesson = (lesson: PlanLessonRow): Lesson => {
  return {
    id: lesson.id,
    title: lesson.title,
    description: lesson.description || '',
    content: '', // Will be populated from episodes
    duration: 10, // Default, can be calculated from episodes
    category: lesson.primary_topic || 'General',
    difficulty: 'intermediate', // Default, can be stored in meta
    completed: lesson.status === 'completed',
    completedAt: lesson.status === 'completed' ? lesson.updated_at : undefined,
    createdAt: lesson.created_at,
  };
};

export const planService = {
  /**
   * Get the active plan for a user
   */
  async getActivePlan(userId: string): Promise<Plan | null> {
    if (USE_MOCK_DATA) {
      return null; // Mock data handled elsewhere
    }

    try {
      const { data, error } = await supabase
        .from('plans')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }

      if (!data) return null;

      // Fetch lessons for the plan
      const lessons = await this.getPlanLessons(data.id);
      return mapPlanToDomain(data, lessons);
    } catch (error) {
      console.error('Failed to fetch active plan:', error);
      throw error;
    }
  },

  /**
   * Get today's lesson for a user
   */
  async getTodayLesson(userId: string, date?: string): Promise<Lesson | null> {
    if (USE_MOCK_DATA) {
      return null; // Mock data handled elsewhere
    }

    try {
      const today = date || new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('plan_lessons')
        .select('*')
        .eq('user_id', userId)
        .eq('date', today)
        .order('day_index', { ascending: true })
        .limit(1)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }

      return mapPlanLessonToLesson(data);
    } catch (error) {
      console.error('Failed to fetch today lesson:', error);
      throw error;
    }
  },

  /**
   * Get all lessons for a plan
   */
  async getPlanLessons(planId: string): Promise<PlanLessonRow[]> {
    try {
      const { data, error } = await supabase
        .from('plan_lessons')
        .select('*')
        .eq('plan_id', planId)
        .order('day_index', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Failed to fetch plan lessons:', error);
      throw error;
    }
  },

  /**
   * Create a plan from learning preferences
   * This creates the plan, plan_lessons, and enqueues ai_jobs
   */
  async createPlanFromPreferences(
    userId: string,
    preferences: {
      topicPrompt: string;
      daysPerWeek: number;
      lessonDuration: '5' | '8-10' | '10-15' | '15-20';
      lessonCount: number;
    }
  ): Promise<Plan> {
    if (USE_MOCK_DATA) {
      // Return mock plan for now
      const durationMinutesMap: Record<string, number> = {
        '5': 5,
        '8-10': 9,
        '10-15': 12.5,
        '15-20': 17.5,
      };
      const mockPlan: Plan = {
        id: `plan-${Date.now()}`,
        name: `Learning Plan: ${preferences.topicPrompt.substring(0, 30)}...`,
        goal: {
          targetLessons: preferences.lessonCount,
          targetMinutes: preferences.lessonCount * (durationMinutesMap[preferences.lessonDuration] || 10),
          currentLessons: 0,
          currentMinutes: 0,
          weekStart: new Date().toISOString().split('T')[0],
        },
        topics: [preferences.topicPrompt],
        schedule: {
          frequency: 'weekly',
          daysOfWeek: [],
        },
        createdAt: new Date().toISOString(),
        isActive: true,
        topicPrompt: preferences.topicPrompt,
        daysPerWeek: preferences.daysPerWeek,
        lessonDuration: preferences.lessonDuration,
        lessonCount: preferences.lessonCount,
      };
      return mockPlan;
    }

    try {
      // Calculate start and end dates (weekly plan)
      const startDate = new Date();
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 7);

      // Duration mapping
      const durationMinutesMap: Record<string, number> = {
        '5': 5,
        '8-10': 9,
        '10-15': 12.5,
        '15-20': 17.5,
      };

      // Create the plan
      const planInsert: PlanInsert = {
        user_id: userId,
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
        status: 'active',
        lessons_goal: preferences.lessonCount,
        minutes_goal: preferences.lessonCount * (durationMinutesMap[preferences.lessonDuration] || 10),
        source: 'user_created',
        meta: {
          topicPrompt: preferences.topicPrompt,
          daysPerWeek: preferences.daysPerWeek,
          lessonDuration: preferences.lessonDuration,
          lessonCount: preferences.lessonCount,
          name: `Learning Plan: ${preferences.topicPrompt.substring(0, 30)}...`,
        },
      };

      const { data: plan, error: planError } = await supabase
        .from('plans')
        .insert(planInsert)
        .select()
        .single();

      if (planError) throw planError;
      if (!plan) throw new Error('Failed to create plan');

      // Enqueue AI job for plan outline generation
      const aiJobInsert: AIJobInsert = {
        user_id: userId,
        type: 'plan_outline',
        status: 'pending',
        input: {
          topicPrompt: preferences.topicPrompt,
          daysPerWeek: preferences.daysPerWeek,
          lessonDuration: preferences.lessonDuration,
          lessonCount: preferences.lessonCount,
        },
        plan_id: plan.id,
      };

      const { error: jobError } = await supabase
        .from('ai_jobs')
        .insert(aiJobInsert);

      if (jobError) {
        console.error('Failed to enqueue AI job:', jobError);
        // Don't throw - plan is created, job can be retried
      }

      return mapPlanToDomain(plan);
    } catch (error) {
      console.error('Failed to create plan:', error);
      throw error;
    }
  },

  /**
   * Update plan status
   */
  async updatePlanStatus(
    planId: string,
    status: 'active' | 'completed' | 'paused' | 'cancelled'
  ): Promise<PlanRow> {
    try {
      const { data, error } = await supabase
        .from('plans')
        .update({ status })
        .eq('id', planId)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('Plan not found');

      return data;
    } catch (error) {
      console.error('Failed to update plan status:', error);
      throw error;
    }
  },

  /**
   * Fetch learning history for a date range
   */
  async getLearningHistory(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<LearningHistoryEntry[]> {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 400));
      return getMockHistory(startDate, endDate);
    }

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
        lessons: [], // Will be populated separately if needed
      }));

      return entries;
    } catch (error) {
      console.error('Failed to fetch learning history:', error);
      throw error;
    }
  },

  /**
   * Fetch KPI tiles data
   */
  async getKPIs(userId: string): Promise<KPIs> {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return getMockKPIs();
    }

    try {
      // Aggregate from day_entries and sessions
      const { data: entries, error: entriesError } = await supabase
        .from('day_entries')
        .select('lessons_completed, minutes_learned, streak_active, date')
        .eq('user_id', userId);

      if (entriesError) throw entriesError;

      const totalLessons = (entries || []).reduce(
        (sum, e) => sum + e.lessons_completed,
        0
      );
      const totalMinutes = (entries || []).reduce(
        (sum, e) => sum + e.minutes_learned,
        0
      );

      // Calculate streak
      const streakData = await this.getStreakData(userId);

      return {
        totalTimeLearned: totalMinutes,
        totalLessonsCompleted: totalLessons,
        currentStreak: streakData.current,
        longestStreak: streakData.longest,
      };
    } catch (error) {
      console.error('Failed to fetch KPIs:', error);
      throw error;
    }
  },

  /**
   * Update weekly goal (updates plan goals)
   */
  async updateWeeklyGoal(
    userId: string,
    data: {
      targetLessons: number;
      targetMinutes: number;
      weekStart: string;
    }
  ): Promise<WeeklyGoal> {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return { ...getMockWeeklyGoal(), ...data };
    }

    try {
      // Find active plan for the week
      const { data: plan, error: planError } = await supabase
        .from('plans')
        .select('id')
        .eq('user_id', userId)
        .eq('status', 'active')
        .lte('start_date', data.weekStart)
        .gte('end_date', data.weekStart)
        .single();

      if (planError || !plan) {
        // Create a new plan for this week
        const startDate = new Date(data.weekStart);
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 7);

        const { error: createError } = await supabase.from('plans').insert({
          user_id: userId,
          start_date: data.weekStart,
          end_date: endDate.toISOString().split('T')[0],
          status: 'active',
          lessons_goal: data.targetLessons,
          minutes_goal: data.targetMinutes,
          source: 'user_created',
        });

        if (createError) throw createError;
      } else {
        // Update existing plan
        const { error: updateError } = await supabase
          .from('plans')
          .update({
            lessons_goal: data.targetLessons,
            minutes_goal: data.targetMinutes,
          })
          .eq('id', plan.id);

        if (updateError) throw updateError;
      }

      // Return the goal (current values would need to be calculated)
      return {
        ...data,
        currentLessons: 0,
        currentMinutes: 0,
      };
    } catch (error) {
      console.error('Failed to update weekly goal:', error);
      throw error;
    }
  },

  /**
   * Fetch streak data
   */
  async getStreakData(userId: string): Promise<Streak> {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 200));
      return getMockStreak();
    }

    try {
      const { data, error } = await supabase
        .from('day_entries')
        .select('date, streak_active')
        .eq('user_id', userId)
        .eq('streak_active', true)
        .order('date', { ascending: false });

      if (error) throw error;

      const entries = data || [];
      let currentStreak = 0;
      let longestStreak = 0;
      let tempStreak = 0;
      let lastDate: Date | null = null;

      for (const entry of entries) {
        const entryDate = new Date(entry.date);
        if (lastDate) {
          const daysDiff = Math.floor(
            (lastDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24)
          );
          if (daysDiff === 1) {
            tempStreak++;
          } else {
            longestStreak = Math.max(longestStreak, tempStreak);
            tempStreak = 1;
          }
        } else {
          tempStreak = 1;
        }
        lastDate = entryDate;
      }

      longestStreak = Math.max(longestStreak, tempStreak);
      currentStreak = entries.length > 0 ? tempStreak : 0;

      return {
        current: currentStreak,
        longest: longestStreak,
        lastActiveDate: entries[0]?.date || '',
      };
    } catch (error) {
      console.error('Failed to fetch streak data:', error);
      throw error;
    }
  },

  /**
   * Create a new learning plan (legacy method for backward compatibility)
   */
  async createPlan(data: {
    topicPrompt: string;
    daysPerWeek: number;
    lessonDuration: '5' | '8-10' | '10-15' | '15-20';
    lessonCount: number;
  }): Promise<Plan> {
    // This method requires userId, so we'll need to get it from auth context
    // For now, throw an error indicating this method should use createPlanFromPreferences
    throw new Error(
      'Use createPlanFromPreferences with userId instead of createPlan'
    );
  },
};
