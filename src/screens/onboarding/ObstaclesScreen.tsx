import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { OnboardingLayout } from '@ui/layout/OnboardingLayout';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '@navigation/types';
import { OptionPill } from '@components/onboarding';
import { useOnboarding } from '@context/OnboardingContext';

type ObstaclesScreenNavigationProp = NativeStackNavigationProp<
  OnboardingStackParamList,
  'Obstacles'
>;

const OBSTACLE_OPTIONS = [
  'Lack of time',
  'Hard to stay focused',
  "Don't know where to start",
  'Forget what I learned',
  'Busy mornings',
  'Inconsistent habits',
];

export const ObstaclesScreen: React.FC = () => {
  const navigation = useNavigation<ObstaclesScreenNavigationProp>();
  const { state, updateState } = useOnboarding();
  const [selectedObstacles, setSelectedObstacles] = useState<string[]>(
    state.obstacles || []
  );

  const handleContinue = () => {
    updateState({ obstacles: selectedObstacles });
    navigation.navigate('Encouragement');
  };

  const handleToggleObstacle = (obstacle: string) => {
    setSelectedObstacles((prev) =>
      prev.includes(obstacle)
        ? prev.filter((o) => o !== obstacle)
        : [...prev, obstacle]
    );
  };

  return (
    <OnboardingLayout
      currentStep={6}
      totalSteps={17}
      title="What usually gets in the way?"
      subtitle="Knowing this helps us build a plan you can stick to."
      onContinue={handleContinue}
      showBackButton={true}
    >
      <View style={styles.content}>
        {OBSTACLE_OPTIONS.map((obstacle) => (
          <View key={obstacle} style={styles.optionContainer}>
            <OptionPill
              label={obstacle}
              selected={selectedObstacles.includes(obstacle)}
              onPress={() => handleToggleObstacle(obstacle)}
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

