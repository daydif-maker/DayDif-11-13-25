import React from 'react';
import { Image } from 'react-native';
import { BoxProps } from '@shopify/restyle';
import { Theme } from '@designSystem/theme';
import { Box } from '@ui/primitives';
import { Text } from './Text';
import { LinearGradient } from 'expo-linear-gradient';

type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

type AvatarProps = BoxProps<Theme> & {
  size?: AvatarSize;
  source?: { uri: string };
  name?: string;
  onPress?: () => void;
  gradient?: [string, string];
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
  ...props
}) => {
  const avatarSize = sizeMap[size];
  const initials = name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?';

  const content = (
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

