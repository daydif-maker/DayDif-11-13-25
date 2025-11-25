import React, { useState, useEffect, useCallback } from 'react';
import { ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Screen, Stack, Text, ProgressBar } from '@ui';
import { Box } from '@ui/primitives';
import { Ionicons } from '@expo/vector-icons';
import { useIconColor } from '@ui/hooks/useIconColor';
import { Lesson } from '@store/types';
import { audioService, AudioState } from '@services/audio/audioService';
import { episodeService, Episode } from '@services/api/episodeService';
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
    isPlaying: storeIsPlaying,
    progressSeconds,
    durationSeconds,
    setCurrentEpisode,
    startSession,
    pause: storePause,
    resume: storeResume,
    updateProgress,
  } = usePlaybackStore();
  
  const [showTranscript, setShowTranscript] = useState(false);
  const [audioState, setAudioState] = useState<AudioState>(audioService.getState());
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [currentEpisodeIndex, setCurrentEpisodeIndex] = useState(0);
  const [isLoadingEpisodes, setIsLoadingEpisodes] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [playbackRate, setPlaybackRate] = useState(1.0);

  const iconColorPrimary = useIconColor('primary');
  const iconColorInverse = useIconColor('inverse');
  const iconColorSecondary = useIconColor('secondary');
  const iconColorTertiary = useIconColor('tertiary');

  // Subscribe to audio service state changes
  useEffect(() => {
    const unsubscribe = audioService.subscribe((state) => {
      setAudioState(state);
      // Sync progress with playback store
      if (state.position !== progressSeconds) {
        updateProgress(Math.floor(state.position));
      }
    });
    return () => {
      unsubscribe();
    };
  }, [progressSeconds, updateProgress]);

  // Load episodes when lesson changes
  useEffect(() => {
    const loadEpisodes = async () => {
      setIsLoadingEpisodes(true);
      setError(null);
      
      try {
        const lessonEpisodes = await episodeService.getEpisodesForLesson(lesson.id);
        setEpisodes(lessonEpisodes);
        
        if (lessonEpisodes.length > 0) {
          // Set first episode as current
          setCurrentEpisode(lessonEpisodes[0]);
          setCurrentEpisodeIndex(0);
        } else {
          setError('No audio episodes available for this lesson');
        }
      } catch (err) {
        console.error('Failed to load episodes:', err);
        setError('Failed to load lesson audio');
      } finally {
        setIsLoadingEpisodes(false);
      }
    };

    loadEpisodes();

    // Cleanup on unmount
    return () => {
      audioService.unload();
    };
  }, [lesson.id, setCurrentEpisode]);

  const handlePlayPause = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    try {
      if (audioState.isPlaying) {
        await audioService.pause();
        storePause();
      } else {
        // If we have a current episode but no sound loaded, load it first
        const currentEp = episodes[currentEpisodeIndex];
        if (currentEp && (!audioState.currentEpisodeId || audioState.currentEpisodeId !== currentEp.id)) {
          await audioService.loadEpisode(currentEp);
          
          // Start session tracking
          if (user?.id) {
            await startSession(currentEp, user.id);
          }
        }
        
        await audioService.play();
        storeResume();
      }
    } catch (err) {
      console.error('Playback error:', err);
      setError('Failed to play audio');
    }
  }, [
    audioState.isPlaying,
    audioState.currentEpisodeId,
    episodes,
    currentEpisodeIndex,
    user?.id,
    storePause,
    storeResume,
    startSession,
  ]);

  const handleSkip = useCallback(async (seconds: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newPosition = Math.max(
      0,
      Math.min(audioState.duration || 0, (audioState.position || 0) + seconds)
    );
    await audioService.seek(newPosition);
    updateProgress(Math.floor(newPosition));
  }, [audioState.duration, audioState.position, updateProgress]);

  const handleSeek = useCallback(async (percentage: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newPosition = ((audioState.duration || 0) * percentage) / 100;
    await audioService.seek(newPosition);
    updateProgress(Math.floor(newPosition));
  }, [audioState.duration, updateProgress]);

  const handleNextEpisode = useCallback(async () => {
    if (currentEpisodeIndex < episodes.length - 1) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const nextIndex = currentEpisodeIndex + 1;
      const nextEpisode = episodes[nextIndex];
      
      setCurrentEpisodeIndex(nextIndex);
      setCurrentEpisode(nextEpisode);
      
      try {
        await audioService.loadEpisode(nextEpisode);
        await audioService.play();
        
        if (user?.id) {
          await startSession(nextEpisode, user.id);
        }
      } catch (err) {
        console.error('Failed to play next episode:', err);
        setError('Failed to load next episode');
      }
    }
  }, [currentEpisodeIndex, episodes, setCurrentEpisode, user?.id, startSession]);

  const handlePreviousEpisode = useCallback(async () => {
    if (currentEpisodeIndex > 0) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const prevIndex = currentEpisodeIndex - 1;
      const prevEpisode = episodes[prevIndex];
      
      setCurrentEpisodeIndex(prevIndex);
      setCurrentEpisode(prevEpisode);
      
      try {
        await audioService.loadEpisode(prevEpisode);
        await audioService.play();
        
        if (user?.id) {
          await startSession(prevEpisode, user.id);
        }
      } catch (err) {
        console.error('Failed to play previous episode:', err);
        setError('Failed to load previous episode');
      }
    }
  }, [currentEpisodeIndex, episodes, setCurrentEpisode, user?.id, startSession]);

  const handlePlaybackRateChange = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Cycle through rates: 1.0 -> 1.25 -> 1.5 -> 1.75 -> 2.0 -> 0.75 -> 1.0
    const rates = [1.0, 1.25, 1.5, 1.75, 2.0, 0.75];
    const currentIndex = rates.indexOf(playbackRate);
    const nextIndex = (currentIndex + 1) % rates.length;
    const newRate = rates[nextIndex];
    
    setPlaybackRate(newRate);
    await audioService.setPlaybackRate(newRate);
  }, [playbackRate]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage =
    audioState.duration > 0
      ? (audioState.position / audioState.duration) * 100
      : 0;

  const currentEp = episodes[currentEpisodeIndex];
  const hasMultipleEpisodes = episodes.length > 1;

  // Show loading state
  if (isLoadingEpisodes) {
    return (
      <Screen>
        <Stack gap="xl" padding="lg" paddingTop="xl" flex={1} alignItems="center" justifyContent="center">
          <ActivityIndicator size="large" color={iconColorPrimary} />
          <Text variant="body" color="textSecondary">
            Loading lesson audio...
          </Text>
        </Stack>
      </Screen>
    );
  }

  // Show error state
  if (error && episodes.length === 0) {
    return (
      <Screen>
        <Stack gap="xl" padding="lg" paddingTop="xl" flex={1} alignItems="center" justifyContent="center">
          <Ionicons name="alert-circle-outline" size={48} color={iconColorSecondary} />
          <Text variant="heading3" textAlign="center">
            Audio Not Available
          </Text>
          <Text variant="body" color="textSecondary" textAlign="center">
            {error}
          </Text>
        </Stack>
      </Screen>
    );
  }

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
          {currentEp && hasMultipleEpisodes && (
            <Text variant="bodyMedium" color="primary" marginBottom="xs">
              Part {currentEpisodeIndex + 1} of {episodes.length}: {currentEp.title}
            </Text>
          )}
          <Text variant="body" color="textSecondary">
            {lesson.description}
          </Text>
        </Box>

        {/* Loading/Buffering indicator */}
        {(audioState.isLoading || audioState.isBuffering) && (
          <Box flexDirection="row" alignItems="center" justifyContent="center" gap="sm">
            <ActivityIndicator size="small" color={iconColorPrimary} />
            <Text variant="caption" color="textSecondary">
              {audioState.isLoading ? 'Loading...' : 'Buffering...'}
            </Text>
          </Box>
        )}

        {/* Error message */}
        {audioState.error && (
          <Box backgroundColor="error" padding="sm" borderRadius="sm">
            <Text variant="caption" color="textInverse">
              {audioState.error}
            </Text>
          </Box>
        )}

        {/* Progress scrubber */}
        <Box>
          <TouchableOpacity
            onPress={(e) => {
              // Calculate percentage based on touch position
              // Note: In production, use onLayout to get actual width
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

        {/* Playback rate button */}
        <Box alignItems="center">
          <TouchableOpacity onPress={handlePlaybackRateChange}>
            <Box
              paddingHorizontal="md"
              paddingVertical="xs"
              backgroundColor="backgroundSecondary"
              borderRadius="sm"
            >
              <Text variant="caption" fontWeight="600">
                {playbackRate}x
              </Text>
            </Box>
          </TouchableOpacity>
        </Box>

        {/* Play/Pause and skip controls */}
        <Box flexDirection="row" alignItems="center" justifyContent="center" gap="lg">
          {/* Skip backward / Previous episode */}
          <TouchableOpacity
            onPress={hasMultipleEpisodes ? handlePreviousEpisode : () => handleSkip(-15)}
            activeOpacity={0.7}
            disabled={hasMultipleEpisodes && currentEpisodeIndex === 0}
          >
            <Box
              width={48}
              height={48}
              borderRadius="full"
              backgroundColor="backgroundSecondary"
              alignItems="center"
              justifyContent="center"
              opacity={hasMultipleEpisodes && currentEpisodeIndex === 0 ? 0.5 : 1}
            >
              <Ionicons
                name={hasMultipleEpisodes ? 'play-skip-back' : 'play-back'}
                size={24}
                color={iconColorPrimary}
              />
            </Box>
          </TouchableOpacity>

          {/* Rewind 15s */}
          {hasMultipleEpisodes && (
            <TouchableOpacity
              onPress={() => handleSkip(-15)}
              activeOpacity={0.7}
            >
              <Box
                width={40}
                height={40}
                borderRadius="full"
                backgroundColor="backgroundSecondary"
                alignItems="center"
                justifyContent="center"
              >
                <Text variant="caption" fontWeight="600">-15</Text>
              </Box>
            </TouchableOpacity>
          )}

          {/* Play/Pause */}
          <TouchableOpacity
            onPress={handlePlayPause}
            activeOpacity={0.7}
            disabled={audioState.isLoading}
          >
            <Box
              width={72}
              height={72}
              borderRadius="full"
              backgroundColor="primary"
              alignItems="center"
              justifyContent="center"
            >
              {audioState.isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Ionicons
                  name={audioState.isPlaying ? 'pause' : 'play'}
                  size={32}
                  color={iconColorInverse}
                />
              )}
            </Box>
          </TouchableOpacity>

          {/* Forward 15s */}
          {hasMultipleEpisodes && (
            <TouchableOpacity
              onPress={() => handleSkip(15)}
              activeOpacity={0.7}
            >
              <Box
                width={40}
                height={40}
                borderRadius="full"
                backgroundColor="backgroundSecondary"
                alignItems="center"
                justifyContent="center"
              >
                <Text variant="caption" fontWeight="600">+15</Text>
              </Box>
            </TouchableOpacity>
          )}

          {/* Skip forward / Next episode */}
          <TouchableOpacity
            onPress={hasMultipleEpisodes ? handleNextEpisode : () => handleSkip(15)}
            activeOpacity={0.7}
            disabled={hasMultipleEpisodes && currentEpisodeIndex === episodes.length - 1}
          >
            <Box
              width={48}
              height={48}
              borderRadius="full"
              backgroundColor="backgroundSecondary"
              alignItems="center"
              justifyContent="center"
              opacity={hasMultipleEpisodes && currentEpisodeIndex === episodes.length - 1 ? 0.5 : 1}
            >
              <Ionicons
                name={hasMultipleEpisodes ? 'play-skip-forward' : 'play-forward'}
                size={24}
                color={iconColorPrimary}
              />
            </Box>
          </TouchableOpacity>
        </Box>

        {/* Episode list (if multiple episodes) */}
        {hasMultipleEpisodes && (
          <Box>
            <Text variant="heading4" marginBottom="sm">
              Episodes
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
            >
              <Box flexDirection="row" gap="sm">
                {episodes.map((ep, index) => (
                  <TouchableOpacity
                    key={ep.id}
                    onPress={async () => {
                      if (index !== currentEpisodeIndex) {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setCurrentEpisodeIndex(index);
                        setCurrentEpisode(ep);
                        await audioService.loadEpisode(ep);
                      }
                    }}
                  >
                    <Box
                      paddingHorizontal="md"
                      paddingVertical="sm"
                      backgroundColor={index === currentEpisodeIndex ? 'primary' : 'backgroundSecondary'}
                      borderRadius="sm"
                      minWidth={80}
                    >
                      <Text
                        variant="caption"
                        fontWeight="600"
                        color={index === currentEpisodeIndex ? 'textInverse' : 'textPrimary'}
                        textAlign="center"
                      >
                        Part {index + 1}
                      </Text>
                    </Box>
                  </TouchableOpacity>
                ))}
              </Box>
            </ScrollView>
          </Box>
        )}

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
                {currentEp?.body || lesson.content || lesson.description}
              </Text>
            </ScrollView>
          )}
        </Box>
      </Stack>
    </Screen>
  );
};
