import React from 'react';
import { View, StyleSheet } from 'react-native';
import { OnboardingLayout } from '@ui/layout/OnboardingLayout';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '@navigation/types';
import { Text } from '@ui/Text';

type EncouragementScreenNavigationProp = NativeStackNavigationProp<
  OnboardingStackParamList,
  'Encouragement'
>;

export const EncouragementScreen: React.FC = () => {
  const navigation = useNavigation<EncouragementScreenNavigationProp>();

  const handleContinue = () => {
    navigation.navigate('Projection');
  };

  return (
    <OnboardingLayout
      currentStep={7}
      totalSteps={17}
      title="You have strong potential to reach your learning goals"
      subtitle="Based on thousands of DayDif sessions, users become more consistent after just 7 days of tailored commute learning."
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

