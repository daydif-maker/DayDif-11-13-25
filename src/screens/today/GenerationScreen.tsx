import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Screen, Stack, Text, Card, ProgressBar, Button } from '@ui';
import { Box } from '@ui/primitives';
import { Animated, Easing, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@designSystem/ThemeProvider';
import { useUserStateStore } from '@store';
import { Ionicons } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';
import { ttsService, FailedLesson } from '@services/audio/ttsService';
import * as Haptics from 'expo-haptics';

export const GenerationScreen: React.FC = () => {
  const { theme } = useTheme();
  const { generationProgress, getGenerationPercentage, generatingPlanId, updateGenerationProgress } = useUserStateStore();
  const [failedLessons, setFailedLessons] = useState<FailedLesson[]>([]);
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryingLessonId, setRetryingLessonId] = useState<string | null>(null);
  
  // Animation for pulsing effect
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    // Pulsing animation
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();

    return () => pulse.stop();
  }, [pulseAnim, fadeAnim]);

  // Check for failed lessons when generation progress changes
  useEffect(() => {
    const checkFailedLessons = async () => {
      if (generatingPlanId && generationProgress.failed > 0) {
        try {
          const failed = await ttsService.getFailedLessons(generatingPlanId);
          setFailedLessons(failed);
        } catch (error) {
          console.error('Failed to get failed lessons:', error);
        }
      }
    };

    checkFailedLessons();
  }, [generatingPlanId, generationProgress.failed]);

  // Retry a single failed lesson
  const handleRetryLesson = useCallback(async (lessonId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setRetryingLessonId(lessonId);
    
    try {
      const result = await ttsService.retryLesson(lessonId);
      if (result.success) {
        // Remove from failed list
        setFailedLessons((prev) => prev.filter((l) => l.id !== lessonId));
        // Update progress
        updateGenerationProgress({
          failed: Math.max(0, generationProgress.failed - 1),
          pending: generationProgress.pending + 1,
        });
      }
    } catch (error) {
      console.error('Failed to retry lesson:', error);
    } finally {
      setRetryingLessonId(null);
    }
  }, [generationProgress.failed, generationProgress.pending, updateGenerationProgress]);

  // Retry all failed lessons
  const handleRetryAll = useCallback(async () => {
    if (!generatingPlanId) return;
    
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    setIsRetrying(true);
    
    try {
      const result = await ttsService.retryAllFailedLessons(generatingPlanId);
      if (result.success && result.retriedCount > 0) {
        setFailedLessons([]);
        updateGenerationProgress({
          failed: 0,
          pending: generationProgress.pending + result.retriedCount,
        });
      }
    } catch (error) {
      console.error('Failed to retry all lessons:', error);
    } finally {
      setIsRetrying(false);
    }
  }, [generatingPlanId, generationProgress.pending, updateGenerationProgress]);

  const percentage = getGenerationPercentage();
  const { total, completed, inProgress, pending, currentLessonTitle } = generationProgress;

  // Get status message based on progress
  const getStatusMessage = () => {
    if (completed === 0 && inProgress === 0) {
      return 'Starting generation...';
    }
    if (inProgress > 0) {
      return currentLessonTitle 
        ? `Creating: ${currentLessonTitle}`
        : `Generating lesson ${completed + 1} of ${total}...`;
    }
    if (completed > 0 && pending > 0) {
      return `${completed} of ${total} lessons ready`;
    }
    if (completed === total) {
      return 'All lessons ready!';
    }
    return 'Preparing your lessons...';
  };

  // Get estimated time remaining (rough estimate: ~30s per lesson)
  const getEstimatedTime = () => {
    const remaining = pending + inProgress;
    if (remaining === 0) return null;
    const minutes = Math.ceil((remaining * 30) / 60);
    if (minutes <= 1) return '~1 min remaining';
    return `~${minutes} mins remaining`;
  };

  return (
    <Screen backgroundColor="background">
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        <Stack gap="xl" padding="lg" paddingTop="xxl">
          {/* Header */}
          <Box alignItems="center">
            <Text variant="heading2" textAlign="center" marginBottom="sm">
              Creating Your Lessons
            </Text>
            <Text variant="body" color="textSecondary" textAlign="center">
              Our AI is crafting personalized content just for you
            </Text>
          </Box>

          {/* Animated illustration */}
          <Box alignItems="center" justifyContent="center" height={180}>
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <LottieView
                source={require('../../../assets/lottie/lesson-building.json')}
                autoPlay
                loop
                style={styles.lottie}
              />
            </Animated.View>
          </Box>

          {/* Progress Section */}
          <Card variant="elevated" padding="lg">
            <Stack gap="md">
              {/* Progress bar */}
              <Box>
                <Box flexDirection="row" justifyContent="space-between" marginBottom="sm">
                  <Text variant="bodyMedium" fontWeight="600">
                    Progress
                  </Text>
                  <Text variant="bodyMedium" color="primary" fontWeight="600">
                    {percentage}%
                  </Text>
                </Box>
                <ProgressBar 
                  progress={percentage} 
                  height="sm" 
                  color="primary"
                  backgroundColor="backgroundSecondary"
                />
              </Box>

              {/* Status message */}
              <Box 
                flexDirection="row" 
                alignItems="center" 
                gap="sm"
                paddingTop="sm"
              >
                <Box
                  width={8}
                  height={8}
                  borderRadius="full"
                  backgroundColor={inProgress > 0 ? 'warning' : completed === total ? 'success' : 'primary'}
                  style={inProgress > 0 ? styles.pulseDot : undefined}
                />
                <Text variant="body" color="textSecondary" style={{ flex: 1 }}>
                  {getStatusMessage()}
                </Text>
              </Box>

              {/* Estimated time */}
              {getEstimatedTime() && (
                <Box flexDirection="row" alignItems="center" gap="xs">
                  <Ionicons name="time-outline" size={14} color={theme.colors.textTertiary} />
                  <Text variant="caption" color="textTertiary">
                    {getEstimatedTime()}
                  </Text>
                </Box>
              )}
            </Stack>
          </Card>

          {/* Lesson preview cards */}
          <Stack gap="sm">
            <Text variant="heading4" marginBottom="xs">
              Your Lessons
            </Text>
            
            {Array.from({ length: Math.min(total || 3, 4) }).map((_, index) => {
              const isCompleted = index < completed;
              const isInProgress = index === completed && inProgress > 0;
              const isPending = index > completed;

              return (
                <Card 
                  key={index}
                  variant={isCompleted ? 'elevated' : 'outlined'} 
                  padding="md"
                  style={[
                    isInProgress && styles.inProgressCard,
                    isCompleted && styles.completedCard,
                  ]}
                >
                  <Box flexDirection="row" alignItems="center" gap="md">
                    {/* Status icon */}
                    <Box
                      width={36}
                      height={36}
                      borderRadius="full"
                      backgroundColor={
                        isCompleted ? 'success' : 
                        isInProgress ? 'primary' : 
                        'backgroundSecondary'
                      }
                      alignItems="center"
                      justifyContent="center"
                    >
                      {isCompleted ? (
                        <Ionicons name="checkmark" size={20} color="white" />
                      ) : isInProgress ? (
                        <Ionicons name="sync" size={18} color="white" />
                      ) : (
                        <Text variant="bodySmall" color="textTertiary" fontWeight="600">
                          {index + 1}
                        </Text>
                      )}
                    </Box>

                    {/* Lesson info */}
                    <Box flex={1}>
                      {isCompleted || isInProgress ? (
                        <>
                          <Text 
                            variant="bodyMedium" 
                            fontWeight="600"
                            color={isCompleted ? 'textPrimary' : 'primary'}
                          >
                            Lesson {index + 1}
                          </Text>
                          <Text variant="caption" color="textSecondary">
                            {isCompleted ? 'Ready to play' : 'Generating...'}
                          </Text>
                        </>
                      ) : (
                        <>
                          <Box 
                            height={16} 
                            width="60%" 
                            backgroundColor="backgroundSecondary" 
                            borderRadius="sm" 
                            marginBottom="xs"
                          />
                          <Box 
                            height={12} 
                            width="40%" 
                            backgroundColor="backgroundSecondary" 
                            borderRadius="sm" 
                          />
                        </>
                      )}
                    </Box>
                  </Box>
                </Card>
              );
            })}

            {total > 4 && (
              <Text variant="caption" color="textTertiary" textAlign="center" marginTop="xs">
                +{total - 4} more lessons
              </Text>
            )}
          </Stack>

          {/* Failed lessons retry section */}
          {failedLessons.length > 0 && (
            <Card variant="outlined" padding="lg" style={styles.failedCard}>
              <Stack gap="md">
                <Box flexDirection="row" alignItems="center" gap="sm">
                  <Ionicons name="alert-circle" size={20} color={theme.colors.error} />
                  <Text variant="heading4" color="error">
                    {failedLessons.length} {failedLessons.length === 1 ? 'Lesson' : 'Lessons'} Failed
                  </Text>
                </Box>

                <Text variant="body" color="textSecondary">
                  Some lessons couldn't be generated. You can retry them individually or all at once.
                </Text>

                {/* Failed lesson list */}
                <Stack gap="sm">
                  {failedLessons.map((lesson) => (
                    <Box
                      key={lesson.id}
                      flexDirection="row"
                      alignItems="center"
                      justifyContent="space-between"
                      backgroundColor="backgroundSecondary"
                      padding="sm"
                      borderRadius="sm"
                    >
                      <Box flex={1}>
                        <Text variant="bodySmall" fontWeight="600" numberOfLines={1}>
                          Lesson {lesson.dayIndex + 1}
                        </Text>
                        {lesson.error && (
                          <Text variant="caption" color="textTertiary" numberOfLines={1}>
                            {lesson.error}
                          </Text>
                        )}
                      </Box>
                      <TouchableOpacity
                        onPress={() => handleRetryLesson(lesson.id)}
                        disabled={retryingLessonId === lesson.id}
                      >
                        <Box
                          paddingHorizontal="md"
                          paddingVertical="xs"
                          backgroundColor="primary"
                          borderRadius="sm"
                          opacity={retryingLessonId === lesson.id ? 0.5 : 1}
                        >
                          <Text variant="caption" color="textInverse" fontWeight="600">
                            {retryingLessonId === lesson.id ? 'Retrying...' : 'Retry'}
                          </Text>
                        </Box>
                      </TouchableOpacity>
                    </Box>
                  ))}
                </Stack>

                {/* Retry all button */}
                {failedLessons.length > 1 && (
                  <Button
                    variant="secondary"
                    onPress={handleRetryAll}
                    disabled={isRetrying}
                  >
                    {isRetrying ? 'Retrying All...' : 'Retry All Failed'}
                  </Button>
                )}
              </Stack>
            </Card>
          )}
        </Stack>
      </Animated.View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  lottie: {
    width: 180,
    height: 180,
  },
  pulseDot: {
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 4,
  },
  inProgressCard: {
    borderColor: '#6366F1',
    borderWidth: 1,
  },
  completedCard: {
    backgroundColor: 'rgba(34, 197, 94, 0.05)',
  },
  failedCard: {
    borderColor: '#EF4444',
    borderWidth: 1,
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
  },
});
