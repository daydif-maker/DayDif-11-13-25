import React, { useState, useMemo } from 'react';
import { ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Screen, Stack, Text, Card, Button, Chip, Row } from '@ui';
import { Box } from '@ui/primitives';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { TodayStackParamList } from '@navigation/types';
import { useUserStateStore, useLessonsStore } from '@store';
import { plansService } from '@services/api/plansService';
import { generateMockLessonsForPlan } from '@services/api/mocks/mockLessons';
import { TextInput } from 'react-native';
import { useTheme } from '@designSystem/ThemeProvider';

type CreatePlanScreenNavigationProp = NativeStackNavigationProp<TodayStackParamList, 'CreatePlan'>;

type DaysPerWeekOption = 2 | 3 | 4 | 5;
type LessonDurationOption = '8-10' | '10-15' | '15-20';

interface PlanFormData {
  topicPrompt: string;
  daysPerWeek: DaysPerWeekOption | null;
  lessonDuration: LessonDurationOption | null;
}

export const CreatePlanScreen: React.FC = () => {
  const navigation = useNavigation<CreatePlanScreenNavigationProp>();
  const { theme } = useTheme();
  const { setActivePlanId, setIsGenerating, setTodayLesson, setLessons } = useUserStateStore();
  const { setDailyLesson, addToQueue, clearQueue } = useLessonsStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<PlanFormData>({
    topicPrompt: '',
    daysPerWeek: null,
    lessonDuration: null,
  });

  const lessonCount = useMemo(() => {
    if (!formData.daysPerWeek) return 0;
    return formData.daysPerWeek * 2;
  }, [formData.daysPerWeek]);

  const isFormValid = useMemo(() => {
    return (
      formData.topicPrompt.trim().length > 0 &&
      formData.daysPerWeek !== null &&
      formData.lessonDuration !== null
    );
  }, [formData]);

  const handleCreatePlan = async () => {
    if (!isFormValid || isSubmitting) return;

    try {
      setIsSubmitting(true);
      
      const plan = await plansService.createPlan({
        topicPrompt: formData.topicPrompt.trim(),
        daysPerWeek: formData.daysPerWeek!,
        lessonDuration: formData.lessonDuration!,
        lessonCount,
      });

      setActivePlanId(plan.id);
      
      // Generate mock lessons based on plan customizations
      const mockLessons = generateMockLessonsForPlan(
        formData.topicPrompt.trim(),
        lessonCount,
        formData.lessonDuration!
      );

      // Set the first lesson as daily lesson
      const dailyLesson = mockLessons[0];
      const queueLessons = mockLessons.slice(1);

      // Update lessons store - clear existing queue first
      clearQueue();
      setDailyLesson(dailyLesson);
      queueLessons.forEach(lesson => addToQueue(lesson));

      // Update user state store
      setTodayLesson(dailyLesson);
      setLessons(mockLessons);
      
      // Set generating to false so TodayScreen shows the content
      setIsGenerating(false);
      
      // Navigate back to Today screen, which will now show the lessons
      navigation.navigate('Today');
    } catch (error) {
      console.error('Failed to create plan:', error);
      // TODO: Show error message to user
    } finally {
      setIsSubmitting(false);
    }
  };

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

  const getDurationLabel = (value: LessonDurationOption | null): string => {
    if (!value) return '';
    return lessonDurationOptions.find(opt => opt.value === value)?.label || '';
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

