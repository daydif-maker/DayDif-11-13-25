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

type CommuteDurationScreenNavigationProp = NativeStackNavigationProp<
  OnboardingStackParamList,
  'CommuteDuration'
>;

export const CommuteDurationScreen: React.FC = () => {
  const navigation = useNavigation<CommuteDurationScreenNavigationProp>();
  const { state, updateState } = useOnboarding();
  const { theme } = useTheme();
  const [duration, setDuration] = useState(state.commuteDurationMinutes);

  const handleContinue = () => {
    updateState({ commuteDurationMinutes: duration });
    navigation.navigate('LearningStyle');
  };

  const handleValueChange = (value: number) => {
    setDuration(Math.round(value));
  };

  return (
    <OnboardingLayout
      currentStep={4}
      totalSteps={17}
      title="How long is your commute?"
      subtitle="We'll tailor daily lessons to fit your available time."
      onContinue={handleContinue}
      showBackButton={true}
      showLanguageSelector={true}
    >
      <View style={styles.content}>
        <View style={styles.durationDisplay}>
          <Text variant="heading1" style={styles.durationText}>
            {duration} minutes
          </Text>
        </View>
        <View style={styles.sliderContainer}>
          <Slider
            value={duration}
            minimumValue={5}
            maximumValue={120}
            step={5}
            onValueChange={handleValueChange}
          />
        </View>
      </View>
    </OnboardingLayout>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingTop: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  durationDisplay: {
    marginBottom: 48,
    alignItems: 'center',
  },
  durationText: {
    textAlign: 'center',
  },
  sliderContainer: {
    width: '100%',
    paddingHorizontal: 8,
  },
});

