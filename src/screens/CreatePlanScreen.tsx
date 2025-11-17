import React from 'react';
import { ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Screen, Stack, Text, Card, Button, Chip, Row } from '@ui';
import { Box } from '@ui/primitives';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { TodayStackParamList } from '@navigation/types';
import { TextInput } from 'react-native';
import { useTheme } from '@designSystem/ThemeProvider';
import { useCreatePlan, DaysPerWeekOption, LessonDurationOption } from '@hooks/useCreatePlan';

type CreatePlanScreenNavigationProp = NativeStackNavigationProp<TodayStackParamList, 'CreatePlan'>;

const daysPerWeekOptions: { value: DaysPerWeekOption; label: string }[] = [
  { value: 2, label: '2 days (4 lessons)' },
  { value: 3, label: '3 days (6 lessons)' },
  { value: 4, label: '4 days (8 lessons)' },
  { value: 5, label: '5 days (10 lessons)' },
];

const lessonDurationOptions: { value: LessonDurationOption; label: string }[] = [
  { value: '8-10', label: '8–10 minutes' },
  { value: '10-15', label: '10–15 minutes' },
  { value: '15-20', label: '15–20 minutes' },
];

export const CreatePlanScreen: React.FC = () => {
  const navigation = useNavigation<CreatePlanScreenNavigationProp>();
  const { theme } = useTheme();
  const {
    formData,
    setFormData,
    isSubmitting,
    error,
    lessonCount,
    isFormValid,
    createPlan,
  } = useCreatePlan();

  const getDurationLabel = (value: LessonDurationOption | null): string => {
    if (!value) return '';
    return lessonDurationOptions.find(opt => opt.value === value)?.label || '';
  };

  const handleCreatePlan = async () => {
    console.log('handleCreatePlan called', { isFormValid, isSubmitting, formData });
    try {
      await createPlan();
      console.log('handleCreatePlan: Plan creation completed');
      // Navigation will be handled by RootNavigator based on state
      // When hasPlan becomes true, RootNavigator will show MainTabs
    } catch (err) {
      // Error is handled by the hook
      console.error('handleCreatePlan: Failed to create plan:', err);
    }
  };

  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Stack gap="xl" padding="lg" paddingTop="xl">
            {/* Header */}
            <Stack gap="xs">
              <Text variant="heading1">
                Set Up Your Learning Plan
              </Text>
              <Text variant="body" color="textSecondary">
                Tell us what to generate and how often you want lessons.
              </Text>
            </Stack>

            {/* Error message */}
            {error && (
              <Card variant="outlined" padding="md" backgroundColor="errorBackground">
                <Text variant="bodySmall" color="error">
                  {error}
                </Text>
              </Card>
            )}

            {/* Field 1: Topic Input */}
            <Card variant="elevated" padding="lg">
              <Stack gap="sm">
                <Text variant="heading4" marginBottom="xs">
                  What do you want to learn about?
                </Text>
                <Text variant="bodySmall" color="textSecondary" marginBottom="md">
                  This will be the exact prompt fed into the LLM to generate the weekly outline.
                </Text>
                <Box
                  borderWidth={1}
                  borderColor="border"
                  borderRadius="md"
                  paddingHorizontal="md"
                  paddingVertical="md"
                  backgroundColor="surface"
                  minHeight={120}
                >
                  <TextInput
                    value={formData.topicPrompt}
                    onChangeText={(text) =>
                      setFormData((prev) => ({ ...prev, topicPrompt: text }))
                    }
                    placeholder="Explain what topic you want lessons on (e.g., behavioral economics, artificial intelligence, valuation, etc.)"
                    placeholderTextColor={theme.colors.textTertiary}
                    multiline
                    textAlignVertical="top"
                    style={{
                      fontSize: theme.typography.fontSize16,
                      color: theme.colors.textPrimary,
                      padding: 0,
                    }}
                  />
                </Box>
              </Stack>
            </Card>

            {/* Field 2: Days Per Week */}
            <Card variant="elevated" padding="lg">
              <Stack gap="sm">
                <Text variant="heading4" marginBottom="xs">
                  How many days per week do you want lessons?
                </Text>
                <Text variant="bodySmall" color="textSecondary" marginBottom="md">
                  Each "day" = 2 lessons in your system (AM + PM or similar).
                </Text>
                <Row gap="sm" flexWrap="wrap">
                  {daysPerWeekOptions.map((option) => (
                    <Chip
                      key={option.value}
                      selected={formData.daysPerWeek === option.value}
                      onPress={() =>
                        setFormData((prev) => ({
                          ...prev,
                          daysPerWeek: option.value,
                        }))
                      }
                    >
                      {option.label}
                    </Chip>
                  ))}
                </Row>
              </Stack>
            </Card>

            {/* Field 3: Lesson Duration */}
            <Card variant="elevated" padding="lg">
              <Stack gap="sm">
                <Text variant="heading4" marginBottom="xs">
                  How long should each lesson be?
                </Text>
                <Text variant="bodySmall" color="textSecondary" marginBottom="md">
                  This controls output token length and the TTS target audio duration.
                </Text>
                <Row gap="sm" flexWrap="wrap">
                  {lessonDurationOptions.map((option) => (
                    <Chip
                      key={option.value}
                      selected={formData.lessonDuration === option.value}
                      onPress={() =>
                        setFormData((prev) => ({
                          ...prev,
                          lessonDuration: option.value,
                        }))
                      }
                    >
                      {option.label}
                    </Chip>
                  ))}
                </Row>
              </Stack>
            </Card>

            {/* Preview Summary */}
            {isFormValid && (
              <Card variant="outlined" padding="lg" backgroundColor="backgroundSecondary">
                <Text variant="heading4" marginBottom="md">
                  Your plan will include:
                </Text>
                <Stack gap="xs">
                  <Text variant="body" color="textSecondary">
                    • {lessonCount} lessons per week
                  </Text>
                  <Text variant="body" color="textSecondary">
                    • About {getDurationLabel(formData.lessonDuration)} each
                  </Text>
                  <Text variant="body" color="textSecondary">
                    • Topic: {formData.topicPrompt.trim()}
                  </Text>
                </Stack>
              </Card>
            )}
          </Stack>
        </ScrollView>

        {/* Fixed Bottom CTA */}
        <Box
          padding="lg"
          paddingTop="md"
          borderTopWidth={1}
          borderTopColor="border"
          backgroundColor="background"
        >
          <Button
            variant="primary"
            onPress={handleCreatePlan}
            disabled={!isFormValid || isSubmitting}
            loading={isSubmitting}
          >
            Create Plan
          </Button>
        </Box>
      </KeyboardAvoidingView>
    </Screen>
  );
};
