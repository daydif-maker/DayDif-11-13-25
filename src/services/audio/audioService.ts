/**
 * Audio Service Interface
 * Placeholder for future audio playback implementation
 */

export interface AudioState {
  isPlaying: boolean;
  currentLessonId?: string;
  position: number; // in seconds
  duration: number; // in seconds
}

export interface AudioService {
  playLesson(lessonId: string): Promise<void>;
  pause(): Promise<void>;
  resume(): Promise<void>;
  seek(position: number): Promise<void>;
  stop(): Promise<void>;
  getState(): AudioState;
  subscribe(callback: (state: AudioState) => void): () => void;
}

class AudioServiceImpl implements AudioService {
  private state: AudioState = {
    isPlaying: false,
    position: 0,
    duration: 0,
  };

  private subscribers: Set<(state: AudioState) => void> = new Set();

  async playLesson(lessonId: string): Promise<void> {
    console.log('[AudioService] playLesson:', lessonId);
    // TODO: Implement actual audio playback
    this.state = {
      ...this.state,
      isPlaying: true,
      currentLessonId: lessonId,
    };
    this.notifySubscribers();
  }

  async pause(): Promise<void> {
    console.log('[AudioService] pause');
    this.state = {
      ...this.state,
      isPlaying: false,
    };
    this.notifySubscribers();
  }

  async resume(): Promise<void> {
    console.log('[AudioService] resume');
    this.state = {
      ...this.state,
      isPlaying: true,
    };
    this.notifySubscribers();
  }

  async seek(position: number): Promise<void> {
    console.log('[AudioService] seek:', position);
    this.state = {
      ...this.state,
      position,
    };
    this.notifySubscribers();
  }

  async stop(): Promise<void> {
    console.log('[AudioService] stop');
    this.state = {
      isPlaying: false,
      currentLessonId: undefined,
      position: 0,
      duration: 0,
    };
    this.notifySubscribers();
  }

  getState(): AudioState {
    return { ...this.state };
  }

  subscribe(callback: (state: AudioState) => void): () => void {
    this.subscribers.add(callback);
    return () => {
      this.subscribers.delete(callback);
    };
  }

  private notifySubscribers(): void {
    this.subscribers.forEach(callback => callback(this.getState()));
  }
}

export const audioService: AudioService = new AudioServiceImpl();








