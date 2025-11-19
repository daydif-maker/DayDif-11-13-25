import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { OnboardingLayout } from '@ui/layout/OnboardingLayout';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '@navigation/types';
import { OptionPill } from '@components/onboarding';
import { useOnboarding } from '@context/OnboardingContext';

type GoalScreenNavigationProp = NativeStackNavigationProp<
  OnboardingStackParamList,
  'Goal'
>;

const GOAL_OPTIONS = [
  'Business & Finance',
  'Personal Development',
  'Technology & AI',
  'History & Culture',
  'Psychology & Behavior',
  'Language Basics',
  'Custom Topic',
];

export const GoalScreen: React.FC = () => {
  const navigation = useNavigation<GoalScreenNavigationProp>();
  const { state, updateState } = useOnboarding();
  const [selectedGoal, setSelectedGoal] = useState(state.goal);

  const handleContinue = () => {
    updateState({ goal: selectedGoal });
    navigation.navigate('Motivation');
  };

  const handleSelectGoal = (goal: string) => {
    setSelectedGoal(goal);
  };

  return (
    <OnboardingLayout
      currentStep={1}
      totalSteps={17}
      title="What would you like to learn?"
      subtitle="Choose one to get started. You can change it anytime."
      onContinue={handleContinue}
      ctaDisabled={!selectedGoal}
      showBackButton={true}
      showLanguageSelector={true}
    >
      <View style={styles.content}>
        {GOAL_OPTIONS.map((goal, index) => (
          <View key={goal} style={styles.optionContainer}>
            <OptionPill
              label={goal}
              selected={selectedGoal === goal}
              onPress={() => handleSelectGoal(goal)}
              index={index}
            />
          </View>
        ))}
      </View>
    </OnboardingLayout>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    gap: 12,
    paddingTop: 8,
  },
  optionContainer: {
    width: '100%',
  },
});

