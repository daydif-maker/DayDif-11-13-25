import React, { useEffect } from 'react';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Theme } from '@designSystem/theme';
import { Box } from '@ui/primitives';

type ProgressBarProps = {
  progress: number; // 0-100
  height?: keyof Theme['spacing'];
  color?: keyof Theme['colors'];
  backgroundColor?: keyof Theme['colors'];
};

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  height = 'sm',
  color = 'primary',
  backgroundColor = 'backgroundSecondary',
}) => {
  const animatedProgress = useSharedValue(0);

  useEffect(() => {
    animatedProgress.value = withTiming(Math.min(Math.max(progress, 0), 100), {
      duration: 500,
    });
  }, [progress, animatedProgress]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      width: `${animatedProgress.value}%`,
    };
  }, []);

  return (
    <Box
      height={height}
      backgroundColor={backgroundColor}
      borderRadius="full"
      overflow="hidden"
    >
      <Animated.View
        style={[
          {
            height: '100%',
            backgroundColor: '#627D98', // Using token color value directly for animation
          },
          animatedStyle,
        ]}
      />
    </Box>
  );
};

