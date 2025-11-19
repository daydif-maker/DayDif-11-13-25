import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { OnboardingLayout } from '@ui/layout/OnboardingLayout';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '@navigation/types';
import { OptionPill } from '@components/onboarding';
import { useOnboarding } from '@context/OnboardingContext';

type LearningStyleScreenNavigationProp = NativeStackNavigationProp<
  OnboardingStackParamList,
  'LearningStyle'
>;

const LEARNING_STYLE_OPTIONS = [
  'Audio-first explanations',
  'Conversational, interactive lessons',
  'Structured, step-by-step learning',
  'A mix of everything',
];

export const LearningStyleScreen: React.FC = () => {
  const navigation = useNavigation<LearningStyleScreenNavigationProp>();
  const { state, updateState } = useOnboarding();
  const [selectedStyle, setSelectedStyle] = useState(state.learningStyle);

  const handleContinue = () => {
    updateState({ learningStyle: selectedStyle });
    navigation.navigate('Obstacles');
  };

  const handleSelectStyle = (style: string) => {
    setSelectedStyle(style);
  };

  return (
    <OnboardingLayout
      currentStep={5}
      totalSteps={17}
      title="How do you prefer to learn?"
      subtitle="Choose the style that keeps you most engaged."
      onContinue={handleContinue}
      ctaDisabled={!selectedStyle}
      showBackButton={true}
      showLanguageSelector={true}
    >
      <View style={styles.content}>
        {LEARNING_STYLE_OPTIONS.map((style, index) => (
          <View key={style} style={styles.optionContainer}>
            <OptionPill
              label={style}
              selected={selectedStyle === style}
              onPress={() => handleSelectStyle(style)}
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
    gap: 12,
    paddingTop: 8,
  },
  optionContainer: {
    width: '100%',
  },
});

