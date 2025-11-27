import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { ScrollView, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { Screen, Stack, Text, Card, StatCard } from '@ui';
import { Box } from '@ui/primitives';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@designSystem/ThemeProvider';
import { useLessonsStore, usePlansStore, usePlaybackStore, useUserStateStore, useAuthStore, DEMO_PLAN_ID } from '@store';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { PlansStackParamList } from '@navigation/types';
import { useOnboarding } from '@context/OnboardingContext';

type PlansNavigationProp = NativeStackNavigationProp<PlansStackParamList, 'Plans'>;

type CalendarGridDay = {
  key: string;
  label: number;
  date: Date;
  inCurrentMonth: boolean;
  status: 'completed' | 'today' | 'skipped' | 'future';
};

const isSameDay = (first: Date, second: Date) =>
  first.getFullYear() === second.getFullYear() &&
  first.getMonth() === second.getMonth() &&
  first.getDate() === second.getDate();

const formatDateString = (date: Date): string => date.toISOString().split('T')[0];

export const PlansScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<PlansNavigationProp>();
  const today = useMemo(() => new Date(), []);
  const [monthCursor, setMonthCursor] = useState<Date>(today);
  const [refreshing, setRefreshing] = useState(false);

  // Auth store
  const { user } = useAuthStore();
  const activePlanId = useUserStateStore((state) => state.activePlanId);
  const isDemoPlan = activePlanId === DEMO_PLAN_ID;

  // Plans store - real data
  const { 
    kpis, 
    streak, 
    activePlan, 
    learningHistory,
    loadKPIs,
    loadStreakData,
    loadLearningHistory,
    refreshAll,
  } = usePlansStore();

  // Lessons store
  const { completedLessons } = useLessonsStore();

  // Store reset functions
  const resetLessons = useLessonsStore((state) => state.reset);
  const resetPlans = usePlansStore((state) => state.reset);
  const resetPlayback = usePlaybackStore((state) => state.reset);
  const resetProgress = useUserStateStore((state) => state.resetProgress);

  // Onboarding reset
  const { resetOnboarding } = useOnboarding();

  // Load data on mount
  useEffect(() => {
    if (user?.id && !isDemoPlan) {
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 3); // Load last 3 months
      const endDate = new Date();
      
      loadKPIs(user.id);
      loadStreakData(user.id);
      loadLearningHistory(user.id, formatDateString(startDate), formatDateString(endDate));
    }
  }, [user?.id, loadKPIs, loadStreakData, loadLearningHistory, isDemoPlan]);

  // Get completed days from learning history
  const getCompletedDaysFromHistory = useCallback((month: number, year: number): Set<number> => {
    const completed = new Set<number>();
    
    // Check learning history from store
    learningHistory.forEach(entry => {
      const entryDate = new Date(entry.date);
      if (entryDate.getMonth() === month && entryDate.getFullYear() === year) {
        if (entry.lessonsCompleted > 0) {
          completed.add(entryDate.getDate());
        }
      }
    });

    // Also check completed lessons from lessons store
    completedLessons.forEach(lesson => {
      if (lesson.completedAt) {
        const completedDate = new Date(lesson.completedAt);
        if (completedDate.getMonth() === month && completedDate.getFullYear() === year) {
          completed.add(completedDate.getDate());
        }
      }
    });

    return completed;
  }, [learningHistory, completedLessons]);

  // Build calendar grid with real data
  const buildCalendarGrid = useCallback((cursor: Date, todayDate: Date): CalendarGridDay[] => {
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const startOfMonth = new Date(year, month, 1);
    const endOfMonth = new Date(year, month + 1, 0);
    const daysInMonth = endOfMonth.getDate();
    const startDayOfWeek = startOfMonth.getDay();
    const startOffset = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;
    const previousMonthDays = new Date(year, month, 0).getDate();

    const completedDays = getCompletedDaysFromHistory(month, year);
    const days: CalendarGridDay[] = [];

    // Previous month days
    for (let index = 0; index < startOffset; index++) {
      const day = previousMonthDays - startOffset + index + 1;
      const date = new Date(year, month - 1, day);
      days.push({ key: `prev-${day}`, label: day, date, inCurrentMonth: false, status: 'future' });
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isToday = isSameDay(date, todayDate);
      const isPast = date < todayDate && !isToday;
      const isCompleted = completedDays.has(day);
      
      let status: CalendarGridDay['status'];
      if (isToday) {
        status = 'today';
      } else if (isPast && isCompleted) {
        status = 'completed';
      } else if (isPast && !isCompleted) {
        status = 'skipped';
      } else {
        status = 'future';
      }

      days.push({ key: `current-${day}`, label: day, date, inCurrentMonth: true, status });
    }

    // Next month days - fill to complete the last week
    let nextDay = 1;
    while (days.length % 7 !== 0) {
      const date = new Date(year, month + 1, nextDay);
      days.push({ key: `next-${nextDay}`, label: nextDay, date, inCurrentMonth: false, status: 'future' });
      nextDay += 1;
    }

    return days;
  }, [getCompletedDaysFromHistory]);

  const handleResetProgress = useCallback(() => {
    Alert.alert(
      'Reset Progress',
      'This will clear all your learning progress, streaks, and achievements. Your account and preferences will be kept. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            resetLessons();
            resetPlans();
            resetPlayback();
            await resetProgress();
          },
        },
      ]
    );
  }, [resetLessons, resetPlans, resetPlayback, resetProgress]);

  const handleCompleteReset = useCallback(() => {
    Alert.alert(
      'Complete Reset',
      'This will reset everything and take you back to the beginning of onboarding. All your progress, preferences, and settings will be erased. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset Everything',
          style: 'destructive',
          onPress: async () => {
            // resetOnboarding now handles clearing all stores internally
            await resetOnboarding();
          },
        },
      ]
    );
  }, [resetOnboarding]);

  const onRefresh = useCallback(async () => {
    if (!user?.id || isDemoPlan) return;
    setRefreshing(true);
    try {
      await refreshAll(user.id);
    } catch (error) {
      console.error('Failed to refresh:', error);
    } finally {
      setRefreshing(false);
    }
  }, [user?.id, refreshAll]);

  const calendarDays = useMemo(
    () => buildCalendarGrid(monthCursor, today),
    [monthCursor, today, buildCalendarGrid]
  );

  const weekDayLabels = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
  const monthLabel = monthCursor.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const handleMonthChange = (direction: number) => {
    setMonthCursor(prev => new Date(prev.getFullYear(), prev.getMonth() + direction, 1));
  };

  const handleDayPress = useCallback((day: CalendarGridDay) => {
    const dateString = formatDateString(day.date);
    navigation.navigate('DayDetail', { date: dateString });
  }, [navigation]);

  // Calculate stats from real data
  const totalMinutes = kpis.totalTimeLearned || 0;
  const totalHours = Math.floor(totalMinutes / 60);
  const totalLessons = kpis.totalLessonsCompleted || completedLessons.length || 0;
  const dayStreak = streak.current || kpis.currentStreak || 0;

  // Format hours display
  const formatTimeDisplay = () => {
    if (totalHours === 0 && totalMinutes > 0) {
      return `${totalMinutes}m`;
    }
    return `${totalHours}h`;
  };

  return (
    <Screen backgroundColor="background" edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: theme.spacing.lg,
          paddingBottom: 100,
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
          {/* Header */}
          <Box>
            <Text 
              variant="caption" 
              color="textTertiary" 
              style={{ letterSpacing: 1, marginBottom: 4 }}
            >
              YOUR PROGRESS
            </Text>
            <Text variant="heading1">Learning Journey</Text>
          </Box>

          {/* Active Plan Card (if exists) */}
          {activePlan && (
            <Card variant="elevated" padding="lg">
              <Box flexDirection="row" alignItems="center" justifyContent="space-between">
                <Box flex={1}>
                  <Text variant="caption" color="textTertiary" marginBottom="xs">
                    CURRENT PLAN
                  </Text>
                  <Text variant="heading4" numberOfLines={1}>
                    {activePlan.name || 'Learning Plan'}
                  </Text>
                  {activePlan.topics && activePlan.topics.length > 0 && (
                    <Text variant="bodySmall" color="textSecondary" marginTop="xs">
                      {activePlan.topics[0]}
                    </Text>
                  )}
                </Box>
                <Box 
                  backgroundColor="primary" 
                  paddingHorizontal="md" 
                  paddingVertical="xs" 
                  borderRadius="full"
                >
                  <Text variant="caption" color="textInverse" fontWeight="600">
                    {activePlan.goal.currentLessons}/{activePlan.goal.targetLessons} lessons
                  </Text>
                </Box>
              </Box>
            </Card>
          )}

          {/* Stats Row */}
          <Box flexDirection="row" gap="sm">
            <StatCard
              icon="time"
              value={formatTimeDisplay()}
              label="Total Time"
              iconColor={theme.colors.primary}
            />
            <StatCard
              icon="document-text"
              value={totalLessons}
              label="Lessons"
              iconColor={theme.colors.primary}
            />
            <StatCard
              icon="flame"
              value={dayStreak}
              label="Day Streak"
              iconColor={theme.colors.success}
            />
          </Box>

          {/* Learning Archive Calendar */}
          <Box>
            <Box flexDirection="row" alignItems="center" justifyContent="space-between" marginBottom="md">
              <Text variant="heading3">Learning Archive</Text>
              <Box flexDirection="row" alignItems="center" gap="md">
                <TouchableOpacity onPress={() => handleMonthChange(-1)}>
                  <Ionicons name="chevron-back" size={20} color={theme.colors.textPrimary} />
                </TouchableOpacity>
                <Text variant="body" color="textPrimary" style={{ minWidth: 120, textAlign: 'center' }}>
                  {monthLabel}
                </Text>
                <TouchableOpacity onPress={() => handleMonthChange(1)}>
                  <Ionicons name="chevron-forward" size={20} color={theme.colors.textPrimary} />
                </TouchableOpacity>
              </Box>
            </Box>

            <Card variant="elevated" padding="lg">
              {/* Weekday Labels */}
              <Box flexDirection="row" marginBottom="sm">
                {weekDayLabels.map((label) => (
                  <Box key={label} style={{ width: `${100 / 7}%` }} alignItems="center">
                    <Text variant="caption" color="textTertiary" style={{ fontSize: 10, fontWeight: '600' }}>
                      {label}
                    </Text>
                  </Box>
                ))}
              </Box>

              {/* Calendar Grid */}
              <Box>
                {Array.from({ length: Math.ceil(calendarDays.length / 7) }, (_, weekIndex) => (
                  <Box key={`week-${weekIndex}`} flexDirection="row">
                    {Array.from({ length: 7 }, (_, dayIndex) => {
                      const day = calendarDays[weekIndex * 7 + dayIndex];
                      if (!day) return <Box key={`empty-${weekIndex}-${dayIndex}`} style={{ width: `${100 / 7}%` }} />;
                      
                      const isCompleted = day.status === 'completed';
                      const isToday = day.status === 'today';
                      const isSkipped = day.status === 'skipped';
                      const isClickable = day.inCurrentMonth;

                      return (
                        <TouchableOpacity
                          key={day.key}
                          onPress={() => isClickable && handleDayPress(day)}
                          disabled={!isClickable}
                          activeOpacity={0.7}
                          style={{
                            width: `${100 / 7}%`,
                            alignItems: 'center',
                            marginVertical: 4,
                          }}
                        >
                          <Box
                            borderRadius="full"
                            alignItems="center"
                            justifyContent="center"
                            style={{
                              width: 36,
                              height: 36,
                              backgroundColor: isCompleted ? theme.colors.success : 'transparent',
                              borderWidth: isToday ? 2 : isSkipped ? 1 : 0,
                              borderColor: isToday ? theme.colors.success : theme.colors.border,
                              borderStyle: isSkipped ? 'dashed' : 'solid',
                            }}
                          >
                            <Text
                              variant="bodySmall"
                              color={isCompleted ? 'textInverse' : day.inCurrentMonth ? 'textPrimary' : 'textTertiary'}
                              style={{ 
                                fontWeight: isToday || isCompleted ? '600' : '400',
                                opacity: day.inCurrentMonth ? 1 : 0.4 
                              }}
                            >
                              {day.label}
                            </Text>
                            {isCompleted && (
                              <Box
                                style={{
                                  position: 'absolute',
                                  bottom: 4,
                                  width: 4,
                                  height: 4,
                                  borderRadius: 2,
                                  backgroundColor: 'white',
                                }}
                              />
                            )}
                          </Box>
                        </TouchableOpacity>
                      );
                    })}
                  </Box>
                ))}
              </Box>

              {/* Legend */}
              <Box flexDirection="row" justifyContent="center" gap="lg" marginTop="lg">
                <Box flexDirection="row" alignItems="center">
                  <Box
                    width={12}
                    height={12}
                    borderRadius="sm"
                    backgroundColor="success"
                    marginRight="xs"
                  />
                  <Text variant="caption" color="textSecondary">Completed</Text>
                </Box>
                <Box flexDirection="row" alignItems="center">
                  <Box
                    width={12}
                    height={12}
                    borderRadius="sm"
                    borderWidth={2}
                    borderColor="success"
                    marginRight="xs"
                  />
                  <Text variant="caption" color="textSecondary">Today</Text>
                </Box>
                <Box flexDirection="row" alignItems="center">
                  <Box
                    width={12}
                    height={12}
                    borderRadius="sm"
                    borderWidth={1}
                    borderColor="border"
                    marginRight="xs"
                  />
                  <Text variant="caption" color="textSecondary">Skipped</Text>
                </Box>
              </Box>
            </Card>
          </Box>

          {/* Reset Progress Section */}
          <Box marginTop="xl" paddingTop="lg" borderTopWidth={1} borderColor="border">
            <Text variant="caption" color="textTertiary" style={{ textAlign: 'center', marginBottom: 12 }}>
              Need a fresh start?
            </Text>
            <TouchableOpacity
              onPress={handleResetProgress}
              style={{
                paddingVertical: 14,
                paddingHorizontal: 24,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: theme.colors.error,
                alignItems: 'center',
              }}
            >
              <Box flexDirection="row" alignItems="center" gap="sm">
                <Ionicons name="refresh-outline" size={18} color={theme.colors.error} />
                <Text variant="body" style={{ color: theme.colors.error, fontWeight: '500' }}>
                  Reset Progress
                </Text>
              </Box>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleCompleteReset}
              style={{
                marginTop: 12,
                paddingVertical: 14,
                paddingHorizontal: 24,
                borderRadius: 12,
                backgroundColor: theme.colors.error,
                alignItems: 'center',
              }}
            >
              <Box flexDirection="row" alignItems="center" gap="sm">
                <Ionicons name="nuclear-outline" size={18} color="white" />
                <Text variant="body" style={{ color: 'white', fontWeight: '600' }}>
                  Complete Reset
                </Text>
              </Box>
            </TouchableOpacity>
          </Box>
        </Stack>
      </ScrollView>
    </Screen>
  );
};
