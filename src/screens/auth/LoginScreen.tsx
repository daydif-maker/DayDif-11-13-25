import React, { useState } from 'react';
import {
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Screen, Stack, Text, Button } from '@ui';
import { Box } from '@ui/primitives';
import { useTheme } from '@designSystem/ThemeProvider';
import { useAuthStore } from '@store';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CreatePlanStackParamList } from '@navigation/types';

type LoginScreenNavigationProp = NativeStackNavigationProp<
  CreatePlanStackParamList,
  'Login'
>;

export const LoginScreen: React.FC = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { signIn, signUp, isLoading, error, setError } = useAuthStore();

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const isFormValid = email.trim().length > 0 && password.length >= 6;

  const handleSubmit = async () => {
    if (!isFormValid) return;

    try {
      setError(null);
      if (isSignUp) {
        await signUp(email.trim(), password, displayName.trim() || undefined);
      } else {
        await signIn(email.trim(), password);
      }
      // Navigate to CreatePlan after successful auth
      navigation.replace('CreatePlan');
    } catch (err) {
      // Error is already set by the store
      console.error('Auth error:', err);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setError(null);
  };

  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <Stack
          gap="xl"
          paddingHorizontal="lg"
          paddingTop="xxl"
          style={{ paddingBottom: insets.bottom + 24 }}
        >
          {/* Header */}
          <Stack gap="sm" alignItems="center">
            <Box
              width={64}
              height={64}
              borderRadius="full"
              backgroundColor="primary"
              alignItems="center"
              justifyContent="center"
              marginBottom="md"
            >
              <Ionicons name="person" size={32} color="#FFFFFF" />
            </Box>
            <Text variant="heading2" textAlign="center" fontWeight="700">
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </Text>
            <Text variant="body" color="textSecondary" textAlign="center">
              {isSignUp
                ? 'Sign up to start your learning journey'
                : 'Sign in to continue your learning'}
            </Text>
          </Stack>

          {/* Error Message */}
          {error && (
            <Box
              backgroundColor="errorBackground"
              padding="md"
              borderRadius="lg"
            >
              <Text variant="bodySmall" color="error" textAlign="center">
                {error}
              </Text>
            </Box>
          )}

          {/* Form */}
          <Stack gap="md">
            {isSignUp && (
              <Stack gap="xs">
                <Text variant="bodySmall" color="textSecondary" fontWeight="500">
                  Display Name (optional)
                </Text>
                <Box
                  borderWidth={1}
                  borderColor="border"
                  borderRadius="lg"
                  paddingHorizontal="md"
                  paddingVertical="sm"
                  backgroundColor="surface"
                >
                  <TextInput
                    value={displayName}
                    onChangeText={setDisplayName}
                    placeholder="Your name"
                    placeholderTextColor={theme.colors.textTertiary}
                    autoCapitalize="words"
                    style={[styles.input, { color: theme.colors.textPrimary }]}
                  />
                </Box>
              </Stack>
            )}

            <Stack gap="xs">
              <Text variant="bodySmall" color="textSecondary" fontWeight="500">
                Email
              </Text>
              <Box
                borderWidth={1}
                borderColor="border"
                borderRadius="lg"
                paddingHorizontal="md"
                paddingVertical="sm"
                backgroundColor="surface"
              >
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="your@email.com"
                  placeholderTextColor={theme.colors.textTertiary}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={[styles.input, { color: theme.colors.textPrimary }]}
                />
              </Box>
            </Stack>

            <Stack gap="xs">
              <Text variant="bodySmall" color="textSecondary" fontWeight="500">
                Password
              </Text>
              <Box
                borderWidth={1}
                borderColor="border"
                borderRadius="lg"
                paddingHorizontal="md"
                paddingVertical="sm"
                backgroundColor="surface"
                flexDirection="row"
                alignItems="center"
              >
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Min 6 characters"
                  placeholderTextColor={theme.colors.textTertiary}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={[
                    styles.input,
                    styles.passwordInput,
                    { color: theme.colors.textPrimary },
                  ]}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off' : 'eye'}
                    size={20}
                    color={theme.colors.textTertiary}
                  />
                </TouchableOpacity>
              </Box>
            </Stack>
          </Stack>

          {/* Submit Button */}
          <Button
            variant="primary"
            onPress={handleSubmit}
            disabled={!isFormValid || isLoading}
            backgroundColor={!isFormValid || isLoading ? 'border' : 'black'}
            borderRadius="full"
            minHeight={54}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : isSignUp ? (
              'Create Account'
            ) : (
              'Sign In'
            )}
          </Button>

          {/* Toggle Mode */}
          <TouchableOpacity onPress={toggleMode} style={styles.toggleButton}>
            <Text variant="body" color="textSecondary" textAlign="center">
              {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
              <Text variant="body" color="primary" fontWeight="600">
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </Text>
            </Text>
          </TouchableOpacity>
        </Stack>
      </KeyboardAvoidingView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  input: {
    fontSize: 16,
    paddingVertical: 8,
  },
  passwordInput: {
    flex: 1,
  },
  toggleButton: {
    paddingVertical: 8,
  },
});

