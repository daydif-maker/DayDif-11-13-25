import React from 'react';
import { View, StyleSheet } from 'react-native';
import { OnboardingLayout } from '@ui/layout/OnboardingLayout';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '@navigation/types';
import { Card } from '@ui/Card';
import { Text } from '@ui/Text';
import { useTheme } from '@designSystem/ThemeProvider';

type ProjectionScreenNavigationProp = NativeStackNavigationProp<
  OnboardingStackParamList,
  'Projection'
>;

export const ProjectionScreen: React.FC = () => {
  const navigation = useNavigation<ProjectionScreenNavigationProp>();
  const { theme } = useTheme();

  const handleContinue = () => {
    navigation.navigate('Pace');
  };

  return (
    <OnboardingLayout
      currentStep={8}
      totalSteps={17}
      title="Your learning target is achievable"
      subtitle="With your commute and goals, you can complete:"
      onContinue={handleContinue}
      showBackButton={true}
    >
      <View style={styles.content}>
        <Card variant="outlined" padding="lg" style={styles.card}>
          <Text variant="heading3" marginBottom="sm" style={styles.highlight}>
            12 structured lessons in the next 30 days
          </Text>
          <Text variant="body" color="textSecondary" marginTop="xs">
            Most DayDif users report noticeable improvement after the first week.
          </Text>
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
  highlight: {
    textAlign: 'center',
  },
});

