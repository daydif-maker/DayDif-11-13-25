import React, { useEffect, useState } from 'react';
import { Dimensions } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedScrollHandler 
} from 'react-native-reanimated';
import { Screen, Stack, Text, Fab } from '@ui';
import { useUserStateStore, usePlansStore, useAuthStore } from '@store';
import { useNavigation } from '@react-navigation/native';
import { TodayStackParamList } from '@navigation/types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Box } from '@ui/primitives';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@designSystem/ThemeProvider';

import { useTodayScreen } from '@hooks/useTodayScreen';
import { lessonService } from '@services/api/lessonService';

// Sub-screens
import { OnboardingScreen } from './today/OnboardingScreen';
import { CreatePlanEmptyState } from './today/CreatePlanEmptyState';
import { GenerationScreen } from './today/GenerationScreen';
import { RegenerationScreen } from './today/RegenerationScreen';
import { OfflineScreen } from './today/OfflineScreen';
import { ErrorScreen } from './today/ErrorScreen';

// New Components
import { ParallaxHeader } from '../components/today/ParallaxHeader';
import { MagneticQueue } from '../components/today/MagneticQueue';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const HEADER_HEIGHT = SCREEN_HEIGHT * 0.55;

type TodayScreenNavigationProp = NativeStackNavigationProp<TodayStackParamList, 'Today'>;

const TodayScreenContent: React.FC = () => {
  const navigation = useNavigation<TodayScreenNavigationProp>();
  const { user } = useAuthStore();
  const {
    todayLesson,
    nextUp,
  } = useTodayScreen();
  
  const { setTodayLesson, setLessons, setIsGenerating } = useUserStateStore();
  const { theme } = useTheme();

  // Animation State
  const scrollY = useSharedValue(0);
  const [isCommuteMode, setIsCommuteMode] = useState(false);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  // Sync state
  useEffect(() => {
    if (todayLesson) {
      setTodayLesson(todayLesson);
    }
    if (nextUp) {
      const allLessons = todayLesson ? [todayLesson, ...nextUp] : nextUp;
      setLessons(allLessons);
    }
  }, [todayLesson, nextUp, setTodayLesson, setLessons]);

  const handleGenerateWeek = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('CreatePlan');
  };

  const handlePlayLesson = (lessonId?: string) => {
    const id = lessonId || todayLesson?.id;
    if (id) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        navigation.navigate('LessonDetail', { lessonId: id });
    }
  };

  return (
    <Screen backgroundColor="background" edges={['bottom']}>
      <Box flex={1} position="relative">
        
        {todayLesson && (
            <ParallaxHeader 
                scrollY={scrollY}
                lesson={todayLesson}
                onPlayPress={() => handlePlayLesson()}
                isCommuteMode={isCommuteMode}
                onToggleCommuteMode={() => setIsCommuteMode(!isCommuteMode)}
            />
        )}

        {!isCommuteMode && (
            <Animated.ScrollView
                onScroll={scrollHandler}
                scrollEventThrottle={16}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ 
                    paddingTop: HEADER_HEIGHT + theme.spacing.xl,
                    paddingBottom: 100 
                }}
            >
            <Stack gap="xl" paddingBottom="xxxl">
                
                {/* Next Up Queue */}
                {nextUp && nextUp.length > 0 ? (
                    <MagneticQueue 
                        lessons={nextUp} 
                        onLessonPress={(lesson) => handlePlayLesson(lesson.id)}
                    />
                ) : (
                   <Box paddingHorizontal="lg">
                        <Text variant="body" color="textSecondary" textAlign="center">
                            You're all caught up!
                        </Text>
                   </Box>
                )}

                {/* Spacing for FAB */}
                <Box height={60} />
            </Stack>
            </Animated.ScrollView>
        )}

        {/* Floating Action Button - Only show when not in commute mode */}
        {!isCommuteMode && (
            <Fab
                onPress={handleGenerateWeek}
                accessibilityLabel="Generate weekly lessons"
                testID="today-fab-generate-week"
                style={{
                    position: 'absolute',
                    right: theme.spacing.lg,
                    bottom: theme.spacing.lg,
                    marginBottom: 70
                }}
            />
        )}
      </Box>
    </Screen>
  );
};

export const TodayScreen: React.FC = () => {
  const {
    isFirstTime,
    isMissingPlan,
    isGeneratingLessons,
    isReturning,
    isOfflineMode,
    isError,
  } = useUserStateStore();

  if (isFirstTime()) return <OnboardingScreen />;
  if (isMissingPlan()) return <CreatePlanEmptyState />;
  if (isGeneratingLessons()) return <GenerationScreen />;
  if (isReturning()) return <RegenerationScreen />;
  if (isOfflineMode()) return <OfflineScreen />;
  if (isError()) return <ErrorScreen />;

  return <TodayScreenContent />;
};
