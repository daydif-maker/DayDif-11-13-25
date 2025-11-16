import React from 'react';
import { View, StyleSheet } from 'react-native';
import { OnboardingLayout } from '@ui/layout/OnboardingLayout';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '@navigation/types';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@designSystem/ThemeProvider';

type WelcomeScreenNavigationProp = NativeStackNavigationProp<
  OnboardingStackParamList,
  'Welcome'
>;

export const WelcomeScreen: React.FC = () => {
  const navigation = useNavigation<WelcomeScreenNavigationProp>();
  const { theme } = useTheme();

  const handleContinue = () => {
    navigation.navigate('ChooseGoal');
  };

  return (
    <OnboardingLayout
      currentStep={1}
      totalSteps={5}
      title="Turn your commute into learning."
      subtitle="Personalized audio lessons designed for your goals."
      onContinue={handleContinue}
      showBackButton={false}
    >
      <View style={styles.content}>
        <View
          style={[
            styles.iconContainer,
            {
              backgroundColor: theme.colors.primary,
              width: 120,
              height: 120,
              borderRadius: 60,
            },
          ]}
        >
          <Ionicons name="book" size={64} color={theme.colors.white} />
        </View>
      </View>
    </OnboardingLayout>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

