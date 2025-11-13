import React from 'react';
import { Screen } from '@ui';
import { EmptyState } from '@ui';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { TodayStackParamList } from '@navigation/types';

type CreatePlanEmptyStateNavigationProp = NativeStackNavigationProp<TodayStackParamList, 'Today'>;

export const CreatePlanEmptyState: React.FC = () => {
  const navigation = useNavigation<CreatePlanEmptyStateNavigationProp>();

  const handleCreatePlan = () => {
    navigation.navigate('CreatePlan');
  };

  return (
    <Screen>
      <EmptyState
        heading="Create Your Learning Plan"
        description="Set up your learning goals, choose topics you're interested in, and define your schedule to get started with personalized daily lessons."
        icon="calendar-outline"
        actionLabel="Create Plan"
        onAction={handleCreatePlan}
      />
    </Screen>
  );
};

