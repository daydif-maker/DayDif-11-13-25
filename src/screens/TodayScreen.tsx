import React, { useEffect, useState, useCallback } from 'react';
import { ScrollView, TouchableOpacity, Image, RefreshControl } from 'react-native';
import { Screen, Stack, Text, Fab, Card, Avatar, GoalRing, ContentCard } from '@ui';
import { useUserStateStore, usePlansStore } from '@store';
import { useNavigation } from '@react-navigation/native';
import { TodayStackParamList } from '@navigation/types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Box } from '@ui/primitives';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@designSystem/ThemeProvider';
import { Ionicons } from '@expo/vector-icons';
import { Lesson } from '@store/types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import { useTodayScreen } from '@hooks/useTodayScreen';

// Sub-screens
import { OnboardingScreen } from './today/OnboardingScreen';
import { CreatePlanEmptyState } from './today/CreatePlanEmptyState';
import { GenerationScreen } from './today/GenerationScreen';
import { RegenerationScreen } from './today/RegenerationScreen';
import { OfflineScreen } from './today/OfflineScreen';
import { ErrorScreen } from './today/ErrorScreen';

type TodayScreenNavigationProp = NativeStackNavigationProp<TodayStackParamList, 'Today'>;

// Get greeting based on time of day
const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

// Format date for header
const getFormattedDate = (): string => {
  const date = new Date();
  const options: Intl.DateTimeFormatOptions = { 
    weekday: 'long', 
    month: 'short', 
    day: 'numeric' 
  };
  return date.toLocaleDateString('en-US', options).toUpperCase();
};

const TodayScreenContent: React.FC = () => {
  const navigation = useNavigation<TodayScreenNavigationProp>();
  const [refreshing, setRefreshing] = useState(false);

  const {
    todayLesson,
    nextUp,
    userName,
    refresh,
  } = useTodayScreen();

  const { setTodayLesson, setLessons } = useUserStateStore();
  const { weeklyGoal } = usePlansStore();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const TAB_BAR_HEIGHT = 60;

  // Sync state
  useEffect(() => {
    if (todayLesson) {
      setTodayLesson(todayLesson);
    }
    if (nextUp) {
      const allLessons = todayLesson ? [todayLesson, ...nextUp] : nextUp;
      setLessons(allLessons);
    }
  }, [todayLesson, nextUp, setTodayLesson, setLessons]);

  // Pull to refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refresh();
    } catch (error) {
      console.error('Failed to refresh:', error);
    } finally {
      setRefreshing(false);
    }
  }, [refresh]);

  // Helper to format lesson duration (handles both seconds and minutes)
  const formatDuration = (duration: number): string => {
    // If duration is greater than 60, assume it's in seconds
    if (duration > 60) {
      return `${Math.round(duration / 60)} min`;
    }
    // Otherwise, assume it's already in minutes
    return `${duration} min`;
  };

  // Calculate weekly progress
  const weeklyProgress = weeklyGoal 
    ? {
        current: weeklyGoal.currentLessons,
        target: weeklyGoal.targetLessons,
        percentage: weeklyGoal.targetLessons > 0 
          ? Math.round((weeklyGoal.currentLessons / weeklyGoal.targetLessons) * 100) 
          : 0,
      }
    : { current: 0, target: 5, percentage: 0 };

  const handleCreateLesson = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('CreatePlan');
  };

  const handlePlayLesson = (lessonId?: string) => {
    const id = lessonId || todayLesson?.id;
    if (id) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      navigation.navigate('LessonDetail', { lessonId: id });
    }
  };

  // Placeholder images for Next Up cards
  const placeholderImages = [
    'https://picsum.photos/seed/book1/128/128',
    'https://picsum.photos/seed/book2/128/128',
    'https://picsum.photos/seed/book3/128/128',
    'https://picsum.photos/seed/book4/128/128',
  ];

  // Simulated progress for cards (you can replace with actual progress data)
  const cardProgress = [35, 0, 0, 15];

  return (
    <Screen backgroundColor="background" edges={['top']}>
      <Box flex={1} position="relative">
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: 100,
            paddingHorizontal: theme.spacing.lg,
          }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.colors.primary}
              colors={[theme.colors.primary]}
            />
          }
        >
          <Stack gap="lg" paddingTop="md">
            {/* Header Section */}
            <Box flexDirection="row" justifyContent="space-between" alignItems="flex-start">
              <Box flex={1}>
                <Text 
                  variant="caption" 
                  color="textTertiary" 
                  style={{ letterSpacing: 1, marginBottom: 4 }}
                >
                  {getFormattedDate()}
                </Text>
                <Text variant="heading1">
                  {getGreeting()},{'\n'}{userName?.split(' ')[0] || 'there'}
                </Text>
              </Box>
              <Avatar
                name={userName || 'User'}
                size="md"
                gradient={['#9333EA', '#EC4899']}
                showOnlineIndicator
              />
            </Box>

            {/* Featured Lesson Card */}
            {todayLesson ? (
              <Card
                variant="featured"
                padding="none"
                borderRadius="lg"
                overflow="hidden"
              >
                {/* Image Background with Gradient Overlay */}
                <Box style={{ height: 180, position: 'relative' }}>
                  <Image
                    source={{ uri: 'https://picsum.photos/seed/featured/400/200' }}
                    style={{
                      position: 'absolute',
                      width: '100%',
                      height: '100%',
                    }}
                    resizeMode="cover"
                  />
                  <LinearGradient
                    colors={['rgba(0,0,0,0.2)', 'rgba(26,37,48,0.95)']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    style={{ 
                      position: 'absolute',
                      width: '100%',
                      height: '100%',
                      justifyContent: 'flex-end', 
                      padding: 16 
                    }}
                  >
                  {/* Badge */}
                  <Box
                    position="absolute"
                    top={16}
                    left={16}
                    backgroundColor="surface"
                    paddingHorizontal="sm"
                    paddingVertical="xs"
                    borderRadius="full"
                    flexDirection="row"
                    alignItems="center"
                  >
                    <Box
                      width={6}
                      height={6}
                      borderRadius="full"
                      backgroundColor="success"
                      marginRight="xs"
                    />
                    <Text variant="caption" color="textPrimary" style={{ fontWeight: '600' }}>
                      UP NEXT
                    </Text>
                  </Box>

                  {/* Play Button */}
                  <TouchableOpacity
                    onPress={() => handlePlayLesson()}
                    style={{
                      position: 'absolute',
                      bottom: 16,
                      right: 16,
                    }}
                  >
                    <Box
                      borderRadius="full"
                      backgroundColor="success"
                      alignItems="center"
                      justifyContent="center"
                      style={[
                        { width: 56, height: 56 },
                        theme.shadows.lg
                      ]}
                    >
                      <Ionicons name="play" size={24} color="white" style={{ marginLeft: 3 }} />
                    </Box>
                  </TouchableOpacity>
                  </LinearGradient>
                </Box>

                {/* Content Section */}
                <Box padding="lg" backgroundColor="surface">
                  <Text variant="heading2" marginBottom="xs">
                    {todayLesson.title}
                  </Text>

                  {/* Meta Info Row */}
                  <Box flexDirection="row" alignItems="center" justifyContent="space-between">
                    <Box flexDirection="row" alignItems="center">
                      <Ionicons name="time-outline" size={16} color={theme.colors.textTertiary} />
                      <Text variant="bodySmall" color="textSecondary" style={{ marginLeft: 4 }}>
                        {formatDuration(todayLesson.duration)}
                      </Text>
                    </Box>
                    <TouchableOpacity>
                      <Text variant="bodySmall" color="primary" style={{ fontWeight: '600' }}>
                        Details
                      </Text>
                    </TouchableOpacity>
                  </Box>
                </Box>
              </Card>
            ) : (
              <Card variant="elevated" padding="xl">
                <Text variant="body">No lesson for today. Generate a plan!</Text>
              </Card>
            )}

            {/* Two-Column Widget Row */}
            <Box flexDirection="row" gap="md">
              {/* Weekly Goal Widget */}
              <Box flex={1}>
                <Card
                  variant="elevated"
                  padding="lg"
                  alignItems="center"
                  justifyContent="center"
                  height={160}
                >
                  <GoalRing
                    progress={weeklyProgress.percentage}
                    size={80}
                    strokeWidth={6}
                    centerLabel={`${weeklyProgress.current}/${weeklyProgress.target}`}
                    showPercentage={false}
                  />
                  <Text variant="bodyMedium" color="textPrimary" marginTop="sm">
                    Weekly Goal
                  </Text>
                  <Text variant="caption" color="textTertiary">
                    {weeklyProgress.percentage >= 100 ? 'Goal achieved!' : 
                     weeklyProgress.percentage >= 50 ? 'Keep it up!' : 
                     'Get started!'}
                  </Text>
                </Card>
              </Box>

              {/* Audio Mode Widget */}
              <Box flex={1}>
                <TouchableOpacity activeOpacity={0.8} style={{ flex: 1 }}>
                  <Box
                    flex={1}
                    backgroundColor="audioCardBackground"
                    borderRadius="lg"
                    padding="lg"
                    alignItems="center"
                    justifyContent="center"
                    height={160}
                  >
                    <Ionicons name="headset" size={24} color="white" style={{ marginBottom: 8 }} />
                    <Text variant="bodyMedium" color="textInverse" style={{ fontWeight: '700' }}>
                      Audio Mode
                    </Text>
                    <Text variant="caption" color="textInverse" style={{ opacity: 0.7, textAlign: 'center' }}>
                      Resume your last session
                    </Text>
                  </Box>
                </TouchableOpacity>
              </Box>
            </Box>

            {/* Next Up Section */}
            <Box>
              <Box flexDirection="row" justifyContent="space-between" alignItems="center" marginBottom="md">
                <Text variant="heading3">Next Up</Text>
                <TouchableOpacity>
                  <Box flexDirection="row" alignItems="center">
                    <Text variant="bodySmall" color="primary" style={{ fontWeight: '600' }}>
                      See All
                    </Text>
                    <Ionicons name="chevron-forward" size={16} color={theme.colors.primary} />
                  </Box>
                </TouchableOpacity>
              </Box>
              
              <Stack gap="sm">
                {nextUp && nextUp.length > 0 ? (
                  nextUp.map((lesson: Lesson, index: number) => (
                    <ContentCard
                      key={lesson.id}
                      title={lesson.title}
                      author={lesson.category || 'Learning'}
                      duration={lesson.duration > 60 ? Math.round(lesson.duration / 60) : lesson.duration}
                      thumbnailUrl={placeholderImages[index % placeholderImages.length]}
                      progress={lesson.completed ? 100 : cardProgress[index % cardProgress.length]}
                      onPress={() => handlePlayLesson(lesson.id)}
                    />
                  ))
                ) : (
                  <Text variant="body" color="textSecondary">You're all caught up!</Text>
                )}
              </Stack>
            </Box>
          </Stack>
        </ScrollView>

        {/* Floating Action Button */}
        <Fab
          onPress={handleCreateLesson}
          accessibilityLabel="Create a lesson"
          testID="today-fab-create-lesson"
          style={{
            position: 'absolute',
            right: theme.spacing.lg,
            bottom: TAB_BAR_HEIGHT + insets.bottom + theme.spacing.lg,
          }}
        />
      </Box>
    </Screen>
  );
};

export const TodayScreen: React.FC = () => {
  const {
    isFirstTime,
    isMissingPlan,
    isGeneratingLessons,
    isReturning,
    isOfflineMode,
    isError,
  } = useUserStateStore();

  if (isFirstTime()) return <OnboardingScreen />;
  if (isMissingPlan()) return <CreatePlanEmptyState />;
  if (isGeneratingLessons()) return <GenerationScreen />;
  if (isReturning()) return <RegenerationScreen />;
  if (isOfflineMode()) return <OfflineScreen />;
  if (isError()) return <ErrorScreen />;

  return <TodayScreenContent />;
};
