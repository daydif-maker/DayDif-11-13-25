import React from 'react';
import { ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BoxProps } from '@shopify/restyle';
import { Theme } from '@designSystem/theme';
import { Text } from '../Text';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@designSystem/ThemeProvider';

type OnboardingLayoutProps = BoxProps<Theme> & {
  // Progress tracking
  currentStep: number;
  totalSteps: number;
  
  // Header content
  title: string;
  subtitle?: string;
  
  // Body content
  children: React.ReactNode;
  
  // Footer CTA
  ctaLabel?: string;
  onContinue: () => void;
  ctaDisabled?: boolean;
  
  // Optional overrides
  showBackButton?: boolean;
  showLanguageSelector?: boolean;
  keyboardAvoiding?: boolean;
};

export const OnboardingLayout: React.FC<OnboardingLayoutProps> = ({
  currentStep,
  totalSteps,
  title,
  subtitle,
  children,
  ctaLabel = 'Continue',
  onContinue,
  ctaDisabled = false,
  showBackButton = true,
  showLanguageSelector = false,
  keyboardAvoiding = false,
}) => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const progress = (currentStep / totalSteps) * 100;

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  const content = (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header with progress bar */}
      <View style={[styles.header, { paddingHorizontal: theme.spacing.lg }]}>
        <View style={styles.headerRow}>
          {/* Back button */}
          {showBackButton ? (
            <TouchableOpacity
              onPress={handleBack}
              style={[
                styles.backButton,
                { backgroundColor: theme.colors.backgroundSecondary },
              ]}
            >
              <Ionicons name="chevron-back" size={20} color={theme.colors.textPrimary} />
            </TouchableOpacity>
          ) : (
            <View style={styles.placeholder} />
          )}
          
          {/* Progress bar */}
          <View style={styles.progressContainer}>
            <View
              style={[
                styles.progressBarBackground,
                {
                  backgroundColor: theme.colors.backgroundSecondary,
                  height: 4,
                },
              ]}
            >
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${progress}%`,
                    backgroundColor: theme.colors.primary,
                    height: 4,
                  },
                ]}
              />
            </View>
          </View>
          
          {/* Language selector placeholder */}
          {showLanguageSelector ? (
            <TouchableOpacity
              style={[
                styles.languageButton,
                { backgroundColor: theme.colors.backgroundSecondary },
              ]}
            >
              <Text variant="caption" color="textPrimary">
                EN
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.placeholder} />
          )}
        </View>
        
        {/* Title and subtitle */}
        <View style={styles.titleContainer}>
          <Text variant="heading1" marginBottom={subtitle ? 'xs' : 'xl'}>
            {title}
          </Text>
          {subtitle && (
            <Text variant="body" color="textSecondary" marginBottom="xl">
              {subtitle}
            </Text>
          )}
        </View>
      </View>

      {/* Scrollable content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingHorizontal: theme.spacing.lg },
        ]}
      >
        {children}
      </ScrollView>

      {/* Fixed footer with CTA */}
      <View
        style={[
          styles.footer,
          {
            paddingHorizontal: theme.spacing.lg,
            paddingTop: theme.spacing.md,
            paddingBottom: theme.spacing.lg,
            borderTopWidth: 1,
            borderTopColor: theme.colors.border,
            backgroundColor: theme.colors.background,
          },
        ]}
      >
        <TouchableOpacity
          onPress={onContinue}
          disabled={ctaDisabled}
          activeOpacity={0.7}
          style={[
            styles.ctaButton,
            {
              backgroundColor: ctaDisabled ? theme.colors.border : theme.colors.black,
              opacity: ctaDisabled ? 0.5 : 1,
            },
          ]}
        >
          <Text
            variant="body"
            color="textInverse"
            fontWeight="600"
          >
            {ctaLabel}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (keyboardAvoiding) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          {content}
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      {content}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  container: {
    flex: 1,
    flexDirection: 'column',
  },
  header: {
    paddingTop: 16,
    paddingBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholder: {
    width: 32,
  },
  progressContainer: {
    flex: 1,
    marginHorizontal: 16,
    height: 4,
    justifyContent: 'center',
  },
  progressBarBackground: {
    width: '100%',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    borderRadius: 2,
  },
  languageButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  titleContainer: {
    marginTop: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 16,
  },
  footer: {
    width: '100%',
  },
  ctaButton: {
    paddingVertical: 16,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
});

