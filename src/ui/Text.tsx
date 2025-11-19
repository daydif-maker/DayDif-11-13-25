import React from 'react';
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
  | 'bodySmall'
  | 'caption';

type TextProps = RestyleTextProps<Theme> & {
  variant?: TextVariant;
  children: React.ReactNode;
  numberOfLines?: number;
  style?: StyleProp<TextStyle>;
};

export const Text: React.FC<TextProps> = ({
  variant = 'body',
  color = 'textPrimary',
  children,
  numberOfLines,
  style,
  ...restProps
}) => {
  return (
    <BaseText
      variant={variant}
      color={color}
      numberOfLines={numberOfLines}
      style={style}
      {...restProps}
    >
      {children}
    </BaseText>
  );
};
