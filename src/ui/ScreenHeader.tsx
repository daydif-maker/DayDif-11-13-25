import React from 'react';
import { BoxProps } from '@shopify/restyle';
import { Theme } from '@designSystem/theme';
import { Box } from '@ui/primitives';
import { Text } from './Text';

type ScreenHeaderProps = BoxProps<Theme> & {
  title: string;
  subtitle?: string;
};

export const ScreenHeader: React.FC<ScreenHeaderProps> = ({
  title,
  subtitle,
  ...props
}) => {
  return (
    <Box {...props}>
      <Text variant="heading1" marginBottom="xs">
        {title}
      </Text>
      {/* Green underline matching Blinkist */}
      <Box
        width={40}
        height={3}
        backgroundColor="primary"
        borderRadius="sm"
        marginBottom={subtitle ? 'md' : 'sm'}
      />
      {subtitle && (
        <Text variant="bodySmall" color="textSecondary">
          {subtitle}
        </Text>
      )}
    </Box>
  );
};

