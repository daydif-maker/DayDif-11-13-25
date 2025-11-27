import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { OnboardingLayout } from '@ui/layout/OnboardingLayout';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '@navigation/types';
import { OnboardingChoiceCard } from '@ui/onboarding/OnboardingChoiceCard';
import { useOnboarding } from '@context/OnboardingContext';
import { Ionicons } from '@expo/vector-icons';

type CommuteTypeScreenNavigationProp = NativeStackNavigationProp<
  OnboardingStackParamList,
  'CommuteType'
>;

const COMMUTE_TYPE_OPTIONS = [
  { 
    label: 'Driving',
    icon: 'car-outline',
  },
  { 
    label: 'Train or Subway',
    icon: 'train-outline',
  },
  { 
    label: 'Bus',
    icon: 'bus-outline',
  },
  { 
    label: 'Walking or Biking',
    icon: 'walk-outline',
  },
  { 
    label: 'Rideshare',
    icon: 'people-outline',
  },
  { 
    label: 'Work from home some days',
    icon: 'home-outline',
  },
];

export const CommuteTypeScreen: React.FC = () => {
  const navigation = useNavigation<CommuteTypeScreenNavigationProp>();
  const { state, updateState } = useOnboarding();
  const [selectedTypes, setSelectedTypes] = useState<string[]>(
    state.commuteTypes || []
  );

  const handleContinue = () => {
    updateState({ commuteTypes: selectedTypes });
    navigation.navigate('Goal');
  };

  const handleToggleType = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type)
        ? prev.filter((t) => t !== type)
        : [...prev, type]
    );
  };

  return (
    <OnboardingLayout
      currentStep={2}
      totalSteps={17}
      title="How do you usually get there?"
      subtitle="Select all that apply. We'll optimize for your environment."
      onContinue={handleContinue}
      ctaDisabled={selectedTypes.length === 0}
      showBackButton={true}
      showLanguageSelector={true}
    >
      <View style={styles.content}>
        {COMMUTE_TYPE_OPTIONS.map((option, index) => (
          <View key={option.label} style={styles.optionContainer}>
            <OnboardingChoiceCard
              label={option.label}
              selected={selectedTypes.includes(option.label)}
              onPress={() => handleToggleType(option.label)}
              index={index}
              icon={
                <Ionicons 
                  name={option.icon as any} 
                  size={20} 
                  color={selectedTypes.includes(option.label) ? '#FFFFFF' : '#000000'}
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
    gap: 12,
    paddingTop: 8,
  },
  optionContainer: {
    width: '100%',
  },
});

