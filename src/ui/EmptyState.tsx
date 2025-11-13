import React from 'react';
import { BoxProps } from '@shopify/restyle';
import { Theme } from '@designSystem/theme';
import { Box } from '@ui/primitives';
import { Text } from './Text';
import { Button } from './Button';
import { Ionicons } from '@expo/vector-icons';
import { useIconColor } from './hooks/useIconColor';

type EmptyStateProps = BoxProps<Theme> & {
  heading: string;
  description: string;
  icon?: keyof typeof Ionicons.glyphMap;
  actionLabel?: string;
  onAction?: () => void;
};

export const EmptyState: React.FC<EmptyStateProps> = ({
  heading,
  description,
  icon,
  actionLabel,
  onAction,
  ...props
}) => {
  const iconColorTertiary = useIconColor('tertiary');

  return (
    <Box
      flex={1}
      alignItems="center"
      justifyContent="center"
      padding="lg"
      {...props}
    >
      {icon && (
        <Box marginBottom="lg">
          <Ionicons name={icon} size={48} color={iconColorTertiary} />
        </Box>
      )}
      <Text variant="heading3" marginBottom="sm" textAlign="center">
        {heading}
      </Text>
      <Text variant="body" color="textSecondary" marginBottom="lg" textAlign="center">
        {description}
      </Text>
      {actionLabel && onAction && (
        <Button variant="primary" onPress={onAction}>
          {actionLabel}
        </Button>
      )}
    </Box>
  );
};

