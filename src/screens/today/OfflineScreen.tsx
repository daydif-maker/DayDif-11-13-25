import React from 'react';
import { ScrollView } from 'react-native';
import { Screen, Stack, Text, Card, EmptyState, Button } from '@ui';
import { useUserStateStore } from '@store';
import { Lesson } from '@store/types';
import { Box } from '@ui/primitives';
import { Ionicons } from '@expo/vector-icons';
import { useIconColor } from '@ui/hooks/useIconColor';

export const OfflineScreen: React.FC = () => {
  const { lessons, setIsOffline } = useUserStateStore();
  const iconColorTertiary = useIconColor('tertiary');

  const handleRetry = () => {
    // Check network status and update isOffline accordingly
    // NetInfo will handle this automatically, but we can trigger a check
    setIsOffline(false);
  };

  const hasCachedLessons = lessons && lessons.length > 0;

  if (!hasCachedLessons) {
    return (
      <Screen>
        <EmptyState
          heading="You're Offline"
          description="No internet connection detected. Please check your network settings and try again."
          icon="cloud-offline-outline"
          actionLabel="Retry"
          onAction={handleRetry}
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Stack gap="lg" padding="lg" paddingTop="xl">
          <Box flexDirection="row" alignItems="center" gap="sm" marginBottom="sm">
            <Ionicons name="cloud-offline-outline" size={24} color={iconColorTertiary} />
            <Text variant="heading3">Offline Mode</Text>
          </Box>
          <Text variant="bodySmall" color="textSecondary" marginBottom="lg">
            You're currently offline. Here are your cached lessons:
          </Text>

          <Stack gap="md">
            {lessons.map((lesson) => (
              <Card
                key={lesson.id}
                variant="outlined"
                padding="md"
              >
                <Text variant="heading4" marginBottom="xs">
                  {lesson.title}
                </Text>
                <Text variant="caption" color="textTertiary">
                  {lesson.duration} min · {lesson.category}
                </Text>
              </Card>
            ))}
          </Stack>

          <Box marginTop="lg">
            <Button variant="outline" onPress={handleRetry}>
              Retry Connection
            </Button>
          </Box>
        </Stack>
      </ScrollView>
    </Screen>
  );
};

