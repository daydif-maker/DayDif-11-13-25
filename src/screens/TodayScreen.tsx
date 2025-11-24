import React, { useEffect } from 'react';
import { ScrollView, TouchableOpacity } from 'react-native';
import { Screen, Stack, Text, Fab, Card, Avatar, GoalRing } from '@ui';
import { useUserStateStore } from '@store';
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

const WaveformPlaceholder = () => {
  // Create a high-fidelity waveform with more bars
  const heights = [
    18, 25, 12, 35, 20, 30, 15, 40, 28, 22, 32, 18, 38, 14, 28, 
    24, 33, 19, 27, 16, 36, 21, 29, 17, 34, 23, 31, 19, 26, 15,
    37, 22, 30, 18, 35, 20, 28, 16, 32, 24
  ];

  return (
    <Box flexDirection="row" alignItems="center" style={{ height: 50, gap: 3 }}>
      {heights.map((h, i) => (
        <Box
          key={i}
          style={{ 
            width: 2.5, 
            height: h,
            backgroundColor: i % 3 === 0 ? '#00BFA5' : 'rgba(0, 191, 165, 0.2)'
          }}
          borderRadius="full"
        />
      ))}
    </Box>
  );
};

const TodayScreenContent: React.FC = () => {
  const navigation = useNavigation<TodayScreenNavigationProp>();

  const {
    todayLesson,
    nextUp,
    userName,
  } = useTodayScreen();

  const { setTodayLesson, setLessons } = useUserStateStore();
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

  return (
    <Screen backgroundColor="background" edges={['top']}>
      <Box flex={1} position="relative">
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: 100,
            paddingHorizontal: theme.spacing.lg,
          }}
        >
          <Stack gap="xl" paddingTop="md">
            {/* Header */}
            <Box flexDirection="row" justifyContent="space-between" alignItems="center">
              <Box flexDirection="row" alignItems="center" gap="md">
                <Avatar
                  name={userName || 'User'}
                  size="md"
                  gradient={['#9333EA', '#EC4899']}
                // source={{ uri: user?.avatarUrl }} // Uncomment if avatar URL is available
                />
                <Text variant="heading3">
                  Good Morning, {userName?.split(' ')[0] || 'Alex'}
                </Text>
              </Box>
              <GoalRing
                progress={60} // Hardcoded 3/5 for now as per requirement "showing '3/5'"
                size={50}
                strokeWidth={4}
                centerLabel="3/5"
                showPercentage={false}
              />
            </Box>

            {/* Hero Card - Lesson of the Day */}
            {todayLesson ? (
              <Card
                variant="elevated"
                backgroundColor="backgroundSecondary" // Lighter background token
                onPress={() => handlePlayLesson()}
                style={[
                  theme.shadows.md,
                  { paddingHorizontal: 24, paddingVertical: 28 }
                ]}
              >
                <Stack gap="md">
                  <Text variant="label" color="success" style={{ fontSize: 11 }}>
                    LESSON OF THE DAY
                  </Text>
                  <Box gap="xs">
                    <Text variant="heading2">
                      {todayLesson.title}
                    </Text>
                    <Text variant="body" color="textSecondary">
                      {Math.round(todayLesson.duration / 60)} min listen
                    </Text>
                  </Box>

                  <Box flexDirection="row" alignItems="center" gap="md" marginTop="sm">
                    <TouchableOpacity onPress={() => handlePlayLesson()}>
                      <Box
                        borderRadius="full"
                        backgroundColor="success"
                        alignItems="center"
                        justifyContent="center"
                        style={[
                          { width: 64, height: 64 },
                          theme.shadows.lg
                        ]}
                      >
                        <Ionicons name="play" size={28} color="white" style={{ marginLeft: 4 }} />
                      </Box>
                    </TouchableOpacity>
                    <WaveformPlaceholder />
                  </Box>
                </Stack>
              </Card>
            ) : (
              <Card variant="elevated" padding="xl">
                <Text variant="body">No lesson for today. Generate a plan!</Text>
              </Card>
            )}

            {/* Next Up List */}
            <Box>
              <Text variant="heading3" marginBottom="md">Next Up</Text>
              <Stack gap="md">
                {nextUp && nextUp.length > 0 ? (
                  nextUp.map((lesson: Lesson, index: number) => {
                    // Cycling gradient patterns
                    const gradientPatterns = [
                      ['#4A90E2', '#7B68EE'], // Blue → Purple
                      ['#FF6B35', '#FF4500'], // Orange → Red
                      ['#F4D6CC', '#FFB5A7'], // Beige → Peach
                    ];
                    const gradient = gradientPatterns[index % 3];

                    return (
                      <Card
                        key={lesson.id}
                        variant="flat"
                        padding="md"
                        onPress={() => handlePlayLesson(lesson.id)}
                        flexDirection="row"
                        alignItems="center"
                        justifyContent="space-between"
                        style={{ backgroundColor: '#F1F5F9', borderRadius: 12 }}
                      >
                        <Box flexDirection="row" alignItems="center" gap="md" flex={1}>
                          {/* Gradient Thumbnail */}
                          <LinearGradient
                            colors={gradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={{ 
                              width: 56, 
                              height: 56, 
                              borderRadius: 12
                            }}
                          />
                          <Box flex={1}>
                            <Text variant="bodyMedium" numberOfLines={1}>
                              {lesson.title}
                            </Text>
                            <Text variant="caption" color="success">
                              {Math.round(lesson.duration / 60)} min listen
                            </Text>
                          </Box>
                        </Box>
                        <Box
                          style={{ 
                            width: 32, 
                            height: 32,
                            backgroundColor: '#1A2C42'
                          }}
                          borderRadius="full"
                          alignItems="center"
                          justifyContent="center"
                        >
                          <Ionicons name="play" size={16} color="white" style={{ marginLeft: 2 }} />
                        </Box>
                      </Card>
                    );
                  })
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
          // icon prop removed to use default 'add' icon
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
