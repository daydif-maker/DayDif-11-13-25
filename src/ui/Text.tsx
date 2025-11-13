import React from 'react';
import { TextProps as RestyleTextProps } from '@shopify/restyle';
import { Theme } from '@designSystem/theme';
import { BaseText } from '@ui/primitives';

type TextVariant = 'heading1' | 'heading2' | 'heading3' | 'heading4' | 'body' | 'bodySmall' | 'caption';

type TextProps = RestyleTextProps<Theme> & {
  variant?: TextVariant;
  children: React.ReactNode;
};

export const Text: React.FC<TextProps> = ({
  variant = 'body',
  color = 'textPrimary',
  ...props
}) => {
  return (
    <BaseText
      variant={variant}
      color={color}
      {...props}
    />
  );
};

