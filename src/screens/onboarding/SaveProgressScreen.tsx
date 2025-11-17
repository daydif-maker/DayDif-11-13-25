import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { OnboardingLayout } from '@ui/layout/OnboardingLayout';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '@navigation/types';
import { Text } from '@ui/Text';
import { useTheme } from '@designSystem/ThemeProvider';

type SaveProgressScreenNavigationProp = NativeStackNavigationProp<
  OnboardingStackParamList,
  'SaveProgress'
>;

export const SaveProgressScreen: React.FC = () => {
  const navigation = useNavigation<SaveProgressScreenNavigationProp>();
  const { theme } = useTheme();

  const handleAppleSignIn = () => {
    // TODO: Implement Apple Sign In
    navigation.navigate('Paywall');
  };

  const handleGoogleSignIn = () => {
    // TODO: Implement Google Sign In
    navigation.navigate('Paywall');
  };

  const handleSkip = () => {
    navigation.navigate('Paywall');
  };

  return (
    <OnboardingLayout
      currentStep={14}
      totalSteps={17}
      title="Save your progress"
      subtitle="Create an account to access your lessons across devices."
      onContinue={handleAppleSignIn}
      ctaLabel="Sign in with Apple"
      showBackButton={true}
    >
      <View style={styles.content}>
        <TouchableOpacity
          onPress={handleGoogleSignIn}
          style={[
            styles.secondaryButton,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <Text variant="body" color="textPrimary" fontWeight="600">
            Sign in with Google
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
          <Text variant="bodySmall" color="textSecondary">
            Would you like to sign in later? Skip
          </Text>
        </TouchableOpacity>
      </View>
    </OnboardingLayout>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    gap: 16,
    paddingTop: 8,
  },
  secondaryButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    minHeight: 48,
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
});

