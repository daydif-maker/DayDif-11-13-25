import React, { useState } from 'react';
import { Stack } from '@ui';
import { OnboardingLayout } from '@ui/layout/OnboardingLayout';
import { OnboardingChoiceCard } from '@ui/onboarding';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '@navigation/types';
import { useUserStateStore } from '@store';

type ChooseGoalScreenNavigationProp = NativeStackNavigationProp<
  OnboardingStackParamList,
  'ChooseGoal'
>;

const goalOptions = [
  { id: 'career', label: 'Career & Finance' },
  { id: 'health', label: 'Health & Fitness' },
  { id: 'technology', label: 'Technology' },
  { id: 'science', label: 'Science' },
  { id: 'growth', label: 'Personal Growth' },
  { id: 'custom', label: 'Custom' },
];

export const ChooseGoalScreen: React.FC = () => {
  const navigation = useNavigation<ChooseGoalScreenNavigationProp>();
  const { setOnboardingData } = useUserStateStore();
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);

  const handleContinue = () => {
    if (selectedGoal) {
      setOnboardingData({ goal: selectedGoal });
      navigation.navigate('CommuteInput');
    }
  };

  return (
    <OnboardingLayout
      currentStep={2}
      totalSteps={5}
      title="Choose Goal"
      subtitle="What would you like to learn about?"
      onContinue={handleContinue}
      ctaDisabled={!selectedGoal}
    >
      <Stack gap="sm">
        {goalOptions.map((goal, index) => (
          <OnboardingChoiceCard
            key={goal.id}
            selected={selectedGoal === goal.id}
            onPress={() => {
              setSelectedGoal(goal.id);
            }}
            label={goal.label}
            index={index}
          />
        ))}
      </Stack>
    </OnboardingLayout>
  );
};

