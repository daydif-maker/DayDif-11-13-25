import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { OnboardingLayout } from '@ui/layout/OnboardingLayout';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '@navigation/types';
import { OnboardingChoiceCard } from '@ui/onboarding/OnboardingChoiceCard';
import { useOnboarding } from '@context/OnboardingContext';
import { Ionicons } from '@expo/vector-icons';

type WorkoutFrequencyScreenNavigationProp = NativeStackNavigationProp<
  OnboardingStackParamList,
  'WorkoutFrequency'
>;

const FREQUENCY_OPTIONS = [
  { 
    label: '0-2',
    description: 'Workouts now and then',
    icon: 'ellipse-outline',
  },
  { 
    label: '3-5',
    description: 'A few workouts per week',
    icon: 'ellipse',
  },
  { 
    label: '6+',
    description: 'Dedicated athlete',
    icon: 'grid-outline',
  },
];

export const WorkoutFrequencyScreen: React.FC = () => {
  const navigation = useNavigation<WorkoutFrequencyScreenNavigationProp>();
  const { state, updateState } = useOnboarding();
  const [selectedFrequency, setSelectedFrequency] = useState('');

  const handleContinue = () => {
    updateState({ workoutFrequency: selectedFrequency } as any);
    // Navigate to next screen
    navigation.goBack();
  };

  const handleSelectFrequency = (frequency: string) => {
    setSelectedFrequency(frequency);
  };

  return (
    <OnboardingLayout
      currentStep={2}
      totalSteps={17}
      title="How many workouts do you do per week?"
      subtitle="This will be used to calibrate your custom plan."
      onContinue={handleContinue}
      ctaDisabled={!selectedFrequency}
      showBackButton={true}
      showLanguageSelector={true}
    >
      <View style={styles.content}>
        {FREQUENCY_OPTIONS.map((option) => (
          <View key={option.label} style={styles.optionContainer}>
            <OnboardingChoiceCard
              label={option.label}
              description={option.description}
              selected={selectedFrequency === option.label}
              onPress={() => handleSelectFrequency(option.label)}
              icon={
                <Ionicons 
                  name={option.icon as any} 
                  size={20} 
                  color={selectedFrequency === option.label ? '#FFFFFF' : '#000000'}
                />
              }
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
    gap: 16,
    paddingTop: 32,
  },
  optionContainer: {
    width: '100%',
  },
});

