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
    label: 'Career advancement',
    sublabel: 'Get ahead at work',
    icon: 'briefcase-outline',
  },
  { 
    label: 'Personal growth',
    sublabel: 'Become a better version of myself',
    icon: 'person-outline',
  },
  { 
    label: 'Stay curious',
    sublabel: 'Learn something new every day',
    icon: 'bulb-outline',
  },
  { 
    label: 'Build a specific skill',
    sublabel: 'Master a particular topic',
    icon: 'hammer-outline',
  },
  { 
    label: 'Use my time better',
    sublabel: 'Stop wasting my commute',
    icon: 'time-outline',
  },
];

export const MotivationScreen: React.FC = () => {
  const navigation = useNavigation<MotivationScreenNavigationProp>();
  const { state, updateState } = useOnboarding();
  const [selectedMotivation, setSelectedMotivation] = useState(state.motivation);

  const handleContinue = () => {
    updateState({ motivation: selectedMotivation });
    navigation.navigate('Obstacles');
  };

  const handleSelectMotivation = (motivation: string) => {
    setSelectedMotivation(motivation);
  };

  return (
    <OnboardingLayout
      currentStep={4}
      totalSteps={17}
      title="What's driving you to learn?"
      subtitle="This helps us personalize your experience."
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
              description={motivation.sublabel}
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
