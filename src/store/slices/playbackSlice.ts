import { create } from 'zustand';
import { episodeService, Episode, Session } from '@services/api/episodeService';

interface PlaybackState {
  // Current playback state
  currentEpisode: Episode | null;
  currentSession: Session | null;
  isPlaying: boolean;
  progressSeconds: number;
  durationSeconds: number | null;

  // Actions
  setCurrentEpisode: (episode: Episode | null) => void;
  startSession: (episode: Episode, userId: string, device?: string) => Promise<void>;
  updateProgress: (progressSeconds: number) => void;
  pause: () => void;
  resume: () => void;
  completeSession: (userId: string) => Promise<void>;
  reset: () => void;
}

export const usePlaybackStore = create<PlaybackState>((set, get) => ({
  // Initial state
  currentEpisode: null,
  currentSession: null,
  isPlaying: false,
  progressSeconds: 0,
  durationSeconds: null,

  setCurrentEpisode: (episode: Episode | null) => {
    set({
      currentEpisode: episode,
      durationSeconds: episode?.durationSeconds || null,
      progressSeconds: 0,
    });
  },

  startSession: async (episode: Episode, userId: string, device?: string) => {
    try {
      // Create session in database
      const session = await episodeService.createSession({
        episode_id: episode.id,
        user_id: userId,
        started_at: new Date().toISOString(),
        progress_seconds: 0,
        completed: false,
        source: 'mobile_app',
        device: device || 'unknown',
      });

      set({
        currentEpisode: episode,
        currentSession: session,
        isPlaying: true,
        progressSeconds: 0,
        durationSeconds: episode.durationSeconds || null,
      });
    } catch (error) {
      console.error('Failed to start session:', error);
      throw error;
    }
  },

  updateProgress: (progressSeconds: number) => {
    const state = get();
    set({ progressSeconds });

    // Update session in database periodically (throttle to avoid too many updates)
    if (state.currentSession && progressSeconds % 10 === 0) {
      // Update every 10 seconds
      episodeService
        .updateSession(state.currentSession.id, {
          progressSeconds,
        })
        .catch(error => {
          console.error('Failed to update session progress:', error);
        });
    }
  },

  pause: () => {
    const state = get();
    set({ isPlaying: false });

    // Update session in database
    if (state.currentSession) {
      episodeService
        .updateSession(state.currentSession.id, {
          progressSeconds: state.progressSeconds,
          endedAt: new Date().toISOString(),
        })
        .catch(error => {
          console.error('Failed to pause session:', error);
        });
    }
  },

  resume: () => {
    set({ isPlaying: true });
  },

  completeSession: async (userId: string) => {
    const state = get();
    if (!state.currentSession || !state.currentEpisode) {
      return;
    }

    try {
      // Complete session and update day_entries
      const { session, dayEntry } = await episodeService.completeSession(
        state.currentSession.id,
        {
          progressSeconds: state.progressSeconds,
          endedAt: new Date().toISOString(),
        }
      );

      set({
        currentSession: session,
        isPlaying: false,
      });

      // Optionally update planSlice with new day entry data
      // This could trigger a refresh of weekly progress
    } catch (error) {
      console.error('Failed to complete session:', error);
      throw error;
    }
  },

  reset: () => {
    set({
      currentEpisode: null,
      currentSession: null,
      isPlaying: false,
      progressSeconds: 0,
      durationSeconds: null,
    });
  },
}));

