import React from 'react';
import { LayoutChangeEvent, PanResponder, GestureResponderEvent, View } from 'react-native';
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
  const isDraggingRef = React.useRef(false);
  const lastValueRef = React.useRef(value);
  const trackRef = React.useRef<View>(null);
  const trackOffsetRef = React.useRef<number | null>(null);

  // Initialize animated value on mount
  React.useEffect(() => {
    animatedValue.value = value;
    lastValueRef.current = value;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    if (!isDraggingRef.current && lastValueRef.current !== value) {
      // Only animate if the value changed externally (not from dragging)
      animatedValue.value = withTiming(value, { duration: 200 });
      lastValueRef.current = value;
    }
  }, [value]);

  const updateValue = React.useCallback(
    (newValue: number) => {
      onValueChange(newValue);
    },
    [onValueChange]
  );

  const getValueFromEvent = React.useCallback(
    (event: GestureResponderEvent) => {
      const { pageX, locationX } = event.nativeEvent;
      const width = trackWidth.value;
      if (width === 0) {
        return lastValueRef.current;
      }
      const offset = trackOffsetRef.current;
      const referenceX =
        offset !== null && pageX !== undefined ? pageX - offset : locationX;
      const clampedX = Math.max(0, Math.min(width, referenceX));
      const percentage = clampedX / width;
      const rawValue = minimumValue + percentage * (maximumValue - minimumValue);
      const steppedValue = Math.round(rawValue / step) * step;
      return Math.max(minimumValue, Math.min(maximumValue, steppedValue));
    },
    [maximumValue, minimumValue, step, trackWidth]
  );

  const handleTrackLayout = React.useCallback(
    (event: LayoutChangeEvent) => {
      const { width } = event.nativeEvent.layout;
      trackWidth.value = width;
      trackRef.current?.measureInWindow((x, _, measuredWidth) => {
        trackOffsetRef.current = x;
        trackWidth.value = measuredWidth;
      });
    },
    [trackWidth]
  );

  const panResponder = React.useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => !disabled,
        onStartShouldSetPanResponderCapture: () => !disabled,
        onMoveShouldSetPanResponder: () => !disabled,
        onMoveShouldSetPanResponderCapture: () => !disabled,
        onPanResponderTerminationRequest: () => false,
        onPanResponderGrant: (evt: GestureResponderEvent) => {
          if (trackWidth.value === 0) return;
          isDraggingRef.current = true;
          const clampedValue = getValueFromEvent(evt);
          animatedValue.value = clampedValue;
          lastValueRef.current = clampedValue;
          updateValue(clampedValue);
        },
        onPanResponderMove: (evt: GestureResponderEvent) => {
          if (trackWidth.value === 0 || !isDraggingRef.current) return;
          const clampedValue = getValueFromEvent(evt);
          if (Math.abs(animatedValue.value - clampedValue) > 0.01) {
            animatedValue.value = clampedValue;
            lastValueRef.current = clampedValue;
            updateValue(clampedValue);
          }
        },
        onPanResponderRelease: () => {
          isDraggingRef.current = false;
        },
        onPanResponderTerminate: () => {
          isDraggingRef.current = false;
        },
      }),
    [disabled, getValueFromEvent, updateValue, trackWidth, animatedValue]
  );

  const thumbStyle = useAnimatedStyle(() => {
    const percentage = (animatedValue.value - minimumValue) / (maximumValue - minimumValue);
    return {
      left: `${percentage * 100}%`,
      top: '50%',
      transform: [{ translateX: -12 }, { translateY: -12 }],
    };
  });

  const fillStyle = useAnimatedStyle(() => {
    const percentage = (animatedValue.value - minimumValue) / (maximumValue - minimumValue);
    return {
      width: `${percentage * 100}%`,
    };
  });

  return (
    <View style={{ paddingVertical: 12 }}>
      <View
        ref={trackRef}
        onLayout={handleTrackLayout}
        style={{
          width: '100%',
          height: 44,
          backgroundColor: 'transparent',
          borderRadius: theme.borderRadii.full,
          position: 'relative',
          overflow: 'visible',
          justifyContent: 'center',
        }}
        {...panResponder.panHandlers}
      >
        <Box
          height={8}
          backgroundColor="backgroundSecondary"
          borderRadius="full"
          width="100%"
        >
          <Animated.View
            pointerEvents="none"
            style={[
              {
                position: 'absolute',
                height: '100%',
                backgroundColor: theme.colors.black,
                borderRadius: theme.borderRadii.full,
              },
              fillStyle,
            ]}
          />
        </Box>
        <Animated.View
          pointerEvents="none"
          style={[
            {
              position: 'absolute',
              width: 24,
              height: 24,
              backgroundColor: theme.colors.black,
              borderRadius: theme.borderRadii.full,
              borderWidth: 2,
              borderColor: theme.colors.background,
            },
            thumbStyle,
          ]}
        />
      </View>
    </View>
  );
};
