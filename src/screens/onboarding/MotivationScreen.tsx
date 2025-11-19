import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { OnboardingLayout } from '@ui/layout/OnboardingLayout';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '@navigation/types';
import { OnboardingChoiceCard } from '@ui/onboarding/OnboardingChoiceCard';
import { useOnboarding } from '@context/OnboardingContext';
import { Ionicons } from '@expo/vector-icons';

type MotivationScreenNavigationProp = NativeStackNavigationProp<
  OnboardingStackParamList,
  'Motivation'
>;

const MOTIVATION_OPTIONS = [
  { 
    label: 'Personal growth',
    description: 'Develop yourself',
    icon: 'person-outline',
  },
  { 
    label: 'Career advancement',
    description: 'Level up professionally',
    icon: 'briefcase-outline',
  },
  { 
    label: 'Academic improvement',
    description: 'Excel in your studies',
    icon: 'school-outline',
  },
  { 
    label: 'Staying intellectually sharp',
    description: 'Keep your mind active',
    icon: 'bulb-outline',
  },
  { 
    label: 'Exploring a new interest',
    description: 'Discover something new',
    icon: 'compass-outline',
  },
];

export const MotivationScreen: React.FC = () => {
  const navigation = useNavigation<MotivationScreenNavigationProp>();
  const { state, updateState } = useOnboarding();
  const [selectedMotivation, setSelectedMotivation] = useState(state.motivation);

  const handleContinue = () => {
    updateState({ motivation: selectedMotivation });
    navigation.navigate('CommuteTimeOfDay');
  };

  const handleSelectMotivation = (motivation: string) => {
    setSelectedMotivation(motivation);
  };

  return (
    <OnboardingLayout
      currentStep={2}
      totalSteps={17}
      title="Why does this goal matter to you?"
      subtitle="Understanding your motivation helps us build a lasting habit."
      onContinue={handleContinue}
      ctaDisabled={!selectedMotivation}
      showBackButton={true}
      showLanguageSelector={true}
    >
      <View style={styles.content}>
        {MOTIVATION_OPTIONS.map((motivation, index) => (
          <View key={motivation.label} style={styles.optionContainer}>
            <OnboardingChoiceCard
              label={motivation.label}
              description={motivation.description}
              selected={selectedMotivation === motivation.label}
              onPress={() => handleSelectMotivation(motivation.label)}
              index={index}
              icon={
                <Ionicons 
                  name={motivation.icon as any} 
                  size={20} 
                  color={selectedMotivation === motivation.label ? '#FFFFFF' : '#000000'}
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

