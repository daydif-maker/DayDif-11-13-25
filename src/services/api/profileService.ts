import { supabase } from '@lib/supabase/client';
import { Database } from '@lib/supabase/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

type LearningPreferences = Database['public']['Tables']['learning_preferences']['Row'];
type LearningPreferencesInsert = Database['public']['Tables']['learning_preferences']['Insert'];
type LearningPreferencesUpdate = Database['public']['Tables']['learning_preferences']['Update'];

/**
 * Verify user session matches the expected userId
 * This helps debug RLS policy issues
 */
async function verifySession(userId: string): Promise<void> {
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error) {
    console.error('[profileService] Session error:', error);
    throw new Error('Authentication session error');
  }
  
  if (!session) {
    console.error('[profileService] No active session');
    throw new Error('No active session. Please sign in again.');
  }
  
  if (session.user.id !== userId) {
    console.error('[profileService] User ID mismatch:', {
      sessionUserId: session.user.id,
      providedUserId: userId,
    });
    throw new Error('User ID mismatch. Please sign in again.');
  }
  
  console.log('[profileService] Session verified for user:', userId);
}

export const profileService = {
  /**
   * Fetch user profile by user ID
   */
  async getProfile(userId: string): Promise<Profile | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned
          return null;
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      throw error;
    }
  },

  /**
   * Update user profile
   */
  async updateProfile(
    userId: string,
    updates: ProfileUpdate
  ): Promise<Profile> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw error;
    }
  },

  /**
   * Create user profile (typically called by trigger, but available for manual creation)
   */
  async createProfile(profile: ProfileInsert): Promise<Profile> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert(profile)
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Failed to create profile:', error);
      throw error;
    }
  },

  /**
   * Fetch learning preferences for a user
   */
  async getLearningPreferences(
    userId: string
  ): Promise<LearningPreferences | null> {
    try {
      const { data, error } = await supabase
        .from('learning_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned
          return null;
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Failed to fetch learning preferences:', error);
      throw error;
    }
  },

  /**
   * Update learning preferences (upsert)
   */
  async updateLearningPreferences(
    userId: string,
    preferences: LearningPreferencesUpdate
  ): Promise<LearningPreferences> {
    try {
      // Verify session before making database calls
      await verifySession(userId);
      
      // Check if preferences exist
      const existing = await this.getLearningPreferences(userId);

      if (existing) {
        // Update existing
        console.log('[profileService] Updating existing learning preferences');
        const { data, error } = await supabase
          .from('learning_preferences')
          .update(preferences)
          .eq('user_id', userId)
          .select()
          .single();

        if (error) {
          console.error('[profileService] Update error:', error);
          throw error;
        }
        return data;
      } else {
        // Insert new
        console.log('[profileService] Creating new learning preferences');
        const { data, error } = await supabase
          .from('learning_preferences')
          .insert({
            user_id: userId,
            ...preferences,
          } as LearningPreferencesInsert)
          .select()
          .single();

        if (error) {
          console.error('[profileService] Insert error:', error);
          throw error;
        }
        return data;
      }
    } catch (error) {
      console.error('Failed to update learning preferences:', error);
      throw error;
    }
  },

  /**
   * Create learning preferences
   */
  async createLearningPreferences(
    preferences: LearningPreferencesInsert
  ): Promise<LearningPreferences> {
    try {
      const { data, error } = await supabase
        .from('learning_preferences')
        .insert(preferences)
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Failed to create learning preferences:', error);
      throw error;
    }
  },
};

