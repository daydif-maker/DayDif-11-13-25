import React, { useEffect } from 'react';
import { ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BoxProps } from '@shopify/restyle';
import { Theme } from '@designSystem/theme';
import { Text } from '../Text';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@designSystem/ThemeProvider';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  Easing,
} from 'react-native-reanimated';

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

  // Animation values for staggered entrance
  const headerRowScale = useSharedValue(0.8);
  const headerRowOpacity = useSharedValue(0);
  const titleScale = useSharedValue(0.9);
  const titleOpacity = useSharedValue(0);
  const contentScale = useSharedValue(0.9);
  const contentOpacity = useSharedValue(0);

  useEffect(() => {
    // Top buttons (header row) pop in first
    headerRowScale.value = withSpring(1, {
      damping: 12,
      stiffness: 200,
    });
    headerRowOpacity.value = withTiming(1, {
      duration: 150,
      easing: Easing.out(Easing.ease),
    });

    // Title follows quickly
    setTimeout(() => {
      titleScale.value = withSpring(1, {
        damping: 12,
        stiffness: 200,
      });
      titleOpacity.value = withTiming(1, {
        duration: 150,
        easing: Easing.out(Easing.ease),
      });
    }, 50);

    // Content pops in quickly after
    setTimeout(() => {
      contentScale.value = withSpring(1, {
        damping: 12,
        stiffness: 200,
      });
      contentOpacity.value = withTiming(1, {
        duration: 150,
        easing: Easing.out(Easing.ease),
      });
    }, 100);
  }, [currentStep]);

  const headerRowAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: headerRowScale.value }],
    opacity: headerRowOpacity.value,
  }));

  const titleAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: titleScale.value }],
    opacity: titleOpacity.value,
  }));

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: contentScale.value }],
    opacity: contentOpacity.value,
  }));

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  const content = (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header with progress bar */}
      <View style={[styles.header, { paddingHorizontal: theme.spacing.lg }]}>
        <Animated.View style={[styles.headerRow, headerRowAnimatedStyle]}>
          {/* Back button */}
          {showBackButton ? (
            <TouchableOpacity
              onPress={handleBack}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
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
                    backgroundColor: theme.colors.border,
                    height: 3,
                  },
                ]}
              >
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${progress}%`,
                    backgroundColor: theme.colors.black,
                    height: 3,
                  },
                ]}
              />
            </View>
          </View>
          
          {/* Language selector placeholder */}
          {showLanguageSelector ? (
            <TouchableOpacity style={styles.languageButton}>
              <Text variant="body" fontSize={20}>
                🇺🇸
              </Text>
              <Text variant="body" color="textPrimary" fontWeight="600">
                EN
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.placeholder} />
          )}
        </Animated.View>
        
        {/* Title and subtitle */}
        <Animated.View style={[styles.titleContainer, titleAnimatedStyle]}>
          <Text variant="heading1" marginBottom={subtitle ? 'sm' : 'xl'} fontSize={32} lineHeight={40}>
            {title}
          </Text>
          {subtitle && (
            <Text variant="body" color="textSecondary" marginBottom="xl" fontSize={16}>
              {subtitle}
            </Text>
          )}
        </Animated.View>
      </View>

      {/* Scrollable content */}
      <Animated.View style={[styles.scrollViewContainer, contentAnimatedStyle]}>
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
      </Animated.View>

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
            fontSize={18}
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
    marginBottom: 24,
    gap: 12,
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholder: {
    width: 64,
  },
  progressContainer: {
    flex: 1,
    height: 4,
    justifyContent: 'center',
  },
  progressBarBackground: {
    width: '100%',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    borderRadius: 4,
  },
  languageButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'transparent',
  },
  titleContainer: {
    marginTop: 16,
  },
  scrollViewContainer: {
    flex: 1,
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
    paddingVertical: 18,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
});

