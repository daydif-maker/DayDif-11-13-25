import React from 'react';
import { View, StyleSheet } from 'react-native';
import { OnboardingLayout } from '@ui/layout/OnboardingLayout';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '@navigation/types';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@designSystem/ThemeProvider';

type AllSetScreenNavigationProp = NativeStackNavigationProp<
  OnboardingStackParamList,
  'AllSet'
>;

export const AllSetScreen: React.FC = () => {
  const navigation = useNavigation<AllSetScreenNavigationProp>();
  const { theme } = useTheme();

  const handleContinue = () => {
    navigation.navigate('Generating');
  };

  return (
    <OnboardingLayout
      currentStep={11}
      totalSteps={17}
      title="All done!"
      subtitle="Time to build your personal learning plan."
      onContinue={handleContinue}
      ctaLabel="Create My Plan"
      showBackButton={true}
    >
      <View style={styles.content}>
        <View style={styles.celebrationContainer}>
          <Ionicons 
            name="checkmark-circle" 
            size={80} 
            color={theme.colors.success || '#00A86B'} 
          />
        </View>
      </View>
    </OnboardingLayout>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  celebrationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
