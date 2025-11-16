import React from 'react';
import { TouchableOpacity, PanResponder, GestureResponderEvent } from 'react-native';
import { Box } from '@ui/primitives';
import { useTheme } from '@designSystem/ThemeProvider';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

type SliderProps = {
  value: number;
  minimumValue?: number;
  maximumValue?: number;
  step?: number;
  onValueChange: (value: number) => void;
  disabled?: boolean;
};

export const Slider: React.FC<SliderProps> = ({
  value,
  minimumValue = 0,
  maximumValue = 100,
  step = 1,
  onValueChange,
  disabled = false,
}) => {
  const { theme } = useTheme();
  const trackWidth = useSharedValue(0);
  const animatedValue = useSharedValue(value);

  React.useEffect(() => {
    animatedValue.value = withTiming(value, { duration: 200 });
  }, [value, animatedValue]);

  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !disabled,
      onMoveShouldSetPanResponder: () => !disabled,
      onPanResponderGrant: () => {
        // Haptic feedback on start
      },
      onPanResponderMove: (evt: GestureResponderEvent) => {
        if (trackWidth.value === 0) return;
        const { locationX } = evt.nativeEvent;
        const percentage = Math.max(0, Math.min(1, locationX / trackWidth.value));
        const newValue = Math.round(
          (minimumValue + percentage * (maximumValue - minimumValue)) / step
        ) * step;
        const clampedValue = Math.max(minimumValue, Math.min(maximumValue, newValue));
        animatedValue.value = clampedValue;
        onValueChange(clampedValue);
      },
      onPanResponderRelease: () => {
        // Haptic feedback on release
      },
    })
  ).current;

  const thumbStyle = useAnimatedStyle(() => {
    const percentage = (animatedValue.value - minimumValue) / (maximumValue - minimumValue);
    return {
      left: `${percentage * 100}%`,
      transform: [{ translateX: -12 }],
    };
  });

  const fillStyle = useAnimatedStyle(() => {
    const percentage = (animatedValue.value - minimumValue) / (maximumValue - minimumValue);
    return {
      width: `${percentage * 100}%`,
    };
  });

  return (
    <Box
      onLayout={(event) => {
        trackWidth.value = event.nativeEvent.layout.width;
      }}
      height={8}
      backgroundColor="backgroundSecondary"
      borderRadius="full"
      position="relative"
      overflow="visible"
      {...panResponder.panHandlers}
    >
      <Animated.View
        style={[
          {
            position: 'absolute',
            height: '100%',
            backgroundColor: theme.colors.primary,
            borderRadius: theme.borderRadius.full,
          },
          fillStyle,
        ]}
      />
      <Animated.View
        style={[
          {
            position: 'absolute',
            width: 24,
            height: 24,
            backgroundColor: theme.colors.primary,
            borderRadius: theme.borderRadius.full,
            top: -8,
            borderWidth: 2,
            borderColor: theme.colors.background,
          },
          thumbStyle,
        ]}
      />
    </Box>
  );
};

