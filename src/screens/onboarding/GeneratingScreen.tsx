import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '@navigation/types';
import { BuildingLessonScreen } from '../lesson/BuildingLessonScreen';

type GeneratingScreenNavigationProp = NativeStackNavigationProp<
  OnboardingStackParamList,
  'Generating'
>;

export const GeneratingScreen: React.FC = () => {
  const navigation = useNavigation<GeneratingScreenNavigationProp>();

  const handleDone = () => {
    navigation.navigate('PlanReveal');
  };

  return <BuildingLessonScreen onDone={handleDone} />;
};

