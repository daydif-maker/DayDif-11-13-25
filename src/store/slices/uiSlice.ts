import { create } from 'zustand';
import { ModalType, AudioState } from '../types';

interface UIState {
  isLoading: boolean;
  activeModal: ModalType;
  activeTab: 'today' | 'plans';
  audioState: AudioState;
  setLoading: (isLoading: boolean) => void;
  openModal: (modal: ModalType) => void;
  closeModal: () => void;
  setActiveTab: (tab: 'today' | 'plans') => void;
  setAudioState: (audioState: Partial<AudioState>) => void;
  playAudio: (lessonId: string) => void;
  pauseAudio: () => void;
}

const defaultAudioState: AudioState = {
  isPlaying: false,
  position: 0,
  duration: 0,
};

export const useUIStore = create<UIState>(set => ({
  isLoading: false,
  activeModal: null,
  activeTab: 'today',
  audioState: defaultAudioState,
  setLoading: isLoading => set({ isLoading }),
  openModal: activeModal => set({ activeModal }),
  closeModal: () => set({ activeModal: null }),
  setActiveTab: activeTab => set({ activeTab }),
  setAudioState: audioStateUpdate =>
    set(state => ({
      audioState: { ...state.audioState, ...audioStateUpdate },
    })),
  playAudio: lessonId =>
    set(state => ({
      audioState: {
        ...state.audioState,
        isPlaying: true,
        currentLessonId: lessonId,
      },
    })),
  pauseAudio: () =>
    set(state => ({
      audioState: {
        ...state.audioState,
        isPlaying: false,
      },
    })),
}));









