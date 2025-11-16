import React, { useEffect, useState } from 'react';
import { ScrollView } from 'react-native';
import { Screen, Stack, Text, Card, Row, ScreenHeader, Button, ProgressBar, GoalRing } from '@ui';
import { usePlansStore, useUserStateStore, useAuthStore } from '@store';
import { TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { PlansStackParamList } from '@navigation/types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Box } from '@ui/primitives';
import { Ionicons } from '@expo/vector-icons';
import { useIconColor } from '@ui/hooks/useIconColor';
import * as Haptics from 'expo-haptics';

type PlansScreenNavigationProp = NativeStackNavigationProp<PlansStackParamList, 'Plans'>;

export const PlansScreen: React.FC = () => {
  const navigation = useNavigation<PlansScreenNavigationProp>();
  const { user } = useAuthStore();
  const {
    learningHistory,
    kpis,
    weeklyGoal,
    loadKPIs,
    loadLearningHistory,
    loadWeeklyProgress,
    getWeeklyProgress,
  } = usePlansStore();
  const { reset } = useUserStateStore();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const iconColorPrimary = useIconColor('primary');
  const iconColorSecondary = useIconColor('secondary');

  const handleReset = async () => {
    try {
      await reset();
    } catch (error) {
      console.error('Failed to reset user state:', error);
    }
  };

  useEffect(() => {
    if (!user?.id) return;

    const loadData = async () => {
      try {
        // Load KPIs, history, and weekly progress
        await Promise.all([
          loadKPIs(user.id),
          loadWeeklyProgress(user.id),
        ]);

        // Load last 30 days of history
        const endDate = new Date().toISOString().split('T')[0];
        const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0];
        await loadLearningHistory(user.id, startDate, endDate);
      } catch (error) {
        console.error('Failed to load plans screen data:', error);
      }
    };

    loadData();
  }, [user?.id, loadKPIs, loadLearningHistory]);

  // Generate calendar grid (simplified - last 30 days)
  const generateCalendarDays = () => {
    const days = [];
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      const entry = learningHistory.find(e => e.date === dateString);
      days.push({ date: dateString, entry });
    }
    return days;
  };

  const calendarDays = generateCalendarDays();
  const weeklyProgress = getWeeklyProgress();

  const handleMonthChange = (direction: 'prev' | 'next') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newMonth = new Date(currentMonth);
    if (direction === 'prev') {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
  };

  const getMonthName = (date: Date): string => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Stack gap="xl" padding="lg" paddingTop="xl">
          {/* Blinkist-style header */}
          <ScreenHeader
            title="Plans"
            subtitle="Track your learning progress and achievements"
          />

          {/* Month selector */}
          <Box
            flexDirection="row"
            alignItems="center"
            justifyContent="space-between"
            marginBottom="md"
          >
            <TouchableOpacity
              onPress={() => handleMonthChange('prev')}
              activeOpacity={0.7}
            >
              <Ionicons name="chevron-back" size={24} color={iconColorPrimary} />
            </TouchableOpacity>
            <Text variant="heading3">{getMonthName(currentMonth)}</Text>
            <TouchableOpacity
              onPress={() => handleMonthChange('next')}
              activeOpacity={0.7}
            >
              <Ionicons name="chevron-forward" size={24} color={iconColorPrimary} />
            </TouchableOpacity>
          </Box>

          {/* KPI Tiles - Cal AI-inspired horizontal trio with thin progress arcs */}
          <Box>
            <Text variant="heading3" marginBottom="xs" fontWeight="600">
              Your Progress
            </Text>
            <Text variant="bodySmall" color="textSecondary" marginBottom="md">
              Track your learning metrics
            </Text>
            <Row gap="md">
              <Card variant="elevated" flex={1} padding="md">
                <Box alignItems="center">
                  <GoalRing 
                    progress={Math.min((kpis.totalTimeLearned / 1000) * 100, 100)} 
                    size={80} 
                    strokeWidth={4}
                    centerLabel={kpis.totalTimeLearned}
                    showPercentage={false}
                  />
                  <Text variant="caption" color="textTertiary" marginTop="xs" textAlign="center">
                    Minutes Learned
                  </Text>
                </Box>
              </Card>
              <Card variant="elevated" flex={1} padding="md">
                <Box alignItems="center">
                  <GoalRing 
                    progress={Math.min((kpis.totalLessonsCompleted / 50) * 100, 100)} 
                    size={80} 
                    strokeWidth={4}
                    centerLabel={kpis.totalLessonsCompleted}
                    showPercentage={false}
                  />
                  <Text variant="caption" color="textTertiary" marginTop="xs" textAlign="center">
                    Lessons Completed
                  </Text>
                </Box>
              </Card>
              <Card variant="elevated" flex={1} padding="md">
                <Box alignItems="center">
                  <GoalRing 
                    progress={Math.min((kpis.currentStreak / 30) * 100, 100)} 
                    size={80} 
                    strokeWidth={4}
                    centerLabel={kpis.currentStreak}
                    showPercentage={false}
                  />
                  <Text variant="caption" color="textTertiary" marginTop="xs" textAlign="center">
                    Day Streak
                  </Text>
                </Box>
              </Card>
            </Row>
          </Box>

          {/* Weekly Goal Visualization */}
          {weeklyGoal && weeklyProgress.percentage > 0 && (
            <Card variant="elevated" padding="lg">
              <Text variant="heading4" marginBottom="sm">
                Weekly Goal Progress
              </Text>
              <Box flexDirection="row" alignItems="center" gap="md">
                <Box flex={1}>
                  <Text variant="bodySmall" color="textSecondary" marginBottom="xs">
                    {weeklyProgress.lessons} / {weeklyGoal.targetLessons} lessons
                  </Text>
                  <ProgressBar progress={weeklyProgress.percentage} />
                </Box>
                <Text variant="heading3">{Math.round(weeklyProgress.percentage)}%</Text>
              </Box>
            </Card>
          )}

          {/* Calendar Grid - Enhanced styling */}
          <Box>
            <Text variant="heading3" marginBottom="xs">
              Learning History
            </Text>
            <Text variant="bodySmall" color="textSecondary" marginBottom="md">
              Your activity over the last 30 days
            </Text>
            <Box flexDirection="row" flexWrap="wrap" gap="xs" justifyContent="flex-start">
              {calendarDays.map(({ date, entry }) => (
                <TouchableOpacity
                  key={date}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    navigation.navigate('DayDetail', { date });
                  }}
                  activeOpacity={0.7}
                >
                  <Box
                    width={44}
                    height={44}
                    borderRadius="full"
                    backgroundColor={entry ? 'primary' : 'backgroundSecondary'}
                    alignItems="center"
                    justifyContent="center"
                    borderWidth={entry ? 0 : 1}
                    borderColor="border"
                  >
                    <Text
                      variant="caption"
                      color={entry ? 'textInverse' : 'textTertiary'}
                      fontWeight={entry ? '600' : '400'}
                    >
                      {new Date(date).getDate()}
                    </Text>
                  </Box>
                </TouchableOpacity>
              ))}
            </Box>
          </Box>

          {/* Reset Button */}
          <Box marginTop="xl" marginBottom="lg">
            <Button
              variant="outline"
              onPress={handleReset}
              hapticFeedback={true}
            >
              Reset User State
            </Button>
          </Box>
        </Stack>
      </ScrollView>
    </Screen>
  );
};

