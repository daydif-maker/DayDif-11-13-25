import React from 'react';
import { Screen, Stack, Text, Button } from '@ui';
import { Box } from '@ui/primitives';
import { useUserStateStore } from '@store';

export const RegenerationScreen: React.FC = () => {
  const { setIsGenerating } = useUserStateStore();

  const handleRefresh = () => {
    setIsGenerating(true);
    // TODO: Trigger lesson generation
    // After generation completes, setIsGenerating(false) and setTodayLesson(lesson)
  };

  return (
    <Screen>
      <Stack gap="lg" padding="lg" paddingTop="xl" flex={1} justifyContent="center">
        <Text variant="heading1" textAlign="center" marginBottom="sm">
          Welcome Back
        </Text>
        <Text variant="body" color="textSecondary" textAlign="center" marginBottom="lg">
          We're refreshing your lessons for today. This will only take a moment.
        </Text>
        
        <Box marginTop="lg">
          <Button variant="primary" onPress={handleRefresh}>
            Refresh Lessons
          </Button>
        </Box>
      </Stack>
    </Screen>
  );
};

