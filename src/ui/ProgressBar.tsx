import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Theme } from '@designSystem/theme';
import { useTheme } from '@designSystem/ThemeProvider';

type ProgressBarProps = {
  progress: number; // 0-100
  height?: keyof Theme['spacing'];
  color?: keyof Theme['colors'];
  backgroundColor?: keyof Theme['colors'];
};

const heightMap: Record<keyof Theme['spacing'], number> = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
  xxxl: 64,
};

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  height = 'sm',
  color = 'primary',
  backgroundColor = 'backgroundSecondary',
}) => {
  const { theme } = useTheme();
  const animatedProgress = useSharedValue(0);
  const barHeight = heightMap[height];

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
    <View
      style={{
        height: barHeight,
        backgroundColor: theme.colors[backgroundColor],
        borderRadius: barHeight / 2,
        overflow: 'hidden',
        flexShrink: 0,
        flexGrow: 0,
      }}
    >
      <Animated.View
        style={[
          {
            height: barHeight,
            backgroundColor: theme.colors[color],
            borderRadius: barHeight / 2,
          },
          animatedStyle,
        ]}
      />
    </View>
  );
};

