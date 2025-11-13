import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Text } from './Text';
import { ProgressBar } from './ProgressBar';
import { useUIStore } from '@store';
import { audioService } from '@services/audio/audioService';
import { Box } from '@ui/primitives';
import { Ionicons } from '@expo/vector-icons';
import { useIconColor } from './hooks/useIconColor';

export const AudioPlayer: React.FC = () => {
  const { audioState, playAudio, pauseAudio, setAudioState } = useUIStore();
  const iconColorInverse = useIconColor('inverse');

  const handlePlayPause = () => {
    if (audioState.isPlaying) {
      audioService.pause();
      pauseAudio();
    } else if (audioState.currentLessonId) {
      audioService.resume();
      setAudioState({ isPlaying: true });
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage =
    audioState.duration > 0
      ? (audioState.position / audioState.duration) * 100
      : 0;

  if (!audioState.currentLessonId) {
    return null;
  }

  return (
    <Box
      backgroundColor="surfaceElevated"
      padding="md"
      borderTopWidth={1}
      borderTopColor="border"
    >
      <Box flexDirection="row" alignItems="center" gap="md">
        <TouchableOpacity onPress={handlePlayPause}>
          <Box
            width={48}
            height={48}
            borderRadius="full"
            backgroundColor="primary"
            alignItems="center"
            justifyContent="center"
          >
            <Ionicons
              name={audioState.isPlaying ? 'pause' : 'play'}
              size={24}
              color={iconColorInverse}
            />
          </Box>
        </TouchableOpacity>

        <Box flex={1}>
          <ProgressBar progress={progressPercentage} />
          <Box flexDirection="row" justifyContent="space-between" marginTop="xs">
            <Text variant="caption" color="textTertiary">
              {formatTime(audioState.position)}
            </Text>
            <Text variant="caption" color="textTertiary">
              {formatTime(audioState.duration)}
            </Text>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

