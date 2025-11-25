import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@lib/supabase/client';
import type { User, Session } from '@supabase/supabase-js';
import { USE_MOCK_DATA } from '@utils/env';

// Mock user for development/testing when Supabase is not configured
const createMockUser = (email: string, displayName?: string): User => ({
  id: `mock-user-${Date.now()}`,
  email,
  app_metadata: {},
  user_metadata: { display_name: displayName || email.split('@')[0] },
  aud: 'authenticated',
  created_at: new Date().toISOString(),
});

const createMockSession = (user: User): Session => ({
  access_token: 'mock-access-token',
  refresh_token: 'mock-refresh-token',
  expires_in: 3600,
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  token_type: 'bearer',
  user,
});

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

          // Use mock auth when in mock data mode or Supabase is not configured
          const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
          if (USE_MOCK_DATA || !supabaseUrl) {
            console.log('Using mock authentication (sign in)');
            await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
            const mockUser = createMockUser(email);
            const mockSession = createMockSession(mockUser);
            set({
              user: mockUser,
              session: mockSession,
              isLoading: false,
              error: null,
            });
            return;
          }

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

          // Use mock auth when in mock data mode or Supabase is not configured
          const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
          if (USE_MOCK_DATA || !supabaseUrl) {
            console.log('Using mock authentication (sign up)');
            await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
            const mockUser = createMockUser(email, displayName);
            const mockSession = createMockSession(mockUser);
            set({
              user: mockUser,
              session: mockSession,
              isLoading: false,
              error: null,
            });
            return;
          }

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
          
          if (USE_MOCK_DATA || !supabaseUrl || !supabaseKey) {
            console.log('Mock mode or Supabase not configured, skipping auth initialization');
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

