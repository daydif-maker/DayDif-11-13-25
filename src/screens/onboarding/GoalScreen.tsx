import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
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
  'Business & Entrepreneurship',
  'Personal Development',
  'Science & Technology',
  'History & Culture',
  'Health & Wellness',
  'Psychology & Relationships',
  'Finance & Investing',
  'Creativity & Arts',
  'Leadership & Management',
  'Philosophy & Big Ideas',
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
      currentStep={3}
      totalSteps={17}
      title="What do you want to learn first?"
      subtitle="You can always explore more topics later."
      onContinue={handleContinue}
      ctaDisabled={!selectedGoal}
      showBackButton={true}
      showLanguageSelector={true}
    >
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
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
      </ScrollView>
    </OnboardingLayout>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  content: {
    gap: 12,
    paddingTop: 8,
    paddingBottom: 16,
  },
  optionContainer: {
    width: '100%',
  },
});
