import React from 'react';
import { Image, View } from 'react-native';
import { BoxProps } from '@shopify/restyle';
import { Theme } from '@designSystem/theme';
import { Box } from '@ui/primitives';
import { Text } from './Text';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@designSystem/ThemeProvider';

type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

type AvatarProps = BoxProps<Theme> & {
  size?: AvatarSize;
  source?: { uri: string };
  name?: string;
  onPress?: () => void;
  gradient?: [string, string];
  showOnlineIndicator?: boolean;
};

const sizeMap: Record<AvatarSize, number> = {
  sm: 32,
  md: 48,
  lg: 64,
  xl: 96,
};

export const Avatar: React.FC<AvatarProps> = ({
  size = 'md',
  source,
  name,
  onPress,
  gradient,
  showOnlineIndicator = false,
  ...props
}) => {
  const { theme } = useTheme();
  const avatarSize = sizeMap[size];
  const indicatorSize = size === 'sm' ? 8 : size === 'md' ? 12 : 14;
  const initials = name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?';

  const avatarContent = (
    <Box
      width={avatarSize}
      height={avatarSize}
      borderRadius="full"
      backgroundColor={gradient ? 'transparent' : 'primary'}
      alignItems="center"
      justifyContent="center"
      overflow="hidden"
      {...props}
    >
      {source ? (
        <Image
          source={source}
          style={{ width: avatarSize, height: avatarSize }}
          resizeMode="cover"
        />
      ) : gradient ? (
        <LinearGradient
          colors={gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            width: avatarSize,
            height: avatarSize,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text
            variant={size === 'sm' ? 'caption' : size === 'lg' || size === 'xl' ? 'heading3' : 'body'}
            color="textInverse"
          >
            {initials}
          </Text>
        </LinearGradient>
      ) : (
        <Text
          variant={size === 'sm' ? 'caption' : size === 'lg' || size === 'xl' ? 'heading3' : 'body'}
          color="textInverse"
        >
          {initials}
        </Text>
      )}
    </Box>
  );

  const content = (
    <View style={{ position: 'relative' }}>
      {avatarContent}
      {showOnlineIndicator && (
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: indicatorSize,
            height: indicatorSize,
            borderRadius: indicatorSize / 2,
            backgroundColor: theme.colors.success,
            borderWidth: 2,
            borderColor: theme.colors.surface,
          }}
        />
      )}
    </View>
  );

  if (onPress) {
    const TouchableOpacity = require('react-native').TouchableOpacity;
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

