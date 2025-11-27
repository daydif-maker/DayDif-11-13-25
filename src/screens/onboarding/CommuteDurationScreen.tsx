import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { OnboardingLayout } from '@ui/layout/OnboardingLayout';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '@navigation/types';
import { OnboardingChoiceCard } from '@ui/onboarding/OnboardingChoiceCard';
import { useOnboarding } from '@context/OnboardingContext';

type CommuteDurationScreenNavigationProp = NativeStackNavigationProp<
  OnboardingStackParamList,
  'CommuteDuration'
>;

const DURATION_OPTIONS = [
  { 
    label: 'Under 15 minutes',
    sublabel: 'Quick trips',
    value: 10,
  },
  { 
    label: '15–30 minutes',
    sublabel: 'Short commute',
    value: 20,
  },
  { 
    label: '30–60 minutes',
    sublabel: 'Standard commute',
    value: 45,
  },
  { 
    label: 'Over 60 minutes',
    sublabel: 'Long haul',
    value: 75,
  },
];

export const CommuteDurationScreen: React.FC = () => {
  const navigation = useNavigation<CommuteDurationScreenNavigationProp>();
  const { state, updateState } = useOnboarding();
  const [selectedOption, setSelectedOption] = useState<string | null>(() => {
    // Find the option that matches the current state
    const match = DURATION_OPTIONS.find(opt => opt.value === state.commuteDurationMinutes);
    return match ? match.label : null;
  });

  const handleContinue = () => {
    const option = DURATION_OPTIONS.find(opt => opt.label === selectedOption);
    if (option) {
      updateState({ commuteDurationMinutes: option.value });
    }
    navigation.navigate('CommuteType');
  };

  const handleSelectOption = (label: string) => {
    setSelectedOption(label);
  };

  return (
    <OnboardingLayout
      currentStep={1}
      totalSteps={17}
      title="How long is your daily commute?"
      subtitle="This helps us design lessons that fit perfectly."
      onContinue={handleContinue}
      ctaDisabled={!selectedOption}
      showBackButton={true}
      showLanguageSelector={true}
    >
      <View style={styles.content}>
        {DURATION_OPTIONS.map((option, index) => (
          <View key={option.label} style={styles.optionContainer}>
            <OnboardingChoiceCard
              label={option.label}
              description={option.sublabel}
              selected={selectedOption === option.label}
              onPress={() => handleSelectOption(option.label)}
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
