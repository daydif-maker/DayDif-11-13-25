import React from 'react';
import { Screen, Stack, Text, Card, LoadingState } from '@ui';
import { Box } from '@ui/primitives';
import { ActivityIndicator } from 'react-native';
import { useTheme } from '@designSystem/ThemeProvider';

export const GenerationScreen: React.FC = () => {
  const { theme } = useTheme();

  return (
    <Screen>
      <Stack gap="xl" padding="lg" paddingTop="xl">
        <LoadingState message="Generating your daily lesson..." />

        {/* Skeleton cards for preview */}
        <Stack gap="md">
          <Text variant="heading3" marginBottom="sm">
            Preparing Your Content
          </Text>
          
          <Card variant="elevated" padding="lg">
            <Stack gap="md">
              <Box height={24} width="60%" backgroundColor="backgroundSecondary" borderRadius="sm" />
              <Box height={16} width="100%" backgroundColor="backgroundSecondary" borderRadius="sm" />
              <Box height={16} width="80%" backgroundColor="backgroundSecondary" borderRadius="sm" />
              <Box marginTop="md">
                <ActivityIndicator size="small" color={theme.colors.primary} />
              </Box>
            </Stack>
          </Card>

          <Card variant="outlined" padding="md">
            <Stack gap="sm">
              <Box height={20} width="70%" backgroundColor="backgroundSecondary" borderRadius="sm" />
              <Box height={14} width="50%" backgroundColor="backgroundSecondary" borderRadius="sm" />
            </Stack>
          </Card>
        </Stack>
      </Stack>
    </Screen>
  );
};

