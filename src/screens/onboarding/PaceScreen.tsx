import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { OnboardingLayout } from '@ui/layout/OnboardingLayout';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '@navigation/types';
import { Slider } from '@ui/Slider';
import { Text } from '@ui/Text';
import { useOnboarding } from '@context/OnboardingContext';
import { useTheme } from '@designSystem/ThemeProvider';

type PaceScreenNavigationProp = NativeStackNavigationProp<
  OnboardingStackParamList,
  'Pace'
>;

const PACE_OPTIONS: Array<'Light' | 'Standard' | 'Fast'> = [
  'Light',
  'Standard',
  'Fast',
];

export const PaceScreen: React.FC = () => {
  const navigation = useNavigation<PaceScreenNavigationProp>();
  const { state, updateState } = useOnboarding();
  const { theme } = useTheme();
  const [paceValue, setPaceValue] = useState(() => {
    const index = PACE_OPTIONS.indexOf(state.pace);
    return index >= 0 ? index : 1; // Default to Standard
  });
  const selectedPace = PACE_OPTIONS[paceValue];

  const handleContinue = () => {
    updateState({ pace: selectedPace });
    navigation.navigate('SocialProof');
  };

  const handleValueChange = (value: number) => {
    const rounded = Math.round(value);
    setPaceValue(Math.max(0, Math.min(2, rounded)));
  };

  return (
    <OnboardingLayout
      currentStep={9}
      totalSteps={17}
      title="How quickly do you want to move through your lessons?"
      subtitle="We'll adjust your daily workload."
      onContinue={handleContinue}
      showBackButton={true}
    >
      <View style={styles.content}>
        <View style={styles.sliderContainer}>
          <Slider
            value={paceValue}
            minimumValue={0}
            maximumValue={2}
            step={1}
            onValueChange={handleValueChange}
          />
        </View>
        <View style={styles.labelsContainer}>
          {PACE_OPTIONS.map((pace, index) => (
            <View key={pace} style={styles.labelWrapper}>
              <Text
                variant="bodySmall"
                color={index === paceValue ? 'textPrimary' : 'textSecondary'}
                fontWeight={index === paceValue ? '600' : '400'}
              >
                {pace === 'Standard' ? `${pace} pace (recommended)` : `${pace} pace`}
              </Text>
            </View>
          ))}
        </View>
        <View style={styles.selectedContainer}>
          <Text variant="heading3" style={styles.selectedText}>
            {selectedPace} pace
          </Text>
        </View>
      </View>
    </OnboardingLayout>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingTop: 48,
    alignItems: 'center',
  },
  sliderContainer: {
    width: '100%',
    paddingHorizontal: 8,
    marginBottom: 24,
  },
  labelsContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    marginBottom: 32,
  },
  labelWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  selectedContainer: {
    marginTop: 16,
  },
  selectedText: {
    textAlign: 'center',
  },
});

