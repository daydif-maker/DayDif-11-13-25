import React, { useEffect } from 'react';
import { ScrollView, FlatList } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Screen, Stack, Text, Card, Avatar, Button, ScreenHeader, GoalRing, Chip } from '@ui';
import { useUserStateStore, usePlansStore } from '@store';
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
import { lessonService } from '@services/api/lessonService';
import { useAuthStore } from '@store';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@designSystem/ThemeProvider';

type TodayScreenNavigationProp = NativeStackNavigationProp<TodayStackParamList, 'Today'>;

// Main content component - rendered when isActive is true
const TodayScreenContent: React.FC = () => {
  const navigation = useNavigation<TodayScreenNavigationProp>();
  const { user } = useAuthStore();
  const {
    greeting,
    userName,
    todayLesson,
    nextUp,
    weeklyProgress,
  } = useTodayScreen();
  const { weeklyGoal } = usePlansStore();
  const iconColorSecondary = useIconColor('secondary');
  const { setTodayLesson, setLessons, setIsGenerating } = useUserStateStore();

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

  const handleRegenerateLesson = async () => {
    if (!user?.id) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsGenerating(true);
    try {
      // TODO: Implement regenerate lesson logic
      // For now, just reload today's lesson
      await lessonService.getDailyLesson(user.id);
      setIsGenerating(false);
    } catch (error) {
      console.error('Failed to regenerate lesson:', error);
      setIsGenerating(false);
    }
  };

  const handleEditPlan = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('CreatePlan');
  };

  const { theme } = useTheme();

  return (
    <>
      {/* Cal AI-inspired subtle gradient backdrop */}
      <LinearGradient
        colors={[theme.colors.background, theme.colors.backgroundSecondary]}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      />
      <Screen backgroundColor="transparent">
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
        <Stack gap="xl" padding="lg" paddingTop="xl">
          {/* Cal AI-inspired header with "For You" title */}
          <Box>
            <Box flexDirection="row" justifyContent="space-between" alignItems="flex-start" marginBottom="md">
              <Box flex={1}>
                <ScreenHeader title="For You" />
              </Box>
              <Box marginTop="xs">
                <Ionicons name="settings-outline" size={24} color={iconColorSecondary} />
              </Box>
            </Box>
            
            {/* Cal AI-inspired greeting block: avatar left, KPI ring right */}
            <Box flexDirection="row" justifyContent="space-between" alignItems="center" marginBottom="xl">
              <Box flex={1}>
                <Text variant="heading3" marginBottom="xs" fontWeight="600">
                  {greeting}
                </Text>
                <Text variant="bodySmall" color="textSecondary">
                  {userName || 'Ready to learn?'}
                </Text>
              </Box>
              {weeklyProgress.percentage > 0 && (
                <Box marginLeft="lg">
                  <GoalRing 
                    progress={weeklyProgress.percentage} 
                    size={80} 
                    strokeWidth={4}
                    centerLabel={weeklyProgress.lessons}
                    showPercentage={false}
                  />
                  <Text variant="caption" color="textTertiary" textAlign="center" marginTop="xs">
                    This week
                  </Text>
                </Box>
              )}
              {weeklyProgress.percentage === 0 && (
                <Avatar name={userName || undefined} size="md" />
              )}
            </Box>
          </Box>

          {/* Daily lesson - Cal AI-inspired featured card with 60/40 split */}
          {todayLesson ? (
            <Box>
              <Text variant="heading3" marginBottom="xs" fontWeight="600">
                Today's Lesson
              </Text>
              <Text variant="bodySmall" color="textSecondary" marginBottom="md">
                Your daily learning session
              </Text>
              <Card variant="featured" padding={0} overflow="hidden">
                <Box flexDirection="row">
                  {/* Art/Visual area - 60% */}
                  <Box 
                    flex={0.6} 
                    backgroundColor="backgroundSecondary" 
                    minHeight={200}
                    justifyContent="center"
                    alignItems="center"
                  >
                    <Ionicons name="book-outline" size={64} color={iconColorSecondary} />
                  </Box>
                  {/* Info area - 40% */}
                  <Box flex={0.4} padding="lg">
                    <Stack gap="sm">
                      <Text variant="heading4" marginBottom="xs" numberOfLines={2}>
                        {todayLesson.title}
                      </Text>
                      <Text variant="caption" color="textTertiary" marginBottom="md" numberOfLines={2}>
                        {todayLesson.description}
                      </Text>
                      <Box flexDirection="row" flexWrap="wrap" gap="xs" marginBottom="md">
                        <Chip selected={false}>
                          {todayLesson.duration} min
                        </Chip>
                        <Chip selected={false}>
                          {todayLesson.category}
                        </Chip>
                      </Box>
                    </Stack>
                  </Box>
                </Box>
                {/* CTA row */}
                <Box padding="lg" paddingTop="md" borderTopWidth={1} borderTopColor="border">
                  <Button
                    variant="primary"
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      navigation.navigate('LessonDetail', { lessonId: todayLesson.id });
                    }}
                  >
                    {todayLesson.completed ? 'Review Lesson' : 'Start Learning'}
                  </Button>
                </Box>
              </Card>
            </Box>
          ) : (
            <Card variant="elevated" padding="lg">
              <Box alignItems="center" justifyContent="center" minHeight={200}>
                <Ionicons name="book-outline" size={48} color={iconColorSecondary} />
                <Text variant="body" color="textSecondary" textAlign="center" marginTop="md">
                  Preparing your next lesson…
                </Text>
              </Box>
            </Card>
          )}

          {/* Next Up queue - Cal AI-inspired horizontal scroll with duration chips */}
          {nextUp && nextUp.length > 0 && (
            <Box>
              <Text variant="heading3" marginBottom="xs" fontWeight="600">
                Next Up
              </Text>
              <Text variant="bodySmall" color="textSecondary" marginBottom="md">
                Continue your learning journey
              </Text>
              <FlatList
                data={nextUp}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ gap: 16, paddingRight: 16 }}
                renderItem={({ item: lesson }) => (
                  <Card
                    variant="outlined"
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      navigation.navigate('LessonDetail', { lessonId: lesson.id });
                    }}
                    padding="md"
                    style={{ width: 280 }}
                  >
                    <Stack gap="xs">
                      <Text variant="heading4" marginBottom="xs" numberOfLines={2} fontWeight="600">
                        {lesson.title}
                      </Text>
                      <Box flexDirection="row" alignItems="center" gap="xs">
                        <Chip selected={false}>
                          {lesson.duration} min
                        </Chip>
                        <Text variant="caption" color="textTertiary">
                          {lesson.category}
                        </Text>
                      </Box>
                    </Stack>
                  </Card>
                )}
              />
            </Box>
          )}

          {/* Weekly Progress Section - Cal AI-inspired donut with micro KPIs */}
          {weeklyProgress.percentage > 0 && (
            <Box>
              <Text variant="heading3" marginBottom="xs" fontWeight="600">
                Weekly Progress
              </Text>
              <Card variant="elevated" padding="lg">
                <Box alignItems="center" marginBottom="md">
                  <GoalRing 
                    progress={weeklyProgress.percentage} 
                    size={140} 
                    strokeWidth={4}
                    centerLabel={`${weeklyProgress.lessons}/${weeklyGoal?.targetLessons || 7}`}
                    showPercentage={false}
                  />
                </Box>
                <Box flexDirection="row" justifyContent="space-around" marginTop="md">
                  <Box alignItems="center">
                    <Text variant="heading4" color="textPrimary">
                      {weeklyProgress.lessons}
                    </Text>
                    <Text variant="caption" color="textTertiary">
                      Lessons
                    </Text>
                  </Box>
                  <Box alignItems="center">
                    <Text variant="heading4" color="textPrimary">
                      {Math.round(weeklyProgress.percentage)}%
                    </Text>
                    <Text variant="caption" color="textTertiary">
                      Complete
                    </Text>
                  </Box>
                </Box>
              </Card>
            </Box>
          )}

          {/* Footer actions - Cal AI style */}
          <Box flexDirection="row" gap="md" marginTop="lg">
            <Box flex={1}>
              <Button
                variant="secondary"
                onPress={handleRegenerateLesson}
              >
                Regenerate Lesson
              </Button>
            </Box>
            <Box flex={1}>
              <Button
                variant="secondary"
                onPress={handleEditPlan}
              >
                Edit Plan
              </Button>
            </Box>
          </Box>
        </Stack>
      </ScrollView>
      </Screen>
    </>
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
