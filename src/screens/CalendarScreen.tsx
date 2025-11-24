import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, TouchableOpacity } from 'react-native';
import { Screen, Stack, Text, Card, GoalRing } from '@ui';
import { Box } from '@ui/primitives';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@designSystem/ThemeProvider';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { PlansStackParamList } from '@navigation/types';
import { useAuthStore, usePlansStore } from '@store';
import { LearningHistoryEntry } from '@store/types';
import { Theme } from '@designSystem/theme';

type CalendarNavigationProp = NativeStackNavigationProp<
  PlansStackParamList,
  'Calendar'
>;

const formatDate = (date: Date) => date.toISOString().split('T')[0];

const getMonthBounds = (cursor: Date) => {
  const start = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
  const end = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0);
  return { start, end };
};

const getIntensityLevel = (entry?: LearningHistoryEntry) => {
  if (!entry) return 0;
  if (entry.lessonsCompleted >= 3 || entry.timeSpent >= 40) return 3;
  if (entry.lessonsCompleted >= 2 || entry.timeSpent >= 25) return 2;
  return 1;
};

export const CalendarScreen: React.FC = () => {
  const navigation = useNavigation<CalendarNavigationProp>();
  const { theme } = useTheme();
  const { user } = useAuthStore();
  const { learningHistory, loadLearningHistory, isLoading } = usePlansStore();
  const [monthCursor, setMonthCursor] = useState(() => new Date());

  const todayStr = formatDate(new Date());
  const { start, end } = useMemo(() => getMonthBounds(monthCursor), [monthCursor]);
  const startDateStr = formatDate(start);
  const endDateStr = formatDate(end);
  const daysInMonth = end.getDate();

  useEffect(() => {
    if (!user?.id) return;
    loadLearningHistory(user.id, startDateStr, endDateStr);
  }, [user?.id, startDateStr, endDateStr, loadLearningHistory]);

  const monthHistory = useMemo(
    () =>
      learningHistory.filter(
        entry => entry.date >= startDateStr && entry.date <= endDateStr
      ),
    [learningHistory, startDateStr, endDateStr]
  );

  const historyMap = useMemo(() => {
    const map: Record<string, LearningHistoryEntry> = {};
    monthHistory.forEach(entry => {
      map[entry.date] = entry;
    });
    return map;
  }, [monthHistory]);

  const summary = useMemo(
    () =>
      monthHistory.reduce(
        (acc, entry) => {
          acc.lessons += entry.lessonsCompleted;
          acc.minutes += entry.timeSpent;
          acc.activeDays += 1;
          if (!acc.bestDay || entry.timeSpent > acc.bestDay.timeSpent) {
            acc.bestDay = entry;
          }
          return acc;
        },
        {
          lessons: 0,
          minutes: 0,
          activeDays: 0,
          bestDay: null as LearningHistoryEntry | null,
        }
      ),
    [monthHistory]
  );

  const averageMinutes = summary.activeDays
    ? Math.round(summary.minutes / summary.activeDays)
    : 0;

  const daysElapsed = useMemo(() => {
    const now = new Date();
    const isThisMonth =
      now.getFullYear() === monthCursor.getFullYear() &&
      now.getMonth() === monthCursor.getMonth();
    return isThisMonth ? now.getDate() : daysInMonth;
  }, [monthCursor, daysInMonth]);

  const engagementPercent =
    daysElapsed > 0 ? (summary.activeDays / daysElapsed) * 100 : 0;

  const weekLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const startOffset = (start.getDay() + 6) % 7; // Monday-first

  const calendarDays = useMemo(() => {
    const grid: Array<{
      key: string;
      date: Date | null;
      dateString?: string;
      entry?: LearningHistoryEntry;
      level?: number;
      isToday?: boolean;
    }> = [];

    for (let i = 0; i < startOffset; i++) {
      grid.push({ key: `pad-${i}`, date: null });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(
        monthCursor.getFullYear(),
        monthCursor.getMonth(),
        day
      );
      const dateString = formatDate(date);
      const entry = historyMap[dateString];
      grid.push({
        key: dateString,
        date,
        dateString,
        entry,
        level: getIntensityLevel(entry),
        isToday: dateString === todayStr,
      });
    }

    return grid;
  }, [startOffset, daysInMonth, monthCursor, historyMap, todayStr]);

  const recentEntries = useMemo(
    () =>
      [...monthHistory]
        .sort((a, b) => (a.date < b.date ? 1 : -1))
        .slice(0, 4),
    [monthHistory]
  );

  const handleMonthChange = (direction: number) => {
    setMonthCursor(prev => new Date(prev.getFullYear(), prev.getMonth() + direction, 1));
  };

  const getLevelStyle = (level: number, isToday?: boolean) => {
    type LevelStyle = {
      backgroundColor: string;
      borderColor: string;
      textColor: keyof Theme['colors'];
    };

    const palette: Record<0 | 1 | 2 | 3, LevelStyle> = {
      0: {
        backgroundColor: theme.colors.backgroundSecondary,
        borderColor: theme.colors.border,
        textColor: 'textPrimary',
      },
      1: {
        backgroundColor: 'rgba(0, 191, 165, 0.12)',
        borderColor: 'rgba(0, 191, 165, 0.28)',
        textColor: 'textPrimary',
      },
      2: {
        backgroundColor: 'rgba(0, 191, 165, 0.22)',
        borderColor: 'rgba(0, 191, 165, 0.45)',
        textColor: 'textPrimary',
      },
      3: {
        backgroundColor: 'rgba(0, 191, 165, 0.7)',
        borderColor: theme.colors.primary,
        textColor: 'textInverse',
      },
    };

    const safeLevel = (level >= 0 && level <= 3 ? level : 0) as 0 | 1 | 2 | 3;
    const base = palette[safeLevel];
    return {
      backgroundColor: base.backgroundColor,
      borderColor: isToday ? theme.colors.primary : base.borderColor,
      textColor: base.textColor,
    };
  };

  const monthLabel = monthCursor.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <Screen backgroundColor="background" edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <Stack gap="lg" padding="lg">
          <Box
            flexDirection="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <TouchableOpacity
              onPress={() => {
                if (navigation.canGoBack()) {
                  navigation.goBack();
                }
              }}
            >
              <Box
                padding="sm"
                borderRadius="lg"
                backgroundColor="backgroundSecondary"
              >
                <Ionicons
                  name="chevron-back"
                  size={22}
                  color={theme.colors.textPrimary}
                />
              </Box>
            </TouchableOpacity>
            <Stack gap="xs" flex={1} marginLeft="md">
              <Text variant="heading3">Progress Calendar</Text>
              <Text variant="caption" color="textSecondary">
                See your learning streak over time
              </Text>
            </Stack>
            <Box
              paddingHorizontal="md"
              paddingVertical="sm"
              borderRadius="lg"
              backgroundColor="backgroundSecondary"
            >
              <Text variant="bodySmall" color="textSecondary">
                {monthLabel}
              </Text>
            </Box>
          </Box>

          <Card
            variant="elevated"
            backgroundColor="backgroundSecondary"
            style={theme.shadows.md}
          >
            <Box
              flexDirection="row"
              alignItems="center"
              justifyContent="space-between"
              style={{ gap: theme.spacing.lg }}
            >
              <Stack gap="xs" flex={1}>
                <Text variant="heading3">This month</Text>
                <Text variant="bodySmall" color="textSecondary">
                  Active {summary.activeDays}/{daysElapsed} days so far
                </Text>
                <Box flexDirection="row" alignItems="center" style={{ gap: 12 }}>
                  <Box
                    paddingHorizontal="sm"
                    paddingVertical="xs"
                    borderRadius="full"
                    backgroundColor="background"
                  >
                    <Text variant="caption" color="textSecondary">
                      {summary.lessons} lessons
                    </Text>
                  </Box>
                  <Box
                    paddingHorizontal="sm"
                    paddingVertical="xs"
                    borderRadius="full"
                    backgroundColor="background"
                  >
                    <Text variant="caption" color="textSecondary">
                      {summary.minutes} mins
                    </Text>
                  </Box>
                  {averageMinutes > 0 && (
                    <Box
                      paddingHorizontal="sm"
                      paddingVertical="xs"
                      borderRadius="full"
                      backgroundColor="background"
                    >
                      <Text variant="caption" color="textSecondary">
                        Avg {averageMinutes}m/day
                      </Text>
                    </Box>
                  )}
                </Box>
              </Stack>
              <GoalRing
                progress={Math.min(100, engagementPercent)}
                size={84}
                strokeWidth={5}
                centerLabel={`${summary.activeDays}/${daysElapsed}`}
                showPercentage={false}
              />
            </Box>
          </Card>

          <Card
            variant="elevated"
            backgroundColor="backgroundSecondary"
            style={theme.shadows.md}
          >
            <Box
              flexDirection="row"
              alignItems="center"
              justifyContent="space-between"
            >
              <TouchableOpacity onPress={() => handleMonthChange(-1)}>
                <Box
                  padding="sm"
                  borderRadius="lg"
                  backgroundColor="background"
                >
                  <Ionicons
                    name="chevron-back"
                    size={20}
                    color={theme.colors.textPrimary}
                  />
                </Box>
              </TouchableOpacity>
              <Stack gap="xs" alignItems="center" flex={1}>
                <Text variant="heading3">{monthLabel}</Text>
                <Text variant="caption" color="textSecondary">
                  Tap a day to open details
                </Text>
              </Stack>
              <TouchableOpacity onPress={() => handleMonthChange(1)}>
                <Box
                  padding="sm"
                  borderRadius="lg"
                  backgroundColor="background"
                >
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={theme.colors.textPrimary}
                  />
                </Box>
              </TouchableOpacity>
            </Box>

            <Box
              flexDirection="row"
              justifyContent="space-between"
              marginTop="lg"
              style={{ paddingHorizontal: 4 }}
            >
              {weekLabels.map(label => (
                <Box key={label} style={{ width: '14.28%' }} alignItems="center">
                  <Text variant="caption" color="textSecondary">
                    {label}
                  </Text>
                </Box>
              ))}
            </Box>

            <Box
              flexDirection="row"
              flexWrap="wrap"
              marginTop="md"
              style={{ gap: 12 }}
            >
              {calendarDays.map(day => {
                if (!day.date) {
                  return (
                    <Box
                      key={day.key}
                      style={{ width: '14.28%', padding: 4 }}
                    />
                  );
                }

                const { backgroundColor, borderColor, textColor } = getLevelStyle(
                  day.level || 0,
                  day.isToday
                );

                return (
                  <TouchableOpacity
                    key={day.key}
                    onPress={() =>
                      day.dateString &&
                      navigation.navigate('DayDetail', { date: day.dateString })
                    }
                    style={{ width: '14.28%', padding: 4 }}
                    disabled={!day.dateString}
                  >
                    <Box
                      borderRadius="lg"
                      padding="sm"
                      style={{
                        aspectRatio: 1,
                        backgroundColor,
                        borderColor,
                        borderWidth: 1,
                        justifyContent: 'space-between',
                      }}
                    >
                      <Text variant="bodySmall" color={textColor}>
                        {day.date.getDate()}
                      </Text>
                      <Text
                        variant="caption"
                        color={textColor}
                        numberOfLines={1}
                        style={{ opacity: day.entry ? 0.9 : 0.5 }}
                      >
                        {day.entry
                          ? `${day.entry.lessonsCompleted} • ${day.entry.timeSpent}m`
                          : '—'}
                      </Text>
                    </Box>
                  </TouchableOpacity>
                );
              })}
            </Box>

            <Box
              flexDirection="row"
              alignItems="center"
              justifyContent="space-between"
              marginTop="lg"
            >
              {[3, 2, 1, 0].map(level => {
                const { backgroundColor, borderColor } = getLevelStyle(level);
                const label =
                  level === 3
                    ? 'Deep day'
                    : level === 2
                      ? 'Solid day'
                      : level === 1
                        ? 'Light day'
                        : 'No activity';

                return (
                  <Box
                    key={label}
                    flexDirection="row"
                    alignItems="center"
                    style={{ gap: 6 }}
                  >
                    <Box
                      width={14}
                      height={14}
                      borderRadius="full"
                      style={{
                        backgroundColor,
                        borderColor,
                        borderWidth: 1,
                      }}
                    />
                    <Text variant="caption" color="textSecondary">
                      {label}
                    </Text>
                  </Box>
                );
              })}
            </Box>
          </Card>

          {recentEntries.length > 0 ? (
            <Stack gap="sm">
              <Text variant="heading3">Recent highlights</Text>
              {recentEntries.map(entry => {
                const entryDate = new Date(entry.date);
                const readableDate = entryDate.toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                });

                return (
                  <Card
                    key={entry.date}
                    variant="elevated"
                    backgroundColor="backgroundSecondary"
                    style={theme.shadows.sm}
                    onPress={() =>
                      navigation.navigate('DayDetail', { date: entry.date })
                    }
                  >
                    <Box
                      flexDirection="row"
                      alignItems="center"
                      justifyContent="space-between"
                    >
                      <Stack gap="xs">
                        <Text variant="bodyMedium">{readableDate}</Text>
                        <Text variant="caption" color="textSecondary">
                          {entry.lessonsCompleted} lesson
                          {entry.lessonsCompleted === 1 ? '' : 's'} ·{' '}
                          {entry.timeSpent} min learned
                        </Text>
                      </Stack>
                      <Ionicons
                        name="arrow-forward"
                        size={16}
                        color={theme.colors.textSecondary}
                      />
                    </Box>
                  </Card>
                );
              })}
            </Stack>
          ) : (
            !isLoading && (
              <Card
                variant="elevated"
                backgroundColor="backgroundSecondary"
                style={theme.shadows.sm}
              >
                <Text variant="body">
                  We'll chart your learning streak here once you've started a
                  few lessons.
                </Text>
              </Card>
            )
          )}
        </Stack>
      </ScrollView>
    </Screen>
  );
};
