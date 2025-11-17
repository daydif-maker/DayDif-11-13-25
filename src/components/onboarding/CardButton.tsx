import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Card } from '@ui/Card';
import { Text } from '@ui/Text';
import { useTheme } from '@designSystem/ThemeProvider';
import * as Haptics from 'expo-haptics';

type CardButtonProps = {
  title: string;
  subtitle?: string;
  onPress: () => void;
  selected?: boolean;
  disabled?: boolean;
  children?: React.ReactNode;
};

export const CardButton: React.FC<CardButtonProps> = ({
  title,
  subtitle,
  onPress,
  selected = false,
  disabled = false,
  children,
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
      style={styles.container}
    >
      <Card
        variant={selected ? 'featured' : 'outlined'}
        padding="lg"
        style={[
          styles.card,
          {
            borderWidth: selected ? 2 : 1,
            borderColor: selected ? theme.colors.black : theme.colors.border,
            backgroundColor: selected
              ? theme.colors.backgroundSecondary
              : theme.colors.surface,
            opacity: disabled ? 0.5 : 1,
          },
        ]}
      >
        {children ? (
          children
        ) : (
          <>
            <Text variant="heading4" marginBottom={subtitle ? 'xs' : undefined}>
              {title}
            </Text>
            {subtitle && (
              <Text variant="bodySmall" color="textSecondary">
                {subtitle}
              </Text>
            )}
          </>
        )}
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  card: {
    width: '100%',
  },
});

