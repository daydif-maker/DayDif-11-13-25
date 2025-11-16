import React, { useState } from 'react';
import { Stack, Text, Input, Chip, Row } from '@ui';
import { Box } from '@ui/primitives';
import { OnboardingLayout } from '@ui/layout/OnboardingLayout';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '@navigation/types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useUserStateStore } from '@store';

type CommuteInputScreenNavigationProp = NativeStackNavigationProp<
  OnboardingStackParamList,
  'CommuteInput'
>;

const commuteSchema = z.object({
  minutesPerDay: z
    .string()
    .min(1, 'Required')
    .refine((val) => {
      const num = parseInt(val, 10);
      return !isNaN(num) && num > 0 && num <= 180;
    }, 'Enter a valid number between 1 and 180'),
  daysPerWeek: z
    .string()
    .min(1, 'Required')
    .refine((val) => {
      const num = parseInt(val, 10);
      return !isNaN(num) && num > 0 && num <= 7;
    }, 'Enter a valid number between 1 and 7'),
});

type CommuteFormData = z.infer<typeof commuteSchema>;

const durationOptions = [15, 30, 60, 90];
const daysOptions = [3, 5, 7];

export const CommuteInputScreen: React.FC = () => {
  const navigation = useNavigation<CommuteInputScreenNavigationProp>();
  const { setOnboardingData } = useUserStateStore();
  const [selectedMinutes, setSelectedMinutes] = useState<number | null>(null);
  const [selectedDays, setSelectedDays] = useState<number | null>(null);
  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid },
  } = useForm<CommuteFormData>({
    resolver: zodResolver(commuteSchema),
    mode: 'onChange',
  });

  const minutesValue = watch('minutesPerDay');
  const daysValue = watch('daysPerWeek');

  const handleMinutesSelect = (minutes: number) => {
    setSelectedMinutes(minutes);
    setValue('minutesPerDay', String(minutes), { shouldValidate: true });
  };

  const handleDaysSelect = (days: number) => {
    setSelectedDays(days);
    setValue('daysPerWeek', String(days), { shouldValidate: true });
  };

  const onSubmit = (data: CommuteFormData) => {
    setOnboardingData({
      minutesPerDay: parseInt(data.minutesPerDay, 10),
      daysPerWeek: parseInt(data.daysPerWeek, 10),
    });
    navigation.navigate('LessonSettings');
  };

  return (
    <OnboardingLayout
      currentStep={3}
      totalSteps={5}
      title="Your Commute"
      subtitle="Tell us about your daily commute time."
      onContinue={handleSubmit(onSubmit)}
      ctaDisabled={!isValid}
      keyboardAvoiding
    >
      <Stack gap="xl" paddingBottom="lg">
        {/* Duration selection */}
        <Box>
          <Text variant="heading3" marginBottom="xs" fontWeight="600">
            Duration
          </Text>
          <Text variant="bodySmall" color="textSecondary" marginBottom="md">
            How long is your daily commute?
          </Text>
          <Row gap="sm" flexWrap="wrap" marginBottom="md">
            {durationOptions.map((minutes) => (
              <Chip
                key={minutes}
                selected={selectedMinutes === minutes || minutesValue === String(minutes)}
                onPress={() => handleMinutesSelect(minutes)}
              >
                {minutes} mins
              </Chip>
            ))}
          </Row>
          <Input
            label="Or enter custom minutes"
            control={control}
            name="minutesPerDay"
            keyboardType="numeric"
            placeholder="e.g., 45"
            error={errors.minutesPerDay?.message}
          />
        </Box>

        {/* Days per week selection */}
        <Box>
          <Text variant="heading3" marginBottom="xs" fontWeight="600">
            Frequency
          </Text>
          <Text variant="bodySmall" color="textSecondary" marginBottom="md">
            How many days per week?
          </Text>
          <Row gap="sm" flexWrap="wrap" marginBottom="md">
            {daysOptions.map((days) => (
              <Chip
                key={days}
                selected={selectedDays === days || daysValue === String(days)}
                onPress={() => handleDaysSelect(days)}
              >
                {days} days
              </Chip>
            ))}
          </Row>
          <Input
            label="Or enter custom days"
            control={control}
            name="daysPerWeek"
            keyboardType="numeric"
            placeholder="e.g., 4"
            error={errors.daysPerWeek?.message}
          />
        </Box>
      </Stack>
    </OnboardingLayout>
  );
};

