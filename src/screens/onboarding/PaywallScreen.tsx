import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { OnboardingLayout } from '@ui/layout/OnboardingLayout';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '@navigation/types';
import { Card } from '@ui/Card';
import { Text } from '@ui/Text';
import { useTheme } from '@designSystem/ThemeProvider';
import { Ionicons } from '@expo/vector-icons';

type PaywallScreenNavigationProp = NativeStackNavigationProp<
  OnboardingStackParamList,
  'Paywall'
>;

const BENEFITS = [
  'Unlimited daily lessons',
  'Personalized learning paths',
  'Progress tracking and streaks',
  'New content added weekly',
];

type PricingOption = 'yearly' | 'monthly';

export const PaywallScreen: React.FC = () => {
  const navigation = useNavigation<PaywallScreenNavigationProp>();
  const { theme } = useTheme();
  const [selectedOption, setSelectedOption] = useState<PricingOption>('yearly');

  const handleContinue = () => {
    navigation.navigate('Success');
  };

  const handleRestore = () => {
    // TODO: Implement restore purchases
  };

  const handleSkip = () => {
    navigation.navigate('Success');
  };

  return (
    <OnboardingLayout
      currentStep={14}
      totalSteps={17}
      title="Start your learning journey"
      subtitle="Unlock everything DayDif has to offer."
      onContinue={handleContinue}
      ctaLabel="Start Free Trial"
      showBackButton={false}
    >
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Benefits List */}
        <Card variant="outlined" padding="lg" style={styles.benefitsCard}>
          {BENEFITS.map((benefit, index) => (
            <View key={index} style={styles.benefitItem}>
              <Ionicons 
                name="checkmark-circle" 
                size={20} 
                color={theme.colors.success || '#00A86B'} 
              />
              <Text variant="body" color="textPrimary">
                {benefit}
              </Text>
            </View>
          ))}
        </Card>

        {/* Social Proof */}
        <Text variant="body" color="textSecondary" style={styles.socialProof}>
          Join 100,000+ people learning on their commute
        </Text>

        {/* Pricing Options */}
        <View style={styles.pricingContainer}>
          {/* Yearly Option */}
          <TouchableOpacity
            onPress={() => setSelectedOption('yearly')}
            style={[
              styles.pricingOption,
              {
                borderColor: selectedOption === 'yearly' ? theme.colors.primary : theme.colors.border,
                borderWidth: selectedOption === 'yearly' ? 2 : 1,
                backgroundColor: selectedOption === 'yearly' ? `${theme.colors.primary}10` : theme.colors.surface,
              },
            ]}
          >
            <View style={styles.pricingBadge}>
              <Text variant="bodySmall" style={styles.badgeText}>
                Best Value
              </Text>
            </View>
            <Text variant="heading4" color="textPrimary">
              Yearly
            </Text>
            <Text variant="heading3" color="textPrimary">
              $39.99/year
            </Text>
            <Text variant="bodySmall" color="textSecondary">
              $3.33/mo
            </Text>
          </TouchableOpacity>

          {/* Monthly Option */}
          <TouchableOpacity
            onPress={() => setSelectedOption('monthly')}
            style={[
              styles.pricingOption,
              {
                borderColor: selectedOption === 'monthly' ? theme.colors.primary : theme.colors.border,
                borderWidth: selectedOption === 'monthly' ? 2 : 1,
                backgroundColor: selectedOption === 'monthly' ? `${theme.colors.primary}10` : theme.colors.surface,
              },
            ]}
          >
            <Text variant="heading4" color="textPrimary">
              Monthly
            </Text>
            <Text variant="heading3" color="textPrimary">
              $9.99/month
            </Text>
          </TouchableOpacity>
        </View>

        {/* Trial Callouts */}
        <View style={styles.trialCallouts}>
          <View style={styles.calloutItem}>
            <Ionicons name="checkmark" size={16} color={theme.colors.success || '#00A86B'} />
            <Text variant="bodySmall" color="textPrimary">
              7-day free trial
            </Text>
          </View>
          <View style={styles.calloutItem}>
            <Ionicons name="checkmark" size={16} color={theme.colors.success || '#00A86B'} />
            <Text variant="bodySmall" color="textPrimary">
              Cancel anytime
            </Text>
          </View>
          <View style={styles.calloutItem}>
            <Ionicons name="checkmark" size={16} color={theme.colors.success || '#00A86B'} />
            <Text variant="bodySmall" color="textPrimary">
              No payment due now
            </Text>
          </View>
        </View>

        {/* Fine Print */}
        <Text variant="bodySmall" color="textSecondary" style={styles.finePrint}>
          After your trial, you'll be charged {selectedOption === 'yearly' ? '$39.99/year' : '$9.99/month'}. Cancel anytime in Settings.
        </Text>

        {/* Restore & Skip */}
        <View style={styles.linksContainer}>
          <TouchableOpacity onPress={handleRestore}>
            <Text variant="bodySmall" color="textSecondary">
              Restore
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleSkip}>
            <Text variant="bodySmall" color="textSecondary">
              Maybe later
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </OnboardingLayout>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 8,
    paddingBottom: 16,
  },
  benefitsCard: {
    width: '100%',
    marginBottom: 16,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 12,
  },
  socialProof: {
    textAlign: 'center',
    marginBottom: 24,
  },
  pricingContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  pricingOption: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    gap: 4,
  },
  pricingBadge: {
    backgroundColor: '#00A86B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  badgeText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 11,
  },
  trialCallouts: {
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  calloutItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  finePrint: {
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 18,
  },
  linksContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 32,
  },
});
