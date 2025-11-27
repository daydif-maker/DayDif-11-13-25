import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { OnboardingLayout } from '@ui/layout/OnboardingLayout';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '@navigation/types';
import { Card } from '@ui/Card';
import { Text } from '@ui/Text';
import { useOnboarding } from '@context/OnboardingContext';
import { useTheme } from '@designSystem/ThemeProvider';

type CommuteTimeOfDayScreenNavigationProp = NativeStackNavigationProp<
  OnboardingStackParamList,
  'CommuteTimeOfDay'
>;

export const CommuteTimeOfDayScreen: React.FC = () => {
  const navigation = useNavigation<CommuteTimeOfDayScreenNavigationProp>();
  const { state, updateState } = useOnboarding();
  const { theme } = useTheme();
  
  const [morningTime, setMorningTime] = useState('8:00 AM');
  const [eveningTime, setEveningTime] = useState('5:30 PM');
  const [oneWayOnly, setOneWayOnly] = useState(false);
  const [variableSchedule, setVariableSchedule] = useState(false);

  const handleContinue = () => {
    // Derive time of day from morning time
    const hour = parseInt(morningTime.split(':')[0]);
    const timeOfDay = hour < 12 ? 'Morning' : hour < 17 ? 'Afternoon' : 'Evening';
    updateState({ commuteTimeOfDay: timeOfDay });
    navigation.navigate('SocialProof');
  };

  return (
    <OnboardingLayout
      currentStep={9}
      totalSteps={17}
      title="When do you commute?"
      subtitle="We'll send your lesson at the perfect time."
      onContinue={handleContinue}
      showBackButton={true}
    >
      <View style={styles.content}>
        <Card variant="outlined" padding="lg" style={styles.card}>
          <View style={styles.timeRow}>
            <Text variant="body" color="textSecondary">
              Morning commute
            </Text>
            <TouchableOpacity style={styles.timeInput}>
              <Text variant="body" color="textPrimary" fontWeight="600">
                {morningTime}
              </Text>
            </TouchableOpacity>
          </View>
          
          {!oneWayOnly && (
            <View style={styles.timeRow}>
              <Text variant="body" color="textSecondary">
                Evening commute
              </Text>
              <TouchableOpacity style={styles.timeInput}>
                <Text variant="body" color="textPrimary" fontWeight="600">
                  {eveningTime}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </Card>

        <Card variant="outlined" padding="md" style={styles.toggleCard}>
          <View style={styles.toggleRow}>
            <Text variant="body" color="textPrimary">
              I only commute one way
            </Text>
            <Switch
              value={oneWayOnly}
              onValueChange={setOneWayOnly}
              trackColor={{ 
                false: theme.colors.border, 
                true: theme.colors.primary 
              }}
              thumbColor="#FFFFFF"
            />
          </View>
        </Card>

        <Card variant="outlined" padding="md" style={styles.toggleCard}>
          <View style={styles.toggleRow}>
            <Text variant="body" color="textPrimary">
              My schedule changes day to day
            </Text>
            <Switch
              value={variableSchedule}
              onValueChange={setVariableSchedule}
              trackColor={{ 
                false: theme.colors.border, 
                true: theme.colors.primary 
              }}
              thumbColor="#FFFFFF"
            />
          </View>
        </Card>
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
  card: {
    width: '100%',
  },
  toggleCard: {
    width: '100%',
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  timeInput: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
