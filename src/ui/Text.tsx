import React, { useMemo } from 'react';
import { TextProps as RestyleTextProps } from '@shopify/restyle';
import { StyleProp, TextStyle } from 'react-native';
import { Theme } from '@designSystem/theme';
import { BaseText } from '@ui/primitives';

type TextVariant =
  | 'heading1'
  | 'heading2'
  | 'heading3'
  | 'heading4'
  | 'body'
  | 'bodyMedium'
  | 'bodySmall'
  | 'caption'
  | 'label'
  | 'metric';

type TextProps = RestyleTextProps<Theme> & {
  variant?: TextVariant;
  children: React.ReactNode;
  numberOfLines?: number;
  style?: StyleProp<TextStyle>;
  fontWeight?: '400' | '500' | '600' | '700' | '800' | '900' | 'normal' | 'bold';
};

// Map fontWeight to DM Sans font families
const getFontFamilyFromWeight = (weight?: string): string | undefined => {
  if (!weight) return undefined;
  
  switch (weight) {
    case '400':
    case 'normal':
      return 'DMSans_400Regular';
    case '500':
    case '600': // Map 600 to 500 since DM Sans doesn't have 600
      return 'DMSans_500Medium';
    case '700':
    case '800': // Map 800 to 700 since DM Sans doesn't have 800
    case '900': // Map 900 to 700 since DM Sans doesn't have 900
    case 'bold':
      return 'DMSans_700Bold';
    default:
      return undefined;
  }
};

export const Text: React.FC<TextProps> = ({
  variant = 'body',
  color = 'textPrimary',
  children,
  numberOfLines,
  style,
  fontWeight,
  ...restProps
}) => {
  // When fontWeight is provided, override the fontFamily to match
  const enhancedStyle = useMemo(() => {
    const fontFamily = getFontFamilyFromWeight(fontWeight);
    if (!fontFamily) return style;
    
    // Merge fontFamily into style
    return [style, { fontFamily }];
  }, [style, fontWeight]);

  return (
    <BaseText
      variant={variant}
      color={color}
      numberOfLines={numberOfLines}
      style={enhancedStyle}
      {...restProps}
    >
      {children}
    </BaseText>
  );
};
