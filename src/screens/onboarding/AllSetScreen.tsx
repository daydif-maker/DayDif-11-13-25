import React from 'react';
import { View, StyleSheet } from 'react-native';
import { OnboardingLayout } from '@ui/layout/OnboardingLayout';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '@navigation/types';

type AllSetScreenNavigationProp = NativeStackNavigationProp<
  OnboardingStackParamList,
  'AllSet'
>;

export const AllSetScreen: React.FC = () => {
  const navigation = useNavigation<AllSetScreenNavigationProp>();

  const handleContinue = () => {
    navigation.navigate('Generating');
  };

  return (
    <OnboardingLayout
      currentStep={11}
      totalSteps={17}
      title="All set!"
      subtitle="Time to build your personalized learning path."
      onContinue={handleContinue}
      showBackButton={true}
    >
      <View style={styles.content} />
    </OnboardingLayout>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
});

