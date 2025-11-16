import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@lib/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;

  // Actions
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName?: string) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  bootstrapAuth: () => Promise<void>;
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setError: (error: string | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      isLoading: false,
      isInitialized: false,
      error: null,

      signIn: async (email: string, password: string) => {
        try {
          set({ isLoading: true, error: null });

          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) throw error;

          set({
            user: data.user,
            session: data.session,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Failed to sign in';
          set({ isLoading: false, error: errorMessage });
          throw error;
        }
      },

      signUp: async (
        email: string,
        password: string,
        displayName?: string
      ) => {
        try {
          set({ isLoading: true, error: null });

          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                display_name: displayName || email.split('@')[0],
              },
            },
          });

          if (error) throw error;

          set({
            user: data.user,
            session: data.session,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Failed to sign up';
          set({ isLoading: false, error: errorMessage });
          throw error;
        }
      },

      signOut: async () => {
        try {
          set({ isLoading: true, error: null });

          const { error } = await supabase.auth.signOut();

          if (error) throw error;

          set({
            user: null,
            session: null,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Failed to sign out';
          set({ isLoading: false, error: errorMessage });
          throw error;
        }
      },

      signInWithGoogle: async () => {
        try {
          set({ isLoading: true, error: null });

          const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
              redirectTo: 'daydif://auth/callback',
            },
          });

          if (error) throw error;

          // Note: OAuth flow will complete via deep link
          // Session will be set via auth state change listener
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : 'Failed to sign in with Google';
          set({ isLoading: false, error: errorMessage });
          throw error;
        }
      },

      signInWithApple: async () => {
        try {
          set({ isLoading: true, error: null });

          const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'apple',
            options: {
              redirectTo: 'daydif://auth/callback',
            },
          });

          if (error) throw error;

          // Note: OAuth flow will complete via deep link
          // Session will be set via auth state change listener
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : 'Failed to sign in with Apple';
          set({ isLoading: false, error: errorMessage });
          throw error;
        }
      },

      bootstrapAuth: async () => {
        try {
          set({ isLoading: true, isInitialized: false });
          
          // Check if Supabase is configured
          const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
          const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
          
          if (!supabaseUrl || !supabaseKey) {
            console.warn('Supabase not configured, skipping auth initialization');
            set({
              user: null,
              session: null,
              isLoading: false,
              isInitialized: true,
              error: null,
            });
            return;
          }
          
          // Add timeout to prevent hanging
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Auth timeout')), 3000);
          });

          // Get current session with timeout
          const sessionPromise = supabase.auth.getSession();
          
          const {
            data: { session },
            error,
          } = await Promise.race([sessionPromise, timeoutPromise as any]).catch(() => ({
            data: { session: null },
            error: null,
          }));

          if (error) {
            console.warn('Auth error:', error);
          }

          set({
            user: session?.user ?? null,
            session: session,
            isLoading: false,
            isInitialized: true,
            error: null,
          });

          // Set up auth state change listener
          supabase.auth.onAuthStateChange((_event, session) => {
            set({
              user: session?.user ?? null,
              session: session,
            });
          });
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : 'Failed to bootstrap auth';
          console.warn('Auth bootstrap error:', errorMessage);
          set({
            user: null,
            session: null,
            isLoading: false,
            isInitialized: true,
            error: null, // Don't block app with auth errors
          });
        }
      },

      setUser: (user: User | null) => set({ user }),
      setSession: (session: Session | null) => set({ session }),
      setError: (error: string | null) => set({ error }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        // Only persist user ID, not full user object
        user: state.user
          ? {
              id: state.user.id,
              email: state.user.email,
            }
          : null,
      }),
    }
  )
);

