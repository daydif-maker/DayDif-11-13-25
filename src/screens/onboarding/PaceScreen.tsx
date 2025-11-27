import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { OnboardingLayout } from '@ui/layout/OnboardingLayout';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '@navigation/types';
import { OnboardingChoiceCard } from '@ui/onboarding/OnboardingChoiceCard';
import { Text } from '@ui/Text';
import { useOnboarding } from '@context/OnboardingContext';
import { Ionicons } from '@expo/vector-icons';

type PaceScreenNavigationProp = NativeStackNavigationProp<
  OnboardingStackParamList,
  'Pace'
>;

const PACE_OPTIONS = [
  {
    label: 'Relaxed',
    sublabel: '3–5 lessons per week',
    value: 'Light' as const,
    icon: 'leaf-outline',
    topicsPerMonth: 1,
  },
  {
    label: 'Steady',
    sublabel: '7 lessons per week',
    value: 'Standard' as const,
    icon: 'walk-outline',
    recommended: true,
    topicsPerMonth: 2,
  },
  {
    label: 'Ambitious',
    sublabel: '10+ lessons per week',
    value: 'Fast' as const,
    icon: 'rocket-outline',
    topicsPerMonth: 4,
  },
];

export const PaceScreen: React.FC = () => {
  const navigation = useNavigation<PaceScreenNavigationProp>();
  const { state, updateState } = useOnboarding();
  const [selectedPace, setSelectedPace] = useState<string>(() => {
    const match = PACE_OPTIONS.find(opt => opt.value === state.pace);
    return match ? match.label : 'Steady';
  });

  const handleContinue = () => {
    const option = PACE_OPTIONS.find(opt => opt.label === selectedPace);
    if (option) {
      updateState({ pace: option.value });
    }
    navigation.navigate('Projection');
  };

  const selectedOption = PACE_OPTIONS.find(opt => opt.label === selectedPace);

  return (
    <OnboardingLayout
      currentStep={7}
      totalSteps={17}
      title="How fast do you want to progress?"
      subtitle="You can adjust this anytime."
      onContinue={handleContinue}
      showBackButton={true}
    >
      <View style={styles.content}>
        {PACE_OPTIONS.map((option, index) => (
          <View key={option.label} style={styles.optionContainer}>
            <OnboardingChoiceCard
              label={option.recommended ? `${option.label} (Recommended)` : option.label}
              description={option.sublabel}
              selected={selectedPace === option.label}
              onPress={() => setSelectedPace(option.label)}
              index={index}
              icon={
                <Ionicons 
                  name={option.icon as any} 
                  size={20} 
                  color={selectedPace === option.label ? '#FFFFFF' : '#000000'}
                />
              }
            />
          </View>
        ))}
        
        {selectedOption && (
          <View style={styles.projectionContainer}>
            <Text variant="body" color="textSecondary" style={styles.projectionText}>
              At this pace, you'll complete about {selectedOption.topicsPerMonth} topics per month.
            </Text>
          </View>
        )}
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
  projectionContainer: {
    marginTop: 16,
    paddingHorizontal: 8,
  },
  projectionText: {
    textAlign: 'center',
  },
});
