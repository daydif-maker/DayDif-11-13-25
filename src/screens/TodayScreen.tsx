import React, { useEffect } from 'react';
import { ScrollView } from 'react-native';
import { Screen, Stack, Text, Card, Avatar, ProgressBar, Button, ScreenHeader } from '@ui';
import { useUserStateStore } from '@store';
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
import { useTodayScreen } from '@hooks/useTodayScreen';

type TodayScreenNavigationProp = NativeStackNavigationProp<TodayStackParamList, 'Today'>;

// Main content component - rendered when isActive is true
const TodayScreenContent: React.FC = () => {
  const navigation = useNavigation<TodayScreenNavigationProp>();
  const {
    greeting,
    userName,
    todayLesson,
    nextUp,
    weeklyProgress,
    isLoading,
  } = useTodayScreen();
  const iconColorSecondary = useIconColor('secondary');
  const { setTodayLesson, setHistory, setLessons } = useUserStateStore();

  // Sync state between slices for backward compatibility
  useEffect(() => {
    if (todayLesson) {
      setTodayLesson(todayLesson);
    }
    if (nextUp) {
      const allLessons = todayLesson ? [todayLesson, ...nextUp] : nextUp;
      setLessons(allLessons);
    }
  }, [todayLesson, nextUp, setTodayLesson, setLessons]);

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
                  {greeting}
                </Text>
                <Text variant="bodySmall" color="textSecondary">
                  {userName || 'Ready to learn?'}
                </Text>
              </Box>
              <Avatar name={userName || undefined} size="md" />
            </Box>
          </Box>

          {/* Weekly goal progress - Blinkist-style card */}
          {weeklyProgress.lessons > 0 && (
            <Card variant="elevated" padding="lg">
              <Text variant="heading4" marginBottom="sm">
                Weekly Goal
              </Text>
              <Text variant="bodySmall" color="textSecondary" marginBottom="md">
                {weeklyProgress.lessons} lessons completed
              </Text>
              <ProgressBar progress={weeklyProgress.percentage} />
            </Card>
          )}

          {/* Daily lesson - Featured card with Blinkist styling */}
          {todayLesson && (
            <Box>
              <Text variant="heading3" marginBottom="sm">
                Today's Lesson
              </Text>
              <Card
                variant="featured"
                onPress={() => {
                  navigation.navigate('LessonDetail', { lessonId: todayLesson.id });
                }}
                padding="lg"
              >
                <Text variant="heading2" marginBottom="sm">
                  {todayLesson.title}
                </Text>
                <Text variant="body" color="textSecondary" marginBottom="lg">
                  {todayLesson.description}
                </Text>
                <Button
                  variant="primary"
                  onPress={() => {
                    navigation.navigate('LessonDetail', { lessonId: todayLesson.id });
                  }}
                >
                  Start Learning
                </Button>
              </Card>
            </Box>
          )}

          {/* Next Up queue - Blinkist-style section */}
          {nextUp && nextUp.length > 0 && (
            <Box>
              <Text variant="heading3" marginBottom="xs">
                Next Up
              </Text>
              <Text variant="bodySmall" color="textSecondary" marginBottom="md">
                Continue your learning journey
              </Text>
              <Stack gap="md">
                {nextUp.map((lesson) => (
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
