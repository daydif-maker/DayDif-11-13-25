import React, { useState } from 'react';
import { Stack, Text, Chip, Slider } from '@ui';
import { Box } from '@ui/primitives';
import { OnboardingLayout } from '@ui/layout/OnboardingLayout';
import { OnboardingChoiceCard } from '@ui/onboarding';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '@navigation/types';
import { useUserStateStore } from '@store';

type LessonSettingsScreenNavigationProp = NativeStackNavigationProp<
  OnboardingStackParamList,
  'LessonSettings'
>;

const difficultyOptions = [
  { id: 'beginner', label: 'Beginner' },
  { id: 'intermediate', label: 'Intermediate' },
  { id: 'advanced', label: 'Advanced' },
];

const audioStyleOptions = [
  { id: 'conversational', label: 'Conversational' },
  { id: 'formal', label: 'Formal' },
  { id: 'casual', label: 'Casual' },
];

export const LessonSettingsScreen: React.FC = () => {
  const navigation = useNavigation<LessonSettingsScreenNavigationProp>();
  const { setOnboardingData } = useUserStateStore();
  const [lessonLength, setLessonLength] = useState(10);
  const [difficulty, setDifficulty] = useState<string | null>(null);
  const [audioStyle, setAudioStyle] = useState<string | null>(null);

  const isFormValid = difficulty !== null && audioStyle !== null;

  const handleContinue = () => {
    if (isFormValid) {
      setOnboardingData({
        lessonLength,
        difficulty,
        audioStyle,
      });
      navigation.navigate('GeneratePlan');
    }
  };

  return (
    <OnboardingLayout
      currentStep={4}
      totalSteps={5}
      title="Lesson Settings"
      subtitle="Customize your learning experience."
      onContinue={handleContinue}
      ctaDisabled={!isFormValid}
    >
      <Stack gap="xl" paddingBottom="lg">
        {/* Lesson length slider */}
        <Box
          padding="lg"
          borderRadius="xl"
          backgroundColor="backgroundSecondary"
        >
          <Stack gap="md">
            <Text variant="heading4" marginBottom="xs">
              Lesson Length
            </Text>
            <Text variant="bodySmall" color="textSecondary" marginBottom="sm">
              {lessonLength} minutes
            </Text>
            <Slider
              value={lessonLength}
              minimumValue={5}
              maximumValue={30}
              step={5}
              onValueChange={setLessonLength}
            />
          </Stack>
        </Box>

        {/* Difficulty selection */}
        <Box>
          <Text variant="heading3" marginBottom="md" fontWeight="600">
            Difficulty
          </Text>
          <Stack gap="sm">
            {difficultyOptions.map((option, index) => (
              <OnboardingChoiceCard
                key={option.id}
                selected={difficulty === option.id}
                onPress={() => {
                  setDifficulty(option.id);
                }}
                label={option.label}
                index={index}
              />
            ))}
          </Stack>
        </Box>

        {/* Audio style selection */}
        <Box>
          <Text variant="heading3" marginBottom="md" fontWeight="600">
            Audio Style
          </Text>
          <Stack gap="sm">
            {audioStyleOptions.map((option, index) => (
              <OnboardingChoiceCard
                key={option.id}
                selected={audioStyle === option.id}
                onPress={() => {
                  setAudioStyle(option.id);
                }}
                label={option.label}
                index={index}
              />
            ))}
          </Stack>
        </Box>
      </Stack>
    </OnboardingLayout>
  );
};

