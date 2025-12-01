import React, { useState, useEffect } from 'react';
import { ScrollView, KeyboardAvoidingView, Platform, StyleSheet, TouchableOpacity } from 'react-native';
import { Screen, Stack, Text, Card, Button } from '@ui';
import { Box } from '@ui/primitives';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { TodayStackParamList } from '@navigation/types';
import { TextInput } from 'react-native';
import { useTheme } from '@designSystem/ThemeProvider';
import { useCreatePlan } from '@hooks/useCreatePlan';
import { OptionPill } from '@components/onboarding/OptionPill';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '@store';
import {
  DaysPerWeekOption,
  LessonDurationOption,
  daysPerWeekToLessonCount,
  getLessonDurationLabel,
} from '@/types/lessonPlan';

type CreatePlanScreenNavigationProp = NativeStackNavigationProp<TodayStackParamList, 'CreatePlan'>;

// Options derived from shared types for consistency with backend
const daysPerWeekOptions: { value: DaysPerWeekOption; label: string }[] = ([1, 2, 3, 4, 5] as DaysPerWeekOption[]).map(days => {
  const lessonCount = daysPerWeekToLessonCount(days);
  const lessonText = lessonCount === 1 ? 'lesson' : 'lessons';
  return {
    value: days,
    label: `${days} day${days === 1 ? '' : 's'} (${lessonCount} ${lessonText})`,
  };
});

const lessonDurationOptions: { value: LessonDurationOption; label: string }[] = [
  { value: '5', label: getLessonDurationLabel('5') },
  { value: '8-10', label: getLessonDurationLabel('8-10') },
  { value: '10-15', label: getLessonDurationLabel('10-15') },
  { value: '15-20', label: getLessonDurationLabel('15-20') },
];

export const CreatePlanScreen: React.FC = () => {
  const navigation = useNavigation<CreatePlanScreenNavigationProp>();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const {
    formData,
    setFormData,
    isSubmitting,
    error,
    isFormValid,
    createPlan,
  } = useCreatePlan();

  // Check authentication on mount - redirect to Login if not authenticated
  useEffect(() => {
    if (!user?.id) {
      console.log('CreatePlanScreen: User not authenticated, redirecting to Login');
      navigation.replace('Login');
    }
  }, [user?.id, navigation]);

  // Tab bar height calculation:
  // Inner content: minHeight 60 + paddingVertical md (16px top + 16px bottom) = 92px
  // Outer padding: max(insets.bottom, 8px) = ~8-34px depending on device
  // Total: ~100-126px
  const tabBarHeight = 60 + 32 + Math.max(insets.bottom, 8);

  // CTA button height: minHeight 54 + paddingTop md (16px) + paddingBottom md (16px) = 86px
  const ctaHeight = 54 + 16 + 16;

  // Total space needed at bottom: CTA + tab bar + some extra spacing
  const bottomSpacing = ctaHeight + tabBarHeight + 16;

  const getDurationValue = (value: LessonDurationOption | null): string => {
    if (!value) return '';
    // Extract the max value from the range (e.g., '10-15' -> '15')
    const parts = value.split('-');
    return parts[parts.length - 1] || '';
  };

  const [durationInput, setDurationInput] = useState(
    formData.lessonDuration ? getDurationValue(formData.lessonDuration) : ''
  );

  const [lessonCountInput, setLessonCountInput] = useState(
    formData.customLessonCount ? formData.customLessonCount.toString() :
      formData.daysPerWeek ? daysPerWeekToLessonCount(formData.daysPerWeek).toString() : ''
  );

  // Sync durationInput when formData.lessonDuration changes externally
  useEffect(() => {
    if (formData.lessonDuration) {
      setDurationInput(getDurationValue(formData.lessonDuration));
    }
  }, [formData.lessonDuration]);

  const handleDurationInputChange = (text: string) => {
    setDurationInput(text);
    const numericValue = parseInt(text, 10);

    if (!isNaN(numericValue)) {
      // Set custom duration directly
      setFormData((prev) => ({
        ...prev,
        customDuration: numericValue,
        // We still try to map to a preset for UI highlighting if possible, but it's not strictly required
        lessonDuration:
          numericValue === 5 ? '5' :
            (numericValue >= 8 && numericValue <= 10) ? '8-10' :
              (numericValue >= 10 && numericValue <= 15) ? '10-15' :
                (numericValue >= 15 && numericValue <= 20) ? '15-20' : null
      }));
    } else {
      setFormData((prev) => ({ ...prev, customDuration: undefined }));
    }
  };

  const handleLessonCountInputChange = (text: string) => {
    setLessonCountInput(text);
    const numericValue = parseInt(text, 10);

    if (!isNaN(numericValue)) {
      setFormData((prev) => ({
        ...prev,
        customLessonCount: numericValue,
        // Clear daysPerWeek if custom count doesn't match a preset to avoid confusion?
        // Or keep it if it matches. For now, let's just set the custom value.
      }));
    } else {
      setFormData((prev) => ({ ...prev, customLessonCount: undefined }));
    }
  };

  const handleDurationSelect = (value: LessonDurationOption) => {
    setFormData((prev) => ({
      ...prev,
      lessonDuration: value,
      customDuration: undefined // Clear custom duration when selecting a preset
    }));
    setDurationInput(getDurationValue(value));
  };

  const handleCreatePlan = async () => {
    // Log current state for debugging
    console.log('handleCreatePlan called', {
      isFormValid,
      isSubmitting,
      formData,
      topicLength: formData.topicPrompt.trim().length,
      hasDaysPerWeek: formData.daysPerWeek !== null,
      hasLessonDuration: formData.lessonDuration !== null,
    });

    // Skip validation check here - let the hook handle it
    // This prevents double-checking with potentially stale closure values
    if (isSubmitting) {
      console.warn('handleCreatePlan: Already submitting, aborting');
      return;
    }

    try {
      console.log('handleCreatePlan: Calling createPlan...');
      await createPlan();
      console.log('handleCreatePlan: Plan creation completed');

      // Navigation will be handled automatically by RootNavigator's useEffect
      // when activePlanId state changes. No manual navigation needed.
      console.log('Plan created successfully. RootNavigator will handle navigation automatically.');
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
          contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomSpacing }]}
        >
          <Stack gap="xl" paddingHorizontal="lg" paddingTop="xl">
            {/* Header */}
            <Stack gap="sm">
              <Box flexDirection="row" alignItems="center" justifyContent="center" position="relative">
                <TouchableOpacity
                  onPress={() => {
                    if (navigation.canGoBack()) {
                      navigation.goBack();
                    }
                  }}
                  style={styles.backButton}
                >
                  <Box
                    width={32}
                    height={32}
                    borderRadius="full"
                    backgroundColor="backgroundSecondary"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Ionicons name="arrow-back" size={20} color={theme.colors.textPrimary} />
                  </Box>
                </TouchableOpacity>
                <Text
                  variant="heading3"
                  style={styles.headerTitle}
                  fontWeight="600"
                  fontSize={24}
                >
                  Learning plan
                </Text>
                <Box width={32} />
              </Box>
              <Text variant="bodySmall" color="textSecondary" textAlign="center">
                Set up your learning plan
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
            <Stack gap="sm">
              <Box flexDirection="row" alignItems="center" gap="sm">
                <Ionicons name="document-text" size={18} color={theme.colors.textPrimary} />
                <Text variant="heading4" fontWeight="600" fontSize={18}>
                  What do you want to learn about?
                </Text>
              </Box>
              <Text variant="bodySmall" color="textSecondary" marginBottom="xs">
                Tell us what you want to learn during your commute.
              </Text>
              <Box
                borderRadius="lg"
                padding="md"
                backgroundColor="backgroundSecondary"
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
                  style={[styles.textInput, { color: theme.colors.textPrimary }]}
                />
              </Box>
            </Stack>



            {/* Field 2: Days Per Week / Lesson Count */}
            <Stack gap="sm">
              <Box flexDirection="row" alignItems="center" gap="sm">
                <Ionicons name="calendar" size={18} color={theme.colors.textPrimary} />
                <Text variant="heading4" fontWeight="600" fontSize={18}>
                  How many lessons do you want?
                </Text>
              </Box>
              <Box
                borderRadius="lg"
                padding="md"
                backgroundColor="backgroundSecondary"
                marginBottom="sm"
              >
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.pillsContainer}
                >
                  {daysPerWeekOptions.map((option, index) => (
                    <OptionPill
                      key={option.value}
                      label={option.label}
                      selected={formData.daysPerWeek === option.value && !formData.customLessonCount}
                      onPress={() => {
                        setFormData((prev) => ({
                          ...prev,
                          daysPerWeek: option.value,
                          customLessonCount: undefined // Clear custom count when selecting preset
                        }));
                        setLessonCountInput(daysPerWeekToLessonCount(option.value).toString());
                      }}
                      index={index}
                    />
                  ))}
                </ScrollView>
              </Box>
              <Box
                borderWidth={1}
                borderColor="border"
                borderRadius="lg"
                paddingHorizontal="md"
                paddingVertical="md"
                backgroundColor="white"
              >
                <TextInput
                  value={lessonCountInput}
                  onChangeText={handleLessonCountInputChange}
                  placeholder="Total number of lessons"
                  placeholderTextColor={theme.colors.textTertiary}
                  keyboardType="numeric"
                  style={[styles.textInput, { color: theme.colors.textPrimary }]}
                />
              </Box>
            </Stack>

            {/* Field 3: Lesson Duration */}
            <Stack gap="sm">
              <Box flexDirection="row" alignItems="center" gap="sm">
                <Ionicons name="time" size={18} color={theme.colors.textPrimary} />
                <Text variant="heading4" fontWeight="600" fontSize={18}>
                  How long should each lesson be?
                </Text>
              </Box>
              <Box
                borderRadius="lg"
                padding="md"
                backgroundColor="backgroundSecondary"
                marginBottom="sm"
              >
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.pillsContainer}
                >
                  {lessonDurationOptions.map((option, index) => (
                    <OptionPill
                      key={option.value}
                      label={option.label}
                      selected={formData.lessonDuration === option.value}
                      onPress={() => handleDurationSelect(option.value)}
                      index={index}
                    />
                  ))}
                </ScrollView>
              </Box>
              <Box
                borderWidth={1}
                borderColor="border"
                borderRadius="lg"
                paddingHorizontal="md"
                paddingVertical="md"
                backgroundColor="white"
              >
                <TextInput
                  value={durationInput}
                  onChangeText={handleDurationInputChange}
                  placeholder="Duration (minutes)"
                  placeholderTextColor={theme.colors.textTertiary}
                  keyboardType="numeric"
                  style={[styles.textInput, { color: theme.colors.textPrimary }]}
                />
              </Box>
            </Stack>
          </Stack>
        </ScrollView>

        {/* Fixed Bottom CTA */}
        <Box
          paddingHorizontal="lg"
          paddingTop="md"
          paddingBottom="md"
          borderTopWidth={1}
          borderTopColor="border"
          backgroundColor="background"
          style={{ marginBottom: tabBarHeight }}
        >
          <Button
            variant="primary"
            onPress={() => {
              console.log('Button pressed!', { isFormValid, isSubmitting, formData });
              handleCreatePlan();
            }}
            disabled={!isFormValid}
            loading={isSubmitting}
            backgroundColor={!isFormValid ? 'border' : 'black'}
            borderRadius="full"
            minHeight={54}
          >
            {isSubmitting ? 'Creating plan...' : 'Continue'}
          </Button>
        </Box>
      </KeyboardAvoidingView>
    </Screen >
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    // Will be set dynamically based on tab bar and CTA heights
  },
  backButton: {
    position: 'absolute',
    left: 0,
    zIndex: 1,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
  },
  pillsContainer: {
    gap: 12,
    paddingVertical: 4,
  },
  textInput: {
    fontSize: 16,
    padding: 0,
  },
});
