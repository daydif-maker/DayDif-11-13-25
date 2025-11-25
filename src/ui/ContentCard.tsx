import React from 'react';
import { TouchableOpacity, Image, ImageSourcePropType } from 'react-native';
import { BoxProps } from '@shopify/restyle';
import { Theme } from '@designSystem/theme';
import { Box } from '@ui/primitives';
import { Text } from './Text';
import { ProgressBar } from './ProgressBar';
import { useTheme } from '@designSystem/ThemeProvider';

type ContentCardProps = BoxProps<Theme> & {
  title: string;
  author?: string;
  duration?: number; // in minutes
  progress?: number; // 0-100
  thumbnailSource?: ImageSourcePropType;
  thumbnailUrl?: string; // URL for placeholder/remote images
  onPress?: () => void;
};

export const ContentCard: React.FC<ContentCardProps> = ({
  title,
  author,
  duration,
  progress = 0,
  thumbnailSource,
  thumbnailUrl,
  onPress,
  ...props
}) => {
  const { theme } = useTheme();

  const content = (
    <Box
      backgroundColor="surface"
      borderRadius="lg"
      padding="md"
      flexDirection="row"
      alignItems="center"
      style={[theme.shadows.sm]}
      {...props}
    >
      {/* Thumbnail */}
      <Box
        width={64}
        height={64}
        borderRadius="md"
        overflow="hidden"
        marginRight="md"
      >
        {thumbnailSource ? (
          <Image
            source={thumbnailSource}
            style={{ width: 64, height: 64 }}
            resizeMode="cover"
          />
        ) : thumbnailUrl ? (
          <Image
            source={{ uri: thumbnailUrl }}
            style={{ width: 64, height: 64 }}
            resizeMode="cover"
          />
        ) : (
          <Image
            source={{ uri: 'https://picsum.photos/seed/default/64/64' }}
            style={{ width: 64, height: 64 }}
            resizeMode="cover"
          />
        )}
      </Box>

      {/* Content */}
      <Box flex={1}>
        <Text 
          variant="bodyMedium" 
          numberOfLines={1} 
          color="textPrimary"
          style={{ fontWeight: '700' }}
        >
          {title}
        </Text>
        {author && (
          <Text variant="bodySmall" color="textSecondary" numberOfLines={1}>
            {author}
          </Text>
        )}
        {/* Progress Bar */}
        <Box marginTop="xs" width="60%">
          <ProgressBar progress={progress} height="xs" color="progressGreen" />
        </Box>
      </Box>

      {/* Duration */}
      {duration !== undefined && (
        <Box
          paddingHorizontal="sm"
          paddingVertical="xs"
          marginLeft="sm"
        >
          <Text variant="bodySmall" color="primary" style={{ fontWeight: '500' }}>
            {duration} min
          </Text>
        </Box>
      )}
    </Box>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

