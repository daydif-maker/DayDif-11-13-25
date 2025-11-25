import React from 'react';
import { BoxProps } from '@shopify/restyle';
import { Theme } from '@designSystem/theme';
import { Box } from '@ui/primitives';
import { Text } from './Text';
import { Card } from './Card';
import { useTheme } from '@designSystem/ThemeProvider';
import { Ionicons } from '@expo/vector-icons';

type StatCardProps = BoxProps<Theme> & {
  icon: keyof typeof Ionicons.glyphMap;
  value: string | number;
  label: string;
  iconColor?: string;
};

export const StatCard: React.FC<StatCardProps> = ({
  icon,
  value,
  label,
  iconColor,
  ...props
}) => {
  const { theme } = useTheme();
  const defaultIconColor = iconColor || theme.colors.primary;

  return (
    <Card
      variant="elevated"
      backgroundColor="surface"
      borderRadius="lg"
      padding="md"
      flex={1}
      alignItems="center"
      justifyContent="center"
      style={[theme.shadows.sm, { minHeight: 110 }]}
      {...props}
    >
      <Box
        width={44}
        height={44}
        borderRadius="full"
        backgroundColor="backgroundSecondary"
        alignItems="center"
        justifyContent="center"
        marginBottom="sm"
      >
        <Ionicons name={icon} size={22} color={defaultIconColor} />
      </Box>
      <Text variant="metric" color="textPrimary" style={{ fontSize: 28 }}>
        {value}
      </Text>
      <Text variant="caption" color="textTertiary" style={{ textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 2 }}>
        {label}
      </Text>
    </Card>
  );
};

