import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { OnboardingLayout } from '@ui/layout/OnboardingLayout';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '@navigation/types';
import { OnboardingChoiceCard } from '@ui/onboarding/OnboardingChoiceCard';
import { useOnboarding } from '@context/OnboardingContext';

type GenderScreenNavigationProp = NativeStackNavigationProp<
  OnboardingStackParamList,
  'Gender'
>;

const GENDER_OPTIONS = ['Male', 'Female', 'Other'];

export const GenderScreen: React.FC = () => {
  const navigation = useNavigation<GenderScreenNavigationProp>();
  const { state, updateState } = useOnboarding();
  const [selectedGender, setSelectedGender] = useState(state.gender);

  const handleContinue = () => {
    updateState({ gender: selectedGender });
    // Navigate to next screen (you'll need to add this to your navigation)
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  const handleSelectGender = (gender: string) => {
    setSelectedGender(gender);
  };

  return (
    <OnboardingLayout
      currentStep={1}
      totalSteps={17}
      title="Choose your Gender"
      subtitle="This will be used to calibrate your custom plan."
      onContinue={handleContinue}
      ctaDisabled={!selectedGender}
      showBackButton={true}
      showLanguageSelector={true}
    >
      <View style={styles.content}>
        {GENDER_OPTIONS.map((gender, index) => (
          <View key={gender} style={styles.optionContainer}>
            <OnboardingChoiceCard
              label={gender}
              selected={selectedGender === gender}
              onPress={() => handleSelectGender(gender)}
              index={index}
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

