/**
 * Audio Service - Actual Audio Playback using expo-av
 * Handles lesson audio playback with full control
 */

import { Audio, AVPlaybackStatus, AVPlaybackStatusSuccess } from 'expo-av';
import { Episode, episodeService } from '@services/api/episodeService';

export interface AudioState {
  isPlaying: boolean;
  isLoading: boolean;
  isBuffering: boolean;
  currentLessonId?: string;
  currentEpisodeId?: string;
  position: number; // in seconds
  duration: number; // in seconds
  error?: string;
}

export interface AudioService {
  // Core playback
  loadEpisode(episode: Episode): Promise<void>;
  playLesson(lessonId: string): Promise<void>;
  play(): Promise<void>;
  pause(): Promise<void>;
  resume(): Promise<void>;
  stop(): Promise<void>;
  seek(position: number): Promise<void>;
  
  // Playback rate
  setPlaybackRate(rate: number): Promise<void>;
  getPlaybackRate(): number;
  
  // State
  getState(): AudioState;
  subscribe(callback: (state: AudioState) => void): () => void;
  
  // Cleanup
  unload(): Promise<void>;
}

class AudioServiceImpl implements AudioService {
  private sound: Audio.Sound | null = null;
  private state: AudioState = {
    isPlaying: false,
    isLoading: false,
    isBuffering: false,
    position: 0,
    duration: 0,
  };
  private playbackRate: number = 1.0;
  private subscribers: Set<(state: AudioState) => void> = new Set();
  private isInitialized: boolean = false;
  private currentEpisode: Episode | null = null;

  constructor() {
    this.initializeAudio();
  }

  private async initializeAudio(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Configure audio mode for background playback
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
      this.isInitialized = true;
      console.log('[AudioService] Audio mode configured');
    } catch (error) {
      console.error('[AudioService] Failed to configure audio mode:', error);
    }
  }

  private updateState(updates: Partial<AudioState>): void {
    this.state = { ...this.state, ...updates };
    this.notifySubscribers();
  }

  private notifySubscribers(): void {
    this.subscribers.forEach((callback) => callback(this.getState()));
  }

  private handlePlaybackStatusUpdate = (status: AVPlaybackStatus): void => {
    if (!status.isLoaded) {
      // Handle unloaded state or error
      if ('error' in status && status.error) {
        console.error('[AudioService] Playback error:', status.error);
        this.updateState({
          isPlaying: false,
          isLoading: false,
          isBuffering: false,
          error: status.error,
        });
      }
      return;
    }

    // Handle loaded state
    const loadedStatus = status as AVPlaybackStatusSuccess;
    
    this.updateState({
      isPlaying: loadedStatus.isPlaying,
      isLoading: false,
      isBuffering: loadedStatus.isBuffering,
      position: loadedStatus.positionMillis / 1000,
      duration: loadedStatus.durationMillis ? loadedStatus.durationMillis / 1000 : 0,
      error: undefined,
    });

    // Check if playback finished
    if (loadedStatus.didJustFinish && !loadedStatus.isLooping) {
      console.log('[AudioService] Playback finished');
      this.updateState({ isPlaying: false });
    }
  };

  /**
   * Load an episode's audio for playback
   */
  async loadEpisode(episode: Episode): Promise<void> {
    // Check for missing or empty audio path
    if (!episode.audioPath || episode.audioPath.trim() === '') {
      console.error('[AudioService] Episode has no audio path:', episode.id, episode.audioPath);
      this.updateState({ 
        error: 'Audio not available yet. The lesson may still be generating.',
        isLoading: false,
      });
      return;
    }

    console.log('[AudioService] Loading episode:', episode.id, 'URL:', episode.audioPath);
    
    // Unload any existing sound
    await this.unload();

    this.updateState({
      isLoading: true,
      currentEpisodeId: episode.id,
      error: undefined,
    });

    try {
      await this.initializeAudio();

      // Create and load the sound
      const { sound } = await Audio.Sound.createAsync(
        { uri: episode.audioPath },
        {
          shouldPlay: false,
          rate: this.playbackRate,
          progressUpdateIntervalMillis: 500, // Update every 500ms
        },
        this.handlePlaybackStatusUpdate
      );

      this.sound = sound;
      this.currentEpisode = episode;

      // Get initial status
      const status = await sound.getStatusAsync();
      if (status.isLoaded) {
        this.updateState({
          isLoading: false,
          duration: status.durationMillis ? status.durationMillis / 1000 : 0,
        });
      }

      console.log('[AudioService] Episode loaded successfully');
    } catch (error) {
      console.error('[AudioService] Failed to load episode:', error);
      this.updateState({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load audio',
      });
      throw error;
    }
  }

  /**
   * Play a lesson by loading its first episode
   * This is a convenience method for backward compatibility
   */
  async playLesson(lessonId: string): Promise<void> {
    console.log('[AudioService] playLesson:', lessonId);
    
    try {
      // Fetch episodes for the lesson
      const episodes = await episodeService.getEpisodesForLesson(lessonId);
      
      if (episodes.length === 0) {
        console.error('[AudioService] No episodes found for lesson:', lessonId);
        this.updateState({ error: 'No audio episodes found for this lesson' });
        return;
      }

      // Load the first episode (or could implement playlist logic)
      const firstEpisode = episodes[0];
      this.updateState({ currentLessonId: lessonId });
      
      await this.loadEpisode(firstEpisode);
      await this.play();
    } catch (error) {
      console.error('[AudioService] Failed to play lesson:', error);
      this.updateState({
        error: error instanceof Error ? error.message : 'Failed to play lesson',
      });
      throw error;
    }
  }

  /**
   * Start playback
   */
  async play(): Promise<void> {
    if (!this.sound) {
      // No-op when no sound is loaded - this is expected when playback is requested before loading
      return;
    }

    try {
      console.log('[AudioService] Starting playback');
      await this.sound.playAsync();
    } catch (error) {
      console.error('[AudioService] Failed to play:', error);
      this.updateState({
        error: error instanceof Error ? error.message : 'Failed to play',
      });
      throw error;
    }
  }

  /**
   * Pause playback
   */
  async pause(): Promise<void> {
    if (!this.sound) {
      // No-op when no sound is loaded
      return;
    }

    try {
      console.log('[AudioService] Pausing playback');
      await this.sound.pauseAsync();
    } catch (error) {
      console.error('[AudioService] Failed to pause:', error);
      throw error;
    }
  }

  /**
   * Resume playback (alias for play)
   */
  async resume(): Promise<void> {
    await this.play();
  }

  /**
   * Stop playback and reset position
   */
  async stop(): Promise<void> {
    if (!this.sound) {
      // No-op when no sound is loaded
      return;
    }

    try {
      console.log('[AudioService] Stopping playback');
      await this.sound.stopAsync();
      await this.sound.setPositionAsync(0);
      this.updateState({
        isPlaying: false,
        position: 0,
      });
    } catch (error) {
      console.error('[AudioService] Failed to stop:', error);
      throw error;
    }
  }

  /**
   * Seek to a specific position (in seconds)
   */
  async seek(position: number): Promise<void> {
    if (!this.sound) {
      // No-op when no sound is loaded
      return;
    }

    try {
      console.log('[AudioService] Seeking to:', position);
      const positionMs = Math.max(0, position * 1000);
      await this.sound.setPositionAsync(positionMs);
    } catch (error) {
      console.error('[AudioService] Failed to seek:', error);
      throw error;
    }
  }

  /**
   * Set playback rate (0.5 to 2.0)
   */
  async setPlaybackRate(rate: number): Promise<void> {
    const clampedRate = Math.max(0.5, Math.min(2.0, rate));
    this.playbackRate = clampedRate;

    if (this.sound) {
      try {
        await this.sound.setRateAsync(clampedRate, true); // true = pitch correct
        console.log('[AudioService] Playback rate set to:', clampedRate);
      } catch (error) {
        console.error('[AudioService] Failed to set playback rate:', error);
        throw error;
      }
    }
  }

  /**
   * Get current playback rate
   */
  getPlaybackRate(): number {
    return this.playbackRate;
  }

  /**
   * Get current audio state
   */
  getState(): AudioState {
    return { ...this.state };
  }

  /**
   * Subscribe to state changes
   */
  subscribe(callback: (state: AudioState) => void): () => void {
    this.subscribers.add(callback);
    // Immediately call with current state
    callback(this.getState());
    return () => {
      this.subscribers.delete(callback);
    };
  }

  /**
   * Unload the current sound and cleanup
   */
  async unload(): Promise<void> {
    if (this.sound) {
      try {
        console.log('[AudioService] Unloading sound');
        await this.sound.unloadAsync();
      } catch (error) {
        console.error('[AudioService] Failed to unload sound:', error);
      }
      this.sound = null;
    }

    this.currentEpisode = null;
    this.updateState({
      isPlaying: false,
      isLoading: false,
      isBuffering: false,
      currentLessonId: undefined,
      currentEpisodeId: undefined,
      position: 0,
      duration: 0,
      error: undefined,
    });
  }
}

// Export singleton instance
export const audioService: AudioService = new AudioServiceImpl();
