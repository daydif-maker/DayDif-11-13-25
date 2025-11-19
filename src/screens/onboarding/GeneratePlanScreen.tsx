import React, { useEffect, useState } from 'react';
import { Screen, Stack, Text, Button, LoadingState } from '@ui';
import { Box } from '@ui/primitives';
import { useNavigation } from '@react-navigation/native';
import { useUserStateStore } from '@store';
import { useAuthStore } from '@store';
import { planService } from '@services/api/planService';
import * as Haptics from 'expo-haptics';

type GeneratePlanScreenProps = {
  // Navigation will handle this
};

const USE_MOCK_DATA = process.env.EXPO_PUBLIC_USE_MOCK_DATA !== 'false';

const getLessonDuration = (lessonLength: number): '8-10' | '10-15' | '15-20' => {
  if (lessonLength <= 10) return '8-10';
  if (lessonLength <= 15) return '10-15';
  return '15-20';
};

const getGoalLabel = (goalId?: string): string => {
  const goalMap: Record<string, string> = {
    career: 'Career & Finance',
    health: 'Health & Fitness',
    technology: 'Technology',
    science: 'Science',
    growth: 'Personal Growth',
    custom: 'Custom Learning',
  };
  return goalMap[goalId || ''] || 'Personal Growth';
};

export const GeneratePlanScreen: React.FC<GeneratePlanScreenProps> = () => {
  const navigation = useNavigation();
  const { user } = useAuthStore();
  const {
    setHasSeenOnboarding,
    setActivePlanId,
    onboardingData,
    clearOnboardingData,
  } = useUserStateStore();
  const [isGenerating, setIsGenerating] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const userId = user?.id ?? (USE_MOCK_DATA ? 'mock-user' : undefined);

  useEffect(() => {
    const generatePlan = async () => {
      if (!userId) {
        setError('User not authenticated');
        setIsGenerating(false);
        return;
      }

      try {
        const daysPerWeek = onboardingData.daysPerWeek || 5;
        const lessonLength = onboardingData.lessonLength || 10;
        const lessonDuration = getLessonDuration(lessonLength);
        const lessonCount = daysPerWeek * 2; // 2 lessons per day

        const plan = await planService.createPlanFromPreferences(userId, {
          topicPrompt: getGoalLabel(onboardingData.goal),
          daysPerWeek,
          lessonDuration,
          lessonCount,
        });

        // Mark onboarding as complete and set active plan
        setHasSeenOnboarding(true);
        setActivePlanId(plan.id);
        clearOnboardingData();
        setIsGenerating(false);
        setIsSuccess(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to generate plan';
        setError(errorMessage);
        setIsGenerating(false);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    };

    generatePlan();
  }, [
    userId,
    setHasSeenOnboarding,
    setActivePlanId,
    onboardingData,
    clearOnboardingData,
  ]);

  const handleStartToday = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Navigation will be handled by RootNavigator based on state
    // The RootNavigator will automatically show MainTabs when hasPlan is true
  };

  if (isGenerating) {
    return (
      <Screen>
        <LoadingState message="Building your personalized weekly plan…" />
      </Screen>
    );
  }

  if (error) {
    return (
      <Screen>
        <Stack gap="lg" padding="lg" justifyContent="center" flex={1}>
          <Text variant="heading2" textAlign="center">
            Something went wrong
          </Text>
          <Text variant="body" color="textSecondary" textAlign="center">
            {error}
          </Text>
          <Button
            variant="primary"
            onPress={() => {
              if (navigation.canGoBack()) {
                navigation.goBack();
              }
            }}
          >
            Go Back
          </Button>
        </Stack>
      </Screen>
    );
  }

  if (isSuccess) {
    return (
      <Screen>
        <Stack gap="xl" padding="lg" justifyContent="center" flex={1}>
          <Text variant="heading1" textAlign="center">
            Your plan is ready
          </Text>
          <Text variant="body" color="textSecondary" textAlign="center">
            We've created a personalized learning plan just for you.
          </Text>
          <Button variant="primary" onPress={handleStartToday}>
            Start Today's Lesson
          </Button>
        </Stack>
      </Screen>
    );
  }

  return null;
};

