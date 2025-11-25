import React, { useState, useEffect } from 'react';
import { ScrollView, KeyboardAvoidingView, Platform, StyleSheet, TouchableOpacity } from 'react-native';
import { Screen, Stack, Text, Card, Button } from '@ui';
import { Box } from '@ui/primitives';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { TodayStackParamList } from '@navigation/types';
import { TextInput } from 'react-native';
import { useTheme } from '@designSystem/ThemeProvider';
import { useCreatePlan, DaysPerWeekOption, LessonDurationOption } from '@hooks/useCreatePlan';
import { OptionPill } from '@components/onboarding/OptionPill';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '@store';

type CreatePlanScreenNavigationProp = NativeStackNavigationProp<TodayStackParamList, 'CreatePlan'>;

const daysPerWeekOptions: { value: DaysPerWeekOption; label: string }[] = [
  { value: 1, label: '1 day (1 lesson)' },
  { value: 2, label: '2 days (4 lessons)' },
  { value: 3, label: '3 days (6 lessons)' },
  { value: 4, label: '4 days (8 lessons)' },
  { value: 5, label: '5 days (10 lessons)' },
];

const lessonDurationOptions: { value: LessonDurationOption; label: string }[] = [
  { value: '5', label: '5 minutes' },
  { value: '8-10', label: '8–10 minutes' },
  { value: '10-15', label: '10–15 minutes' },
  { value: '15-20', label: '15–20 minutes' },
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
    lessonCount,
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

  const getDurationLabel = (value: LessonDurationOption | null): string => {
    if (!value) return '';
    return lessonDurationOptions.find(opt => opt.value === value)?.label || '';
  };

  const getDurationValue = (value: LessonDurationOption | null): string => {
    if (!value) return '';
    // Extract the max value from the range (e.g., '10-15' -> '15')
    const parts = value.split('-');
    return parts[parts.length - 1] || '';
  };

  const [durationInput, setDurationInput] = useState(
    formData.lessonDuration ? getDurationValue(formData.lessonDuration) : ''
  );

  // Sync durationInput when formData.lessonDuration changes externally
  useEffect(() => {
    if (formData.lessonDuration) {
      setDurationInput(getDurationValue(formData.lessonDuration));
    }
  }, [formData.lessonDuration]);

  const handleDurationInputChange = (text: string) => {
    setDurationInput(text);
    // Optionally update the selection if the input matches a preset
    const numericValue = parseInt(text, 10);
    if (!isNaN(numericValue)) {
      if (numericValue === 5) {
        setFormData((prev) => ({ ...prev, lessonDuration: '5' }));
      } else if (numericValue >= 8 && numericValue <= 10) {
        setFormData((prev) => ({ ...prev, lessonDuration: '8-10' }));
      } else if (numericValue >= 10 && numericValue <= 15) {
        setFormData((prev) => ({ ...prev, lessonDuration: '10-15' }));
      } else if (numericValue >= 15 && numericValue <= 20) {
        setFormData((prev) => ({ ...prev, lessonDuration: '15-20' }));
      }
    }
  };

  const handleDurationSelect = (value: LessonDurationOption) => {
    setFormData((prev) => ({ ...prev, lessonDuration: value }));
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

            {/* Field 2: Days Per Week */}
            <Stack gap="sm">
              <Box flexDirection="row" alignItems="center" gap="sm">
                <Ionicons name="calendar" size={18} color={theme.colors.textPrimary} />
                <Text variant="heading4" fontWeight="600" fontSize={18}>
                  How many days per week do you want lessons?
                </Text>
              </Box>
              <Box
                borderRadius="lg"
                padding="md"
                backgroundColor="backgroundSecondary"
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
                      selected={formData.daysPerWeek === option.value}
                      onPress={() =>
                        setFormData((prev) => ({
                          ...prev,
                          daysPerWeek: option.value,
                        }))
                      }
                      index={index}
                    />
                  ))}
                </ScrollView>
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
            disabled={!isFormValid || isSubmitting}
            loading={isSubmitting}
            backgroundColor={(!isFormValid || isSubmitting) ? 'border' : 'black'}
            borderRadius="full"
            minHeight={54}
          >
            Continue
          </Button>
        </Box>
      </KeyboardAvoidingView>
    </Screen>
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
