import React, { useState, useEffect } from 'react';
import { ScrollView, TouchableOpacity } from 'react-native';
import { Screen, Stack, Text, Button, ProgressBar } from '@ui';
import { Box } from '@ui/primitives';
import { Ionicons } from '@expo/vector-icons';
import { useIconColor } from '@ui/hooks/useIconColor';
import { Lesson } from '@store/types';
import { audioService } from '@services/audio/audioService';
import { usePlaybackStore } from '@store';
import { useAuthStore } from '@store';
import * as Haptics from 'expo-haptics';

type LessonPlaybackProps = {
  lesson: Lesson;
  onClose?: () => void;
};

export const LessonPlayback: React.FC<LessonPlaybackProps> = ({
  lesson,
  onClose,
}) => {
  const { user } = useAuthStore();
  const {
    currentEpisode,
    isPlaying,
    progressSeconds,
    durationSeconds,
    startSession,
    pause,
    resume,
    updateProgress,
  } = usePlaybackStore();
  const [showTranscript, setShowTranscript] = useState(false);
  const [audioState, setAudioState] = useState(audioService.getState());

  const iconColorPrimary = useIconColor('primary');
  const iconColorInverse = useIconColor('inverse');
  const iconColorSecondary = useIconColor('secondary');

  useEffect(() => {
    const unsubscribe = audioService.subscribe((state) => {
      setAudioState(state);
    });
    return unsubscribe;
  }, []);

  const handlePlayPause = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (audioState.isPlaying) {
      await audioService.pause();
      pause();
    } else {
      if (audioState.currentLessonId === lesson.id) {
        await audioService.resume();
        resume();
      } else {
        await audioService.playLesson(lesson.id);
        if (user?.id && currentEpisode) {
          await startSession(currentEpisode, user.id);
        }
      }
    }
  };

  const handleSkip = async (seconds: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newPosition = Math.max(0, Math.min(
      (durationSeconds || 0),
      (audioState.position || 0) + seconds
    ));
    await audioService.seek(newPosition);
    updateProgress(newPosition);
  };

  const handleSeek = async (percentage: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newPosition = ((durationSeconds || 0) * percentage) / 100;
    await audioService.seek(newPosition);
    updateProgress(newPosition);
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

  return (
    <Screen>
      <Stack gap="xl" padding="lg" paddingTop="xl" flex={1}>
        {/* Header */}
        {onClose && (
          <Box flexDirection="row" alignItems="center" marginBottom="md">
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={iconColorSecondary} />
            </TouchableOpacity>
          </Box>
        )}

        {/* Title and subtitle */}
        <Box>
          <Text variant="heading1" marginBottom="sm">
            {lesson.title}
          </Text>
          <Text variant="body" color="textSecondary">
            {lesson.description}
          </Text>
        </Box>

        {/* Progress scrubber */}
        <Box>
          <TouchableOpacity
            onPress={(e) => {
              const { locationX } = e.nativeEvent;
              // Calculate percentage based on touch position
              // This is simplified - in production, use proper layout measurements
            }}
            activeOpacity={1}
          >
            <ProgressBar progress={progressPercentage} height="md" />
          </TouchableOpacity>
          <Box flexDirection="row" justifyContent="space-between" marginTop="xs">
            <Text variant="caption" color="textTertiary">
              {formatTime(audioState.position || 0)}
            </Text>
            <Text variant="caption" color="textTertiary">
              {formatTime(audioState.duration || 0)}
            </Text>
          </Box>
        </Box>

        {/* Play/Pause and skip controls */}
        <Box flexDirection="row" alignItems="center" justifyContent="center" gap="lg">
          <TouchableOpacity
            onPress={() => handleSkip(-15)}
            activeOpacity={0.7}
          >
            <Box
              width={48}
              height={48}
              borderRadius="full"
              backgroundColor="backgroundSecondary"
              alignItems="center"
              justifyContent="center"
            >
              <Ionicons name="play-skip-back" size={24} color={iconColorPrimary} />
            </Box>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handlePlayPause}
            activeOpacity={0.7}
          >
            <Box
              width={72}
              height={72}
              borderRadius="full"
              backgroundColor="primary"
              alignItems="center"
              justifyContent="center"
            >
              <Ionicons
                name={audioState.isPlaying ? 'pause' : 'play'}
                size={32}
                color={iconColorInverse}
              />
            </Box>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleSkip(15)}
            activeOpacity={0.7}
          >
            <Box
              width={48}
              height={48}
              borderRadius="full"
              backgroundColor="backgroundSecondary"
              alignItems="center"
              justifyContent="center"
            >
              <Ionicons name="play-skip-forward" size={24} color={iconColorPrimary} />
            </Box>
          </TouchableOpacity>
        </Box>

        {/* Transcript drawer */}
        <Box flex={1}>
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setShowTranscript(!showTranscript);
            }}
          >
            <Box
              flexDirection="row"
              alignItems="center"
              justifyContent="space-between"
              paddingVertical="md"
              borderTopWidth={1}
              borderTopColor="border"
            >
              <Text variant="heading4">Transcript</Text>
              <Ionicons
                name={showTranscript ? 'chevron-up' : 'chevron-down'}
                size={24}
                color={iconColorSecondary}
              />
            </Box>
          </TouchableOpacity>

          {showTranscript && (
            <ScrollView
              style={{ maxHeight: 300 }}
              showsVerticalScrollIndicator={false}
            >
              <Text variant="body" color="textSecondary" marginTop="md">
                {lesson.content || lesson.description}
              </Text>
            </ScrollView>
          )}
        </Box>
      </Stack>
    </Screen>
  );
};

