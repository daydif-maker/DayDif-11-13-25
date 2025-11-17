import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Text } from '@ui/Text';
import { useTheme } from '@designSystem/ThemeProvider';
import * as Haptics from 'expo-haptics';

type OptionPillProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
  disabled?: boolean;
};

export const OptionPill: React.FC<OptionPillProps> = ({
  label,
  selected,
  onPress,
  disabled = false,
}) => {
  const { theme } = useTheme();

  const handlePress = () => {
    if (disabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={0.7}
      style={[
        styles.pill,
        {
          backgroundColor: selected
            ? theme.colors.black
            : theme.colors.backgroundSecondary,
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
  );
};

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: 24,
    paddingVertical: 18,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 60,
  },
});

