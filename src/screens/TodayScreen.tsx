import React, { useEffect } from 'react';
import { ScrollView } from 'react-native';
import { Screen, Stack, Text, Card, Avatar, ProgressBar, Button, ScreenHeader } from '@ui';
import { useLessonsStore, usePlansStore, useUserStore, useUserStateStore } from '@store';
import { lessonService } from '@services/api/lessonService';
import { plansService } from '@services/api/plansService';
import { useNavigation } from '@react-navigation/native';
import { TodayStackParamList } from '@navigation/types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Box } from '@ui/primitives';
import { Ionicons } from '@expo/vector-icons';
import { useIconColor } from '@ui/hooks/useIconColor';
import { OnboardingScreen } from './today/OnboardingScreen';
import { CreatePlanEmptyState } from './today/CreatePlanEmptyState';
import { GenerationScreen } from './today/GenerationScreen';
import { RegenerationScreen } from './today/RegenerationScreen';
import { OfflineScreen } from './today/OfflineScreen';
import { ErrorScreen } from './today/ErrorScreen';

type TodayScreenNavigationProp = NativeStackNavigationProp<TodayStackParamList, 'Today'>;

// Main content component - rendered when isActive is true
const TodayScreenContent: React.FC = () => {
  const navigation = useNavigation<TodayScreenNavigationProp>();
  const { dailyLesson, nextUpQueue, setDailyLesson, addToQueue } = useLessonsStore();
  const { weeklyGoal, getWeeklyProgress, learningHistory } = usePlansStore();
  const { userProfile } = useUserStore();
  const {
    setTodayLesson,
    setHistory,
    setLessons,
    setError,
    setIsGenerating,
  } = useUserStateStore();
  const iconColorSecondary = useIconColor('secondary');

  // Sync state between slices
  useEffect(() => {
    // Sync todayLesson with dailyLesson
    setTodayLesson(dailyLesson);
    
    // Sync history with learningHistory
    setHistory(learningHistory);
    
    // Sync lessons (combine dailyLesson and nextUpQueue)
    const allLessons = dailyLesson
      ? [dailyLesson, ...nextUpQueue]
      : nextUpQueue.length > 0
      ? nextUpQueue
      : null;
    setLessons(allLessons);
  }, [dailyLesson, nextUpQueue, learningHistory, setTodayLesson, setHistory, setLessons]);

  useEffect(() => {
    // Only load data if we don't already have a daily lesson
    // This prevents overwriting lessons that were just set (e.g., from CreatePlanScreen)
    if (dailyLesson) {
      return;
    }

    const loadData = async () => {
      try {
        setIsGenerating(true);
        setError(null);

        const lesson = await lessonService.getDailyLesson();
        setDailyLesson(lesson);

        const queue = await lessonService.getLessonQueue();
        queue.forEach(l => addToQueue(l));

        await plansService.getStreakData();
        // Load weekly goal if needed
        
        setIsGenerating(false);
      } catch (error) {
        console.error('Failed to load today screen data:', error);
        setIsGenerating(false);
        setError(error instanceof Error ? error.message : 'Failed to load lessons');
      }
    };

    loadData();
  }, [dailyLesson, setDailyLesson, addToQueue, setIsGenerating, setError]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const progress = getWeeklyProgress();

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Stack gap="xl" padding="lg" paddingTop="xl">
          {/* Blinkist-style header with "For You" title and green underline */}
          <Box>
            <Box flexDirection="row" justifyContent="space-between" alignItems="flex-start" marginBottom="sm">
              <Box flex={1}>
                <ScreenHeader title="For You" />
              </Box>
              <Box marginTop="xs">
                <Ionicons name="settings-outline" size={24} color={iconColorSecondary} />
              </Box>
            </Box>
            
            {/* Greeting section */}
            <Box flexDirection="row" justifyContent="space-between" alignItems="center" marginBottom="lg">
              <Box>
                <Text variant="heading3" marginBottom="xs">
                  {getGreeting()}
                </Text>
                <Text variant="bodySmall" color="textSecondary">
                  {userProfile?.name || 'Ready to learn?'}
                </Text>
              </Box>
              <Avatar name={userProfile?.name} size="md" />
            </Box>
          </Box>

          {/* Weekly goal progress - Blinkist-style card */}
          {weeklyGoal && (
            <Card variant="elevated" padding="lg">
              <Text variant="heading4" marginBottom="sm">
                Weekly Goal
              </Text>
              <Text variant="bodySmall" color="textSecondary" marginBottom="md">
                {progress.lessons} of {weeklyGoal.targetLessons} lessons completed
              </Text>
              <ProgressBar progress={progress.percentage} />
            </Card>
          )}

          {/* Daily lesson - Featured card with Blinkist styling */}
          {dailyLesson && (
            <Box>
              <Text variant="heading3" marginBottom="sm">
                Today's Lesson
              </Text>
              <Card
                variant="featured"
                onPress={() => {
                  navigation.navigate('LessonDetail', { lessonId: dailyLesson.id });
                }}
                padding="lg"
              >
                <Text variant="heading2" marginBottom="sm">
                  {dailyLesson.title}
                </Text>
                <Text variant="body" color="textSecondary" marginBottom="lg">
                  {dailyLesson.description}
                </Text>
                <Button
                  variant="primary"
                  onPress={() => {
                    navigation.navigate('LessonDetail', { lessonId: dailyLesson.id });
                  }}
                >
                  Start Learning
                </Button>
              </Card>
            </Box>
          )}

          {/* Next Up queue - Blinkist-style section */}
          {nextUpQueue.length > 0 && (
            <Box>
              <Text variant="heading3" marginBottom="xs">
                Next Up
              </Text>
              <Text variant="bodySmall" color="textSecondary" marginBottom="md">
                Continue your learning journey
              </Text>
              <Stack gap="md">
                {nextUpQueue.map((lesson) => (
                  <Card
                    key={lesson.id}
                    variant="outlined"
                    onPress={() => {
                      navigation.navigate('LessonDetail', { lessonId: lesson.id });
                    }}
                    padding="md"
                  >
                    <Text variant="heading4" marginBottom="xs">
                      {lesson.title}
                    </Text>
                    <Text variant="caption" color="textTertiary">
                      {lesson.duration} min · {lesson.category}
                    </Text>
                  </Card>
                ))}
              </Stack>
            </Box>
          )}
        </Stack>
      </ScrollView>
    </Screen>
  );
};

// Main TodayScreen component with state-aware routing
export const TodayScreen: React.FC = () => {
  const {
    isFirstTime,
    isMissingPlan,
    isGeneratingLessons,
    isReturning,
    isOfflineMode,
    isError,
  } = useUserStateStore();

  // State-aware routing - render appropriate screen based on user state
  if (isFirstTime()) {
    return <OnboardingScreen />;
  }

  if (isMissingPlan()) {
    return <CreatePlanEmptyState />;
  }

  if (isGeneratingLessons()) {
    return <GenerationScreen />;
  }

  if (isReturning()) {
    return <RegenerationScreen />;
  }

  if (isOfflineMode()) {
    return <OfflineScreen />;
  }

  if (isError()) {
    return <ErrorScreen />;
  }

  // Default: render full Today experience when isActive is true
  return <TodayScreenContent />;
};
