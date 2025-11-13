import React from 'react';
import { Screen, Stack, Text, Button, Card, ScreenHeader } from '@ui';
import { useUserStateStore } from '@store';
import { Box } from '@ui/primitives';

export const OnboardingScreen: React.FC = () => {
  const { setHasSeenOnboarding } = useUserStateStore();

  const handleGetStarted = () => {
    setHasSeenOnboarding(true);
    // TODO: Navigate to plan creation flow
  };

  return (
    <Screen>
      <Stack gap="xl" padding="lg" paddingTop="xl" flex={1} justifyContent="center">
        <ScreenHeader title="Welcome to DayDif" />
        
        <Card variant="elevated" padding="lg">
          <Stack gap="md">
            <Text variant="heading3" marginBottom="sm">
              Turn Your Commute Into Learning Time
            </Text>
            <Text variant="body" color="textSecondary">
              DayDif transforms your daily travel time into structured, meaningful learning experiences.
            </Text>
            <Text variant="body" color="textSecondary">
              Get personalized lessons delivered daily, track your progress, and build lasting knowledge habits.
            </Text>
          </Stack>
        </Card>

        <Card variant="outlined" padding="lg">
          <Stack gap="sm">
            <Text variant="heading4" marginBottom="xs">
              How It Works
            </Text>
            <Text variant="bodySmall" color="textSecondary">
              • Set your learning goals and preferences
            </Text>
            <Text variant="bodySmall" color="textSecondary">
              • Receive daily lessons tailored to your interests
            </Text>
            <Text variant="bodySmall" color="textSecondary">
              • Learn during your commute with audio-first content
            </Text>
            <Text variant="bodySmall" color="textSecondary">
              • Track your progress and build streaks
            </Text>
          </Stack>
        </Card>

        <Box marginTop="lg">
          <Button variant="primary" onPress={handleGetStarted}>
            Get Started
          </Button>
        </Box>
      </Stack>
    </Screen>
  );
};

