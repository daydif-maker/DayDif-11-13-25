import React from 'react';
import { ActivityIndicator } from 'react-native';
import { BoxProps } from '@shopify/restyle';
import { Theme } from '@designSystem/theme';
import { Box } from '@ui/primitives';
import { Text } from './Text';
import { useTheme } from '@designSystem/ThemeProvider';

type LoadingStateProps = BoxProps<Theme> & {
  message?: string;
};

export const LoadingState: React.FC<LoadingStateProps> = ({
  message,
  ...props
}) => {
  const { theme } = useTheme();

  return (
    <Box
      flex={1}
      alignItems="center"
      justifyContent="center"
      padding="lg"
      {...props}
    >
      <ActivityIndicator size="large" color={theme.colors.primary} />
      {message && (
        <Text
          variant="bodySmall"
          color="textSecondary"
          marginTop="lg"
          textAlign="center"
        >
          {message}
        </Text>
      )}
    </Box>
  );
};

