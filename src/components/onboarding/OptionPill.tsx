import React, { useEffect } from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withDelay,
} from 'react-native-reanimated';
import { Text } from '@ui/Text';
import { useTheme } from '@designSystem/ThemeProvider';
import * as Haptics from 'expo-haptics';

type OptionPillProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
  disabled?: boolean;
  index?: number;
};

export const OptionPill: React.FC<OptionPillProps> = ({
  label,
  selected,
  onPress,
  disabled = false,
  index = 0,
}) => {
  const { theme } = useTheme();
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);

  useEffect(() => {
    const delay = index * 50; // 50ms delay between each button
    scale.value = withDelay(
      delay,
      withSpring(1, {
        damping: 12,
        stiffness: 200,
      })
    );
    opacity.value = withDelay(
      delay,
      withSpring(1, {
        damping: 12,
        stiffness: 200,
      })
    );
  }, [index, scale, opacity]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });

  const handlePress = () => {
    if (disabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        onPress={handlePress}
        disabled={disabled}
        activeOpacity={0.7}
        style={[
          styles.pill,
          {
            backgroundColor: selected
              ? theme.colors.black
              : theme.colors.white,
            borderWidth: selected ? 0 : 1,
            borderColor: theme.colors.border,
            opacity: disabled ? 0.5 : 1,
          },
        ]}
      >
      <Text
        variant="body"
        color={selected ? 'textInverse' : 'textPrimary'}
        fontWeight="600"
        fontSize={17}
      >
        {label}
      </Text>
    </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
});

