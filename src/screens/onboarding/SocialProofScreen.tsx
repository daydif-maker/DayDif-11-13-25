import React from 'react';
import { View, StyleSheet } from 'react-native';
import { OnboardingLayout } from '@ui/layout/OnboardingLayout';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '@navigation/types';
import { Card } from '@ui/Card';
import { Text } from '@ui/Text';
import { useTheme } from '@designSystem/ThemeProvider';

type SocialProofScreenNavigationProp = NativeStackNavigationProp<
  OnboardingStackParamList,
  'SocialProof'
>;

export const SocialProofScreen: React.FC = () => {
  const navigation = useNavigation<SocialProofScreenNavigationProp>();
  const { theme } = useTheme();

  const handleContinue = () => {
    navigation.navigate('AllSet');
  };

  return (
    <OnboardingLayout
      currentStep={10}
      totalSteps={17}
      title="DayDif works for people like you"
      subtitle="Join thousands turning their commute into a powerful learning routine."
      onContinue={handleContinue}
      showBackButton={true}
    >
      <View style={styles.content}>
        <Card variant="outlined" padding="lg" style={styles.card}>
          <View style={styles.avatarsContainer}>
            {[1, 2, 3].map((i) => (
              <View
                key={i}
                style={[
                  styles.avatar,
                  {
                    backgroundColor: theme.colors.primary,
                    marginLeft: i > 1 ? -12 : 0,
                  },
                ]}
              />
            ))}
          </View>
          <View style={styles.testimonials}>
            <Text variant="body" color="textPrimary" marginBottom="sm">
              "I finally use my commute for something meaningful."
            </Text>
            <Text variant="body" color="textPrimary">
              "The weekly recaps helped me actually remember what I learned."
            </Text>
          </View>
        </Card>
      </View>
    </OnboardingLayout>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingTop: 8,
  },
  card: {
    width: '100%',
  },
  avatarsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    paddingLeft: 4,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  testimonials: {
    gap: 16,
  },
});

