import React from 'react';
import { TouchableOpacity, ViewStyle } from 'react-native';
import { BoxProps } from '@shopify/restyle';
import { Theme } from '@designSystem/theme';
import { Box } from '@ui/primitives';
import { useTheme } from '@designSystem/ThemeProvider';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useIconColor } from './hooks/useIconColor';

type FabProps = BoxProps<Theme> & {
  onPress: () => void;
  icon?: React.ReactNode;
  accessibilityLabel: string;
  testID?: string;
  hapticFeedback?: boolean;
  style?: ViewStyle | ViewStyle[];
};

export const Fab: React.FC<FabProps> = ({
  onPress,
  icon,
  accessibilityLabel,
  testID,
  hapticFeedback = true,
  style,
  ...props
}) => {
  const { theme } = useTheme();
  const iconColorInverse = useIconColor('inverse');

  const handlePress = () => {
    if (hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  };

  const defaultIcon = (
    <Ionicons name="add" size={24} color={iconColorInverse} />
  );

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      testID={testID}
      style={style}
    >
      <Box
        width={56}
        height={56}
        borderRadius="full"
        backgroundColor="primary"
        alignItems="center"
        justifyContent="center"
        {...props}
        style={theme.shadows.lg}
      >
        {icon || defaultIcon}
      </Box>
    </TouchableOpacity>
  );
};

