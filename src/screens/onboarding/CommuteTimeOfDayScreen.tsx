import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { OnboardingLayout } from '@ui/layout/OnboardingLayout';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '@navigation/types';
import { OptionPill } from '@components/onboarding';
import { useOnboarding } from '@context/OnboardingContext';

type CommuteTimeOfDayScreenNavigationProp = NativeStackNavigationProp<
  OnboardingStackParamList,
  'CommuteTimeOfDay'
>;

const TIME_OPTIONS: Array<'Morning' | 'Afternoon' | 'Evening'> = [
  'Morning',
  'Afternoon',
  'Evening',
];

export const CommuteTimeOfDayScreen: React.FC = () => {
  const navigation = useNavigation<CommuteTimeOfDayScreenNavigationProp>();
  const { state, updateState } = useOnboarding();
  const [selectedTime, setSelectedTime] = useState(state.commuteTimeOfDay);

  const handleContinue = () => {
    updateState({ commuteTimeOfDay: selectedTime });
    navigation.navigate('CommuteDuration');
  };

  const handleSelectTime = (time: 'Morning' | 'Afternoon' | 'Evening') => {
    setSelectedTime(time);
  };

  return (
    <OnboardingLayout
      currentStep={3}
      totalSteps={17}
      title="When is your typical commute?"
      subtitle="This helps us deliver lessons at the right moment."
      onContinue={handleContinue}
      ctaDisabled={!selectedTime}
      showBackButton={true}
    >
      <View style={styles.content}>
        {TIME_OPTIONS.map((time) => (
          <View key={time} style={styles.optionContainer}>
            <OptionPill
              label={time}
              selected={selectedTime === time}
              onPress={() => handleSelectTime(time)}
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

