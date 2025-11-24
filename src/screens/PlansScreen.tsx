import React, { useMemo, useState } from 'react';
import { ScrollView, TouchableOpacity } from 'react-native';
import { Screen, Stack, Text, Card, GoalRing } from '@ui';
import { Box } from '@ui/primitives';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@designSystem/ThemeProvider';
import { LinearGradient } from 'expo-linear-gradient';

type FiveDayPreview = {
  label: string;
  date: number;
  isToday: boolean;
};

type KpiItem = {
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  gradient: [string, string];
};

const kpiItems: KpiItem[] = [
  { label: 'Streak', value: '12 days', icon: 'flame', gradient: ['#FF9A62', '#FF5C5C'] },
  { label: 'Time Learned', value: '4.2h', icon: 'time-outline', gradient: ['#7C8AFF', '#5869F2'] },
  { label: 'Lessons', value: '18', icon: 'book-outline', gradient: ['#2BC48A', '#199974'] },
  { label: 'Completion', value: '85%', icon: 'checkmark-done-outline', gradient: ['#FF7AC3', '#9B6CFF'] },
];

type CalendarGridDay = {
  key: string;
  label: number;
  date: Date;
  inCurrentMonth: boolean;
};

const isSameDay = (first: Date, second: Date) =>
  first.getFullYear() === second.getFullYear() &&
  first.getMonth() === second.getMonth() &&
  first.getDate() === second.getDate();

const getFiveDayPreview = (anchor: Date): FiveDayPreview[] => {
  const start = new Date(anchor);
  const offset = (anchor.getDay() + 6) % 7; // Monday-first
  start.setDate(anchor.getDate() - offset);

  return Array.from({ length: 5 }, (_, index) => {
    const current = new Date(start);
    current.setDate(start.getDate() + index);
    const label = current
      .toLocaleDateString('en-US', { weekday: 'short' })
      .slice(0, 2);

    return {
      label,
      date: current.getDate(),
      isToday: isSameDay(current, anchor),
    };
  });
};

const buildCalendarGrid = (cursor: Date): CalendarGridDay[] => {
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const startOfMonth = new Date(year, month, 1);
  const endOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = endOfMonth.getDate();
  const startOffset = (startOfMonth.getDay() + 6) % 7; // Monday-first
  const previousMonthDays = new Date(year, month, 0).getDate();

  const days: CalendarGridDay[] = [];

  for (let index = 0; index < startOffset; index++) {
    const day = previousMonthDays - startOffset + index + 1;
    const date = new Date(year, month - 1, day);
    days.push({ key: `prev-${day}`, label: day, date, inCurrentMonth: false });
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    days.push({ key: `current-${day}`, label: day, date, inCurrentMonth: true });
  }

  let nextDay = 1;
  while (days.length % 7 !== 0) {
    const date = new Date(year, month + 1, nextDay);
    days.push({ key: `next-${nextDay}`, label: nextDay, date, inCurrentMonth: false });
    nextDay += 1;
  }

  return days;
};

export const PlansScreen: React.FC = () => {
  const { theme } = useTheme();
  const today = useMemo(() => new Date(), []);
  const [monthCursor, setMonthCursor] = useState<Date>(today);
  const [selectedDate, setSelectedDate] = useState<Date>(today);

  const kpiRows = useMemo(
    () => [kpiItems.slice(0, 2), kpiItems.slice(2)],
    []
  );

  const fiveDayPreview = useMemo(
    () => getFiveDayPreview(today),
    [today]
  );

  const calendarDays = useMemo(
    () => buildCalendarGrid(monthCursor),
    [monthCursor]
  );

  const weekDayLabels = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
  const monthLabel = monthCursor.toLocaleDateString('en-US', { month: 'long' });

  const handleMonthChange = (direction: number) => {
    setMonthCursor(prev => new Date(prev.getFullYear(), prev.getMonth() + direction, 1));
  };

  const handleSelectDate = (date: Date, inCurrentMonth: boolean) => {
    setSelectedDate(date);
    if (!inCurrentMonth) {
      setMonthCursor(new Date(date.getFullYear(), date.getMonth(), 1));
    }
  };

  return (
    <Screen backgroundColor="background" edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: theme.spacing.lg,
          paddingBottom: 100,
        }}
      >
        <Stack gap="xl" paddingTop="md">
          <Box flexDirection="row" justifyContent="space-between" alignItems="center">
            <Text variant="heading1">Your Progress</Text>
            <Box
              padding="xs"
              borderRadius="full"
              backgroundColor="backgroundSecondary"
              style={theme.shadows.sm}
            >
              <GoalRing
                progress={60}
                size={52}
                strokeWidth={4}
                centerLabel="3/5"
                showPercentage={false}
              />
            </Box>
          </Box>

          <Card
            variant="elevated"
            backgroundColor="backgroundSecondary"
            borderRadius="xl"
            padding="md"
            style={theme.shadows.md}
          >
            <Box flexDirection="row" alignItems="center" justifyContent="center" gap="sm">
              {fiveDayPreview.map((day) => {
                const isActive = day.isToday;
                return (
                  <Box
                    key={`${day.label}-${day.date}`}
                    flex={1}
                    alignItems="center"
                    style={{ maxWidth: 60 }}
                  >
                    <Box
                      borderRadius="lg"
                      paddingVertical="sm"
                      alignItems="center"
                      backgroundColor={isActive ? 'primary' : 'background'}
                      style={{
                        width: 52,
                        borderWidth: isActive ? 0 : 1,
                        borderColor: theme.colors.border,
                      }}
                    >
                      <Text
                        variant="caption"
                        color={isActive ? 'textInverse' : 'textSecondary'}
                        fontWeight="700"
                      >
                        {day.label}
                      </Text>
                      <Text
                        variant="heading4"
                        color={isActive ? 'textInverse' : 'textPrimary'}
                        fontWeight="700"
                      >
                        {day.date}
                      </Text>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Card>

          <Stack gap="md">
            {kpiRows.map((row, rowIndex) => (
              <Box key={`kpi-row-${rowIndex}`} flexDirection="row" gap="md">
                {row.map((item) => (
                  <Card
                    key={item.label}
                    variant="elevated"
                    backgroundColor="backgroundSecondary"
                    borderRadius="lg"
                    padding="md"
                    flex={1}
                    style={[theme.shadows.md, { minHeight: 120 }]}
                  >
                    <Box flex={1} justifyContent="center">
                      <Box flexDirection="row" alignItems="center" gap="sm">
                        <LinearGradient
                          colors={item.gradient}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius: 12,
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Ionicons name={item.icon} size={20} color="#FFFFFF" />
                        </LinearGradient>
                        <Box flex={1}>
                          <Text variant="bodySmall" color="textSecondary">
                            {item.label}
                          </Text>
                          <Text variant="heading3" fontWeight="700">
                            {item.value}
                          </Text>
                        </Box>
                      </Box>
                    </Box>
                  </Card>
                ))}
              </Box>
            ))}
          </Stack>

          <Card
            variant="elevated"
            backgroundColor="backgroundSecondary"
            borderRadius="xl"
            padding="xl"
            style={theme.shadows.md}
          >
            <Stack gap="lg">
              <Box flexDirection="row" alignItems="center" justifyContent="space-between">
                <Text variant="heading3" fontWeight="700">
                  {monthLabel}
                </Text>
                <Box flexDirection="row" alignItems="center" gap="xs">
                  <TouchableOpacity onPress={() => handleMonthChange(-1)}>
                    <Box
                      padding="sm"
                      borderRadius="full"
                      backgroundColor="background"
                      alignItems="center"
                      justifyContent="center"
                      style={{ borderWidth: 1, borderColor: theme.colors.border }}
                    >
                      <Ionicons name="chevron-back" size={18} color={theme.colors.textPrimary} />
                    </Box>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleMonthChange(1)}>
                    <Box
                      padding="sm"
                      borderRadius="full"
                      backgroundColor="background"
                      alignItems="center"
                      justifyContent="center"
                      style={{ borderWidth: 1, borderColor: theme.colors.border }}
                    >
                      <Ionicons name="chevron-forward" size={18} color={theme.colors.textPrimary} />
                    </Box>
                  </TouchableOpacity>
                </Box>
              </Box>

              <Box flexDirection="row">
                {weekDayLabels.map((label) => (
                  <Box key={label} style={{ width: `${100 / 7}%` }} alignItems="center">
                    <Text variant="bodySmall" color="textSecondary" fontWeight="700">
                      {label}
                    </Text>
                  </Box>
                ))}
              </Box>

              <Box flexDirection="row" flexWrap="wrap">
                {calendarDays.map((day) => {
                  const isSelected = isSameDay(day.date, selectedDate);
                  const isToday = isSameDay(day.date, today);
                  const textColor = isSelected
                    ? 'textInverse'
                    : day.inCurrentMonth
                      ? 'textPrimary'
                      : 'textSecondary';

                  return (
                    <TouchableOpacity
                      key={day.key}
                      onPress={() => handleSelectDate(day.date, day.inCurrentMonth)}
                      style={{
                        width: `${100 / 7}%`,
                        alignItems: 'center',
                        marginVertical: 6,
                      }}
                      activeOpacity={0.8}
                    >
                      <Box
                        borderRadius="full"
                        alignItems="center"
                        justifyContent="center"
                        style={{
                          width: 44,
                          height: 44,
                          backgroundColor: isSelected ? theme.colors.primary : 'transparent',
                          borderWidth: isToday && !isSelected ? 1 : 0,
                          borderColor: isToday && !isSelected ? theme.colors.primary : 'transparent',
                        }}
                      >
                        <Text
                          variant="body"
                          color={textColor}
                          fontWeight={isSelected ? '700' : '600'}
                          style={{ opacity: day.inCurrentMonth ? 1 : 0.45 }}
                        >
                          {day.label}
                        </Text>
                      </Box>
                    </TouchableOpacity>
                  );
                })}
              </Box>
            </Stack>
          </Card>
        </Stack>
      </ScrollView>
    </Screen>
  );
};
