import React, { useEffect } from 'react';
import { ScrollView } from 'react-native';
import { Screen, Stack, Text, Card, Avatar, ProgressBar, Button } from '@ui';
import { useLessonsStore } from '@store';
import { lessonService } from '@services/api/lessonService';
import { plansService } from '@services/api/plansService';
import { usePlansStore } from '@store';
import { useUserStore } from '@store';
import { useNavigation } from '@react-navigation/native';
import { TodayStackParamList } from '@navigation/types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Box } from '@ui/primitives';
import { Ionicons } from '@expo/vector-icons';

type TodayScreenNavigationProp = NativeStackNavigationProp<TodayStackParamList, 'Today'>;

export const TodayScreen: React.FC = () => {
  const navigation = useNavigation<TodayScreenNavigationProp>();
  const { dailyLesson, nextUpQueue, setDailyLesson, addToQueue } = useLessonsStore();
  const { weeklyGoal, getWeeklyProgress } = usePlansStore();
  const { userProfile } = useUserStore();

  useEffect(() => {
    const loadData = async () => {
      try {
        const lesson = await lessonService.getDailyLesson();
        setDailyLesson(lesson);

        const queue = await lessonService.getLessonQueue();
        queue.forEach(l => addToQueue(l));

        const goal = await plansService.getStreakData();
        // Load weekly goal if needed
      } catch (error) {
        console.error('Failed to load today screen data:', error);
      }
    };

    loadData();
  }, []);

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
                <Text variant="heading1" marginBottom="xs">
                  For You
                </Text>
                {/* Green underline matching Blinkist */}
                <Box
                  width={40}
                  height={3}
                  backgroundColor="primary"
                  borderRadius="sm"
                  marginBottom="md"
                />
              </Box>
              <Box marginTop="xs">
                <Ionicons name="settings-outline" size={24} color="#616161" />
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
                {nextUpQueue.map(lesson => (
                  <Card
                    key={lesson.id}
                    variant="outlined"
                    onPress={() => {
                      navigation.navigate('LessonDetail', { lessonId: lesson.id });
                    }}
                    padding="md"
                  >
                    <Text variant="body" marginBottom="xs" style={{ fontWeight: '600' }}>
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

