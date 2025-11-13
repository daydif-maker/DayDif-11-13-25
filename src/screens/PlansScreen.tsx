import React, { useEffect } from 'react';
import { ScrollView } from 'react-native';
import { Screen, Stack, Text, Card, Row, ScreenHeader, Button } from '@ui';
import { usePlansStore, useUserStateStore } from '@store';
import { plansService } from '@services/api/plansService';
import { TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { PlansStackParamList } from '@navigation/types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Box } from '@ui/primitives';

type PlansScreenNavigationProp = NativeStackNavigationProp<PlansStackParamList, 'Plans'>;

export const PlansScreen: React.FC = () => {
  const navigation = useNavigation<PlansScreenNavigationProp>();
  const { learningHistory, kpis, updateKPIs, addHistoryEntry } = usePlansStore();
  const { reset } = useUserStateStore();

  const handleReset = async () => {
    try {
      await reset();
    } catch (error) {
      console.error('Failed to reset user state:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const kpisData = await plansService.getKPIs();
        updateKPIs(kpisData);

        // Load last 30 days of history
        const endDate = new Date().toISOString().split('T')[0];
        const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0];
        const history = await plansService.getLearningHistory(startDate, endDate);
        history.forEach(entry => addHistoryEntry(entry));
      } catch (error) {
        console.error('Failed to load plans screen data:', error);
      }
    };

    loadData();
  }, []);

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

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Stack gap="xl" padding="lg" paddingTop="xl">
          {/* Blinkist-style header */}
          <ScreenHeader
            title="Plans"
            subtitle="Track your learning progress and achievements"
          />

          {/* KPI Tiles - Enhanced Blinkist-style */}
          <Box>
            <Text variant="heading3" marginBottom="sm">
              Your Progress
            </Text>
            <Row gap="md">
              <Card variant="elevated" flex={1} padding="md">
                <Text variant="heading2" marginBottom="xs">
                  {kpis.totalTimeLearned}
                </Text>
                <Text variant="caption" color="textSecondary">
                  Minutes Learned
                </Text>
              </Card>
              <Card variant="elevated" flex={1} padding="md">
                <Text variant="heading2" marginBottom="xs">
                  {kpis.totalLessonsCompleted}
                </Text>
                <Text variant="caption" color="textSecondary">
                  Lessons Completed
                </Text>
              </Card>
              <Card variant="elevated" flex={1} padding="md">
                <Text variant="heading2" marginBottom="xs">
                  {kpis.currentStreak}
                </Text>
                <Text variant="caption" color="textSecondary">
                  Day Streak
                </Text>
              </Card>
            </Row>
          </Box>

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
                    navigation.navigate('DayDetail', { date });
                  }}
                  activeOpacity={0.7}
                >
                  <Box
                    width={44}
                    height={44}
                    borderRadius="md"
                    backgroundColor={entry ? 'primary' : 'backgroundSecondary'}
                    alignItems="center"
                    justifyContent="center"
                    borderWidth={entry ? 0 : 1}
                    borderColor="border"
                  >
                    <Text
                      variant="caption"
                      color={entry ? 'textInverse' : 'textTertiary'}
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

