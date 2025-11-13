import React from 'react';
import { TextInput, TextInputProps } from 'react-native';
import { Text } from './Text';
import { useController, Control, FieldPath, FieldValues } from 'react-hook-form';
import { Box } from '@ui/primitives';

type InputProps<T extends FieldValues> = Omit<TextInputProps, 'style'> & {
  label?: string;
  error?: string;
  control: Control<T>;
  name: FieldPath<T>;
  helperText?: string;
};

export function Input<T extends FieldValues>({
  label,
  error,
  control,
  name,
  helperText,
  ...inputProps
}: InputProps<T>) {
  const {
    field: { onChange, onBlur, value },
    fieldState: { invalid },
  } = useController({
    control,
    name,
  });

  const hasError = invalid || !!error;
  const displayError = error;

  return (
    <Box marginBottom="md">
      {label && (
        <Text variant="bodySmall" color="textSecondary" marginBottom="xs">
          {label}
        </Text>
      )}
      <Box
        borderWidth={1}
        borderColor={hasError ? 'borderError' : 'border'}
        borderRadius="md"
        paddingHorizontal="md"
        paddingVertical="sm"
        backgroundColor="surface"
      >
        <TextInput
          value={value as string}
          onChangeText={onChange}
          onBlur={onBlur}
          placeholderTextColor="#9E9E9E"
          style={{
            fontSize: 16,
            color: '#212121',
            padding: 0,
          }}
          {...inputProps}
        />
      </Box>
      {(displayError || helperText) && (
        <Box marginTop="xs">
          <Text
            variant="caption"
            color={hasError ? 'error' : 'textTertiary'}
          >
            {displayError || helperText}
          </Text>
        </Box>
      )}
    </Box>
  );
}

