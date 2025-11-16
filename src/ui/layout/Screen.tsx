import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BoxProps } from '@shopify/restyle';
import { Theme } from '@designSystem/theme';
import { Box } from '@ui/primitives';
import { StyleSheet } from 'react-native';

type ScreenProps = BoxProps<Theme> & {
  children: React.ReactNode;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
};

export const Screen: React.FC<ScreenProps> = ({
  children,
  edges = ['top', 'bottom'],
  backgroundColor = 'background',
  ...props
}) => {
  return (
    <SafeAreaView 
      edges={edges} 
      style={[styles.safeArea, { backgroundColor: props.style?.backgroundColor || 'transparent' }]}
    >
      <Box flex={1} backgroundColor={backgroundColor} {...props}>
        {children}
      </Box>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
});

