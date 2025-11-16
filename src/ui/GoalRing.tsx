import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { Box } from '@ui/primitives';
import { Text } from './Text';
import { useTheme } from '@designSystem/ThemeProvider';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

type GoalRingProps = {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
  centerLabel?: string | number;
  showPercentage?: boolean;
};

export const GoalRing: React.FC<GoalRingProps> = ({
  progress,
  size = 120,
  strokeWidth = 4,
  centerLabel,
  showPercentage = true,
}) => {
  const { theme } = useTheme();
  const animatedProgress = useSharedValue(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  // Cal AI style: start from top, sweep 270 degrees (3/4 circle)
  const startAngle = -90; // Start from top
  const maxSweep = 270; // 270 degree sweep
  const centerX = size / 2;
  const centerY = size / 2;

  useEffect(() => {
    animatedProgress.value = withTiming(Math.min(Math.max(progress, 0), 100), {
      duration: 600,
    });
  }, [progress, animatedProgress]);

  const animatedProps = useAnimatedProps(() => {
    const percentage = animatedProgress.value / 100;
    const strokeDashoffset = circumference - (circumference * percentage * (maxSweep / 360));
    return {
      strokeDashoffset: strokeDashoffset,
    } as any;
  });

  const displayLabel = centerLabel !== undefined 
    ? String(centerLabel) 
    : showPercentage 
      ? `${Math.round(progress)}%` 
      : '';

  return (
    <Box alignItems="center" justifyContent="center">
      <View style={{ width: size, height: size }}>
        <Svg width={size} height={size}>
          {/* Background circle */}
          <Circle
            cx={centerX}
            cy={centerY}
            r={radius}
            stroke={theme.colors.backgroundSecondary}
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress arc */}
          <AnimatedCircle
            cx={centerX}
            cy={centerY}
            r={radius}
            stroke={theme.colors.primary}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeLinecap="round"
            transform={`rotate(${startAngle} ${centerX} ${centerY})`}
            animatedProps={animatedProps}
          />
        </Svg>
        {/* Center content */}
        <View
          style={{
            position: 'absolute',
            width: size,
            height: size,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {displayLabel && (
            <Text variant="heading4" color="textPrimary" fontWeight="600">
              {displayLabel}
            </Text>
          )}
        </View>
      </View>
    </Box>
  );
};

