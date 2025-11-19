import React, { useEffect } from 'react';
import { ScrollView } from 'react-native';
import { Screen, Stack, Text, Card, Button } from '@ui';
import { usePlansStore, useUserStateStore, useAuthStore } from '@store';
import { useNavigation } from '@react-navigation/native';
import { PlansStackParamList } from '@navigation/types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Box } from '@ui/primitives';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@designSystem/ThemeProvider';
import { useOnboarding } from '@context/OnboardingContext';

import { ContributionHeatmap } from '../components/plans/ContributionHeatmap';
import { CommuteEfficiencyRing } from '../components/plans/CommuteEfficiencyRing';

type PlansScreenNavigationProp = NativeStackNavigationProp<PlansStackParamList, 'Plans'>;

export const PlansScreen: React.FC = () => {
  const navigation = useNavigation<PlansScreenNavigationProp>();
  const { user } = useAuthStore();
  const { theme } = useTheme();
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
  const { resetOnboarding } = useOnboarding();

  const handleReset = async () => {
    try {
      await reset();
      await resetOnboarding();
    } catch (error) {
      console.error('Failed to reset user state:', error);
    }
  };

  useEffect(() => {
    if (!user?.id) return;

    const loadData = async () => {
      try {
        await Promise.all([
          loadKPIs(user.id),
          loadWeeklyProgress(user.id),
        ]);

        // Load last 4 months of history for the heatmap
        const endDate = new Date().toISOString().split('T')[0];
        const startDate = new Date(Date.now() - 120 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0];
        await loadLearningHistory(user.id, startDate, endDate);
      } catch (error) {
        console.error('Failed to load plans screen data:', error);
      }
    };

    loadData();
  }, [user?.id, loadKPIs, loadLearningHistory, loadWeeklyProgress]);

  // Calculate metrics
  const weeklyProgress = getWeeklyProgress();
  // Using weekly goal target minutes as a proxy for "Total Commute Time Available" for the week
  // Ideally this would be: commuteDuration * commuteDays * 2 (if round trip)
  const totalCommuteMinutes = weeklyGoal?.targetMinutes || 60; 
  const convertedMinutes = weeklyProgress.currentMinutes || 0;

  return (
    <Screen backgroundColor="background">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <Stack gap="xl" padding="lg" paddingTop="xl">
          
          {/* Header */}
          <Box flexDirection="row" justifyContent="space-between" alignItems="center">
            <Text variant="heading2">Trophy Room</Text>
          </Box>

          {/* Streak Card - Hero Metric */}
          <Card variant="elevated" padding="lg" backgroundColor="surface">
             <Box flexDirection="row" justifyContent="space-between" alignItems="center">
                <Box>
                   <Text variant="metric" style={{ fontSize: 48, lineHeight: 56 }}>
                      {kpis.currentStreak}
                   </Text>
                   <Text variant="body" color="textSecondary" fontWeight="500">
                      Day Streak
                   </Text>
                </Box>
                <Box>
                   <Ionicons name="flame" size={64} color={theme.colors.warning} />
                </Box>
             </Box>
          </Card>

          {/* Commute Efficiency Ring */}
          <CommuteEfficiencyRing 
            convertedMinutes={convertedMinutes}
            totalCommuteMinutes={totalCommuteMinutes}
          />

          {/* Contribution Heatmap */}
          <ContributionHeatmap 
            history={learningHistory}
            onDayPress={(date) => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                navigation.navigate('DayDetail', { date });
            }}
          />

          {/* Secondary Metrics */}
          <Box flexDirection="row" gap="md">
             <Card variant="elevated" flex={1} padding="lg" backgroundColor="surface">
                <Text variant="heading3" fontWeight="700">{kpis.totalLessonsCompleted}</Text>
                <Text variant="caption" color="textTertiary" marginTop="xs">Total Lessons</Text>
             </Card>
             <Card variant="elevated" flex={1} padding="lg" backgroundColor="surface">
                <Text variant="heading3" fontWeight="700">{kpis.longestStreak}</Text>
                <Text variant="caption" color="textTertiary" marginTop="xs">Longest Streak</Text>
             </Card>
          </Box>

          {/* Reset Actions - kept for dev/debugging or user reset */}
          <Box marginTop="xl" marginBottom="lg">
             <Button
                variant="secondary"
                onPress={handleReset}
                style={{ backgroundColor: theme.colors.backgroundSecondary, borderWidth: 0 }}
             >
                <Text variant="bodySmall" color="error">Reset Progress</Text>
             </Button>
          </Box>

        </Stack>
      </ScrollView>
    </Screen>
  );
};
