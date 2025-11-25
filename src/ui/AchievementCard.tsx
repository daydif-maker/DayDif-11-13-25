import React from 'react';
import { BoxProps } from '@shopify/restyle';
import { Theme } from '@designSystem/theme';
import { Box } from '@ui/primitives';
import { Text } from './Text';
import { useTheme } from '@designSystem/ThemeProvider';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

type AchievementType = 'streak' | 'warrior' | 'milestone' | 'star';

type AchievementCardProps = BoxProps<Theme> & {
  title: string;
  description: string;
  date: string;
  type?: AchievementType;
  iconName?: keyof typeof Ionicons.glyphMap;
};

const achievementStyles: Record<AchievementType, { gradient: [string, string]; icon: keyof typeof Ionicons.glyphMap }> = {
  streak: {
    gradient: ['#22C55E', '#16A34A'],
    icon: 'flame',
  },
  warrior: {
    gradient: ['#F59E0B', '#D97706'],
    icon: 'trophy',
  },
  milestone: {
    gradient: ['#8B5CF6', '#7C3AED'],
    icon: 'star',
  },
  star: {
    gradient: ['#06B6D4', '#0891B2'],
    icon: 'ribbon',
  },
};

export const AchievementCard: React.FC<AchievementCardProps> = ({
  title,
  description,
  date,
  type = 'milestone',
  iconName,
  ...props
}) => {
  const { theme } = useTheme();
  const { gradient, icon } = achievementStyles[type];
  const displayIcon = iconName || icon;

  return (
    <Box
      backgroundColor="surface"
      borderRadius="lg"
      padding="md"
      flexDirection="row"
      alignItems="center"
      style={theme.shadows.sm}
      {...props}
    >
      {/* Achievement Badge */}
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          width: 48,
          height: 48,
          borderRadius: 24,
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: theme.spacing.md,
        }}
      >
        <Ionicons name={displayIcon} size={24} color="#FFFFFF" />
      </LinearGradient>

      {/* Content */}
      <Box flex={1}>
        <Text variant="bodyMedium" color="textPrimary">
          {title}
        </Text>
        <Text variant="bodySmall" color="textSecondary">
          {description}
        </Text>
      </Box>

      {/* Date */}
      <Text variant="caption" color="textTertiary">
        {date}
      </Text>
    </Box>
  );
};

