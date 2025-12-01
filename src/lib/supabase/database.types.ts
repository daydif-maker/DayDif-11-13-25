export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          user_id: string;
          display_name: string | null;
          timezone: string;
          has_completed_onboarding: boolean;
          avatar_color_seed: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          user_id: string;
          display_name?: string | null;
          timezone?: string;
          has_completed_onboarding?: boolean;
          avatar_color_seed?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          display_name?: string | null;
          timezone?: string;
          has_completed_onboarding?: boolean;
          avatar_color_seed?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      learning_preferences: {
        Row: {
          id: string;
          user_id: string;
          primary_goal: string | null;
          topics: string[];
          difficulty: 'beginner' | 'intermediate' | 'advanced' | null;
          lessons_per_week: number | null;
          lesson_duration_minutes: number | null;
          commute_days: number[];
          commute_time_windows: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          primary_goal?: string | null;
          topics?: string[];
          difficulty?: 'beginner' | 'intermediate' | 'advanced' | null;
          lessons_per_week?: number | null;
          lesson_duration_minutes?: number | null;
          commute_days?: number[];
          commute_time_windows?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          primary_goal?: string | null;
          topics?: string[];
          difficulty?: 'beginner' | 'intermediate' | 'advanced' | null;
          lessons_per_week?: number | null;
          lesson_duration_minutes?: number | null;
          commute_days?: number[];
          commute_time_windows?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      plans: {
        Row: {
          id: string;
          user_id: string;
          start_date: string;
          end_date: string;
          status: 'active' | 'completed' | 'paused' | 'cancelled';
          lessons_goal: number;
          minutes_goal: number;
          source: string | null;
          meta: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          start_date: string;
          end_date: string;
          status?: 'active' | 'completed' | 'paused' | 'cancelled';
          lessons_goal: number;
          minutes_goal: number;
          source?: string | null;
          meta?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          start_date?: string;
          end_date?: string;
          status?: 'active' | 'completed' | 'paused' | 'cancelled';
          lessons_goal?: number;
          minutes_goal?: number;
          source?: string | null;
          meta?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      plan_lessons: {
        Row: {
          id: string;
          plan_id: string;
          user_id: string;
          day_index: number;
          date: string;
          title: string;
          description: string | null;
          status: 'pending' | 'in_progress' | 'completed' | 'skipped';
          primary_topic: string | null;
          tags: string[];
          ai_prompt_used: string | null;
          meta: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          plan_id: string;
          user_id: string;
          day_index: number;
          date: string;
          title: string;
          description?: string | null;
          status?: 'pending' | 'in_progress' | 'completed' | 'skipped';
          primary_topic?: string | null;
          tags?: string[];
          ai_prompt_used?: string | null;
          meta?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          plan_id?: string;
          user_id?: string;
          day_index?: number;
          date?: string;
          title?: string;
          description?: string | null;
          status?: 'pending' | 'in_progress' | 'completed' | 'skipped';
          primary_topic?: string | null;
          tags?: string[];
          ai_prompt_used?: string | null;
          meta?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      episodes: {
        Row: {
          id: string;
          lesson_id: string;
          user_id: string;
          type: 'intro' | 'content' | 'summary' | 'quiz';
          title: string;
          body: string;
          audio_path: string | null;
          duration_seconds: number | null;
          order_index: number;
          meta: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          lesson_id: string;
          user_id: string;
          type: 'intro' | 'content' | 'summary' | 'quiz';
          title: string;
          body: string;
          audio_path?: string | null;
          duration_seconds?: number | null;
          order_index?: number;
          meta?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          lesson_id?: string;
          user_id?: string;
          type?: 'intro' | 'content' | 'summary' | 'quiz';
          title?: string;
          body?: string;
          audio_path?: string | null;
          duration_seconds?: number | null;
          order_index?: number;
          meta?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      sessions: {
        Row: {
          id: string;
          episode_id: string;
          user_id: string;
          started_at: string;
          ended_at: string | null;
          progress_seconds: number;
          completed: boolean;
          source: string | null;
          device: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          episode_id: string;
          user_id: string;
          started_at?: string;
          ended_at?: string | null;
          progress_seconds?: number;
          completed?: boolean;
          source?: string | null;
          device?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          episode_id?: string;
          user_id?: string;
          started_at?: string;
          ended_at?: string | null;
          progress_seconds?: number;
          completed?: boolean;
          source?: string | null;
          device?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      day_entries: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          plan_id: string | null;
          lessons_completed: number;
          minutes_learned: number;
          streak_active: boolean;
          reflection: string | null;
          mood: 'great' | 'good' | 'okay' | 'tough' | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          date: string;
          plan_id?: string | null;
          lessons_completed?: number;
          minutes_learned?: number;
          streak_active?: boolean;
          reflection?: string | null;
          mood?: 'great' | 'good' | 'okay' | 'tough' | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          date?: string;
          plan_id?: string | null;
          lessons_completed?: number;
          minutes_learned?: number;
          streak_active?: boolean;
          reflection?: string | null;
          mood?: 'great' | 'good' | 'okay' | 'tough' | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      ai_jobs: {
        Row: {
          id: string;
          user_id: string;
          type: 'plan_outline' | 'episode_generation' | 'lesson_content';
          status: 'pending' | 'processing' | 'completed' | 'failed';
          input: Json;
          output: Json;
          error: string | null;
          plan_id: string | null;
          lesson_id: string | null;
          created_at: string;
          updated_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: 'plan_outline' | 'episode_generation' | 'lesson_content';
          status?: 'pending' | 'processing' | 'completed' | 'failed';
          input?: Json;
          output?: Json;
          error?: string | null;
          plan_id?: string | null;
          lesson_id?: string | null;
          created_at?: string;
          updated_at?: string;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: 'plan_outline' | 'episode_generation' | 'lesson_content';
          status?: 'pending' | 'processing' | 'completed' | 'failed';
          input?: Json;
          output?: Json;
          error?: string | null;
          plan_id?: string | null;
          lesson_id?: string | null;
          created_at?: string;
          updated_at?: string;
          completed_at?: string | null;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
