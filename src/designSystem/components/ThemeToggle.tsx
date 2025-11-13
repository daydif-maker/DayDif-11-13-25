import React from 'react';
import { TouchableOpacity } from 'react-native';
import { useTheme } from '../ThemeProvider';
import * as Haptics from 'expo-haptics';
import { Box } from '@ui/primitives';

export const ThemeToggle: React.FC = () => {
  const { theme, themeVariant, toggleTheme } = useTheme();

  const handleToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleTheme();
  };

  return (
    <TouchableOpacity onPress={handleToggle} activeOpacity={0.7}>
      <Box
        backgroundColor="surface"
        padding="sm"
        borderRadius="md"
        style={theme.shadows.sm}
      >
        <Box
          width={40}
          height={20}
          borderRadius="full"
          backgroundColor={themeVariant === 'dark' ? 'primary' : 'border'}
          justifyContent="center"
          paddingHorizontal="xs"
        >
          <Box
            width={16}
            height={16}
            borderRadius="full"
            backgroundColor="white"
            style={{
              transform: [{ translateX: themeVariant === 'dark' ? 18 : 0 }],
            }}
          />
        </Box>
      </Box>
    </TouchableOpacity>
  );
};

