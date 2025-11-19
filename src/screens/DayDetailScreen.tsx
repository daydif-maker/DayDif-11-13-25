import React from 'react';
import { ScrollView, TouchableOpacity } from 'react-native';
import { Screen, Stack, Text, Card, EmptyState } from '@ui';
import { usePlansStore } from '@store';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Box } from '@ui/primitives';
import { Ionicons } from '@expo/vector-icons';
import { useIconColor } from '@ui/hooks/useIconColor';

export const DayDetailScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { date } = route.params as { date: string };
  const { getHistoryByDate } = usePlansStore();
  const iconColorPrimary = useIconColor('primary');
  const iconColorPrimaryText = useIconColor('primary');
  const iconColorTertiary = useIconColor('tertiary');

  const historyEntry = getHistoryByDate(date);
  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  if (!historyEntry) {
    return (
      <Screen>
        {/* Header */}
        <Box
          flexDirection="row"
          alignItems="center"
          paddingHorizontal="lg"
          paddingTop="md"
          paddingBottom="sm"
          borderBottomWidth={1}
          borderBottomColor="border"
        >
          <TouchableOpacity
            onPress={() => {
              if (navigation.canGoBack()) {
                navigation.goBack();
              }
            }}
          >
            <Box marginRight="md">
              <Ionicons name="arrow-back" size={24} color={iconColorPrimary} />
            </Box>
          </TouchableOpacity>
          <Text variant="heading3" flex={1}>
            {formattedDate}
          </Text>
        </Box>

        <EmptyState
          heading="No learning activity"
          description="No lessons completed on this day."
          icon="calendar-outline"
        />
      </Screen>
    );
  }

  return (
    <Screen>
      {/* Blinkist-style header */}
      <Box
        flexDirection="row"
        alignItems="center"
        paddingHorizontal="lg"
        paddingTop="md"
        paddingBottom="sm"
        borderBottomWidth={1}
        borderBottomColor="border"
      >
        <TouchableOpacity
          onPress={() => {
            if (navigation.canGoBack()) {
              navigation.goBack();
            }
          }}
        >
          <Box marginRight="md">
            <Ionicons name="arrow-back" size={24} color={iconColorPrimary} />
          </Box>
        </TouchableOpacity>
        <Text variant="heading3" flex={1}>
          {formattedDate}
        </Text>
      </Box>

      <ScrollView showsVerticalScrollIndicator={false}>
        <Stack gap="lg" padding="lg">
          {/* Summary card */}
          <Card variant="elevated" padding="lg">
            <Text variant="heading3" marginBottom="sm">
              Summary
            </Text>
            <Box flexDirection="row" alignItems="center" marginBottom="xs">
              <Ionicons name="checkmark-circle" size={20} color={iconColorPrimaryText} />
              <Text variant="body" marginLeft="sm">
                {historyEntry.lessonsCompleted} lesson
                {historyEntry.lessonsCompleted !== 1 ? 's' : ''} completed
              </Text>
            </Box>
            <Box flexDirection="row" alignItems="center">
              <Ionicons name="time" size={20} color={iconColorTertiary} />
              <Text variant="bodySmall" color="textSecondary" marginLeft="sm">
                {historyEntry.timeSpent} minutes learned
              </Text>
            </Box>
          </Card>

          {/* Lessons list */}
          {historyEntry.lessons.length > 0 && (
            <Box>
              <Text variant="heading3" marginBottom="sm">
                Lessons Completed
              </Text>
              <Stack gap="md">
                {historyEntry.lessons.map(lesson => (
                  <Card
                    key={lesson.id}
                    variant="outlined"
                    padding="md"
                    onPress={() => {
                      // Navigate to lesson detail if needed
                    }}
                  >
                    <Text variant="heading4" marginBottom="xs">
                      {lesson.title}
                    </Text>
                    <Box flexDirection="row" alignItems="center">
                      <Text variant="caption" color="textTertiary">
                        {lesson.category}
                      </Text>
                      <Text variant="caption" color="textTertiary" marginLeft="sm">
                        · {lesson.duration} min
                      </Text>
                    </Box>
                  </Card>
                ))}
              </Stack>
            </Box>
          )}
        </Stack>
      </ScrollView>
    </Screen>
  );
};

