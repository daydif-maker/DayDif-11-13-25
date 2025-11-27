import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { OnboardingLayout } from '@ui/layout/OnboardingLayout';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '@navigation/types';
import { OnboardingChoiceCard } from '@ui/onboarding/OnboardingChoiceCard';
import { useOnboarding } from '@context/OnboardingContext';
import { Ionicons } from '@expo/vector-icons';

type ObstaclesScreenNavigationProp = NativeStackNavigationProp<
  OnboardingStackParamList,
  'Obstacles'
>;

const OBSTACLE_OPTIONS = [
  {
    label: 'Lack of consistency',
    sublabel: "I start strong but don't stick with it",
    icon: 'repeat-outline',
    key: 'consistency',
  },
  {
    label: 'Too busy',
    sublabel: 'I never seem to find the time',
    icon: 'calendar-outline',
    key: 'busy',
  },
  {
    label: 'Too tired',
    sublabel: 'No energy left after work',
    icon: 'battery-dead-outline',
    key: 'tired',
  },
  {
    label: 'No structure',
    sublabel: "I don't know where to start",
    icon: 'grid-outline',
    key: 'structure',
  },
  {
    label: 'Too many options',
    sublabel: 'I get overwhelmed and give up',
    icon: 'apps-outline',
    key: 'options',
  },
];

export const ObstaclesScreen: React.FC = () => {
  const navigation = useNavigation<ObstaclesScreenNavigationProp>();
  const { state, updateState } = useOnboarding();
  const [selectedObstacle, setSelectedObstacle] = useState<string>(
    state.obstacles?.[0] || ''
  );

  const handleContinue = () => {
    updateState({ obstacles: [selectedObstacle] });
    navigation.navigate('Encouragement');
  };

  const handleSelectObstacle = (obstacle: string) => {
    setSelectedObstacle(obstacle);
  };

  return (
    <OnboardingLayout
      currentStep={5}
      totalSteps={17}
      title="What usually stops you from learning?"
      subtitle="Be honest — we're here to help."
      onContinue={handleContinue}
      ctaDisabled={!selectedObstacle}
      showBackButton={true}
    >
      <View style={styles.content}>
        {OBSTACLE_OPTIONS.map((obstacle, index) => (
          <View key={obstacle.key} style={styles.optionContainer}>
            <OnboardingChoiceCard
              label={obstacle.label}
              description={obstacle.sublabel}
              selected={selectedObstacle === obstacle.key}
              onPress={() => handleSelectObstacle(obstacle.key)}
              index={index}
              icon={
                <Ionicons 
                  name={obstacle.icon as any} 
                  size={20} 
                  color={selectedObstacle === obstacle.key ? '#FFFFFF' : '#000000'}
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
