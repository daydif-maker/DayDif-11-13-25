import React from 'react';
import { View, StyleSheet } from 'react-native';
import { OnboardingLayout } from '@ui/layout/OnboardingLayout';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '@navigation/types';
import { Card } from '@ui/Card';
import { Text } from '@ui/Text';
import { useTheme } from '@designSystem/ThemeProvider';
import { Ionicons } from '@expo/vector-icons';

type SocialProofScreenNavigationProp = NativeStackNavigationProp<
  OnboardingStackParamList,
  'SocialProof'
>;

export const SocialProofScreen: React.FC = () => {
  const navigation = useNavigation<SocialProofScreenNavigationProp>();
  const { theme } = useTheme();

  const handleContinue = () => {
    navigation.navigate('AllSet');
  };

  return (
    <OnboardingLayout
      currentStep={10}
      totalSteps={17}
      title="DayDif was made for people like you"
      onContinue={handleContinue}
      showBackButton={true}
    >
      <View style={styles.content}>
        {/* Rating Badge */}
        <Card variant="outlined" padding="lg" style={styles.ratingCard}>
          <View style={styles.ratingContainer}>
            <Text variant="heading2" color="textPrimary" style={styles.ratingNumber}>
              4.8
            </Text>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Ionicons
                  key={star}
                  name="star"
                  size={20}
                  color="#FFB800"
                />
              ))}
            </View>
            <Text variant="body" color="textSecondary">
              50,000+ Ratings
            </Text>
          </View>
        </Card>

        {/* Community Section */}
        <Card variant="outlined" padding="lg" style={styles.communityCard}>
          <View style={styles.avatarsContainer}>
            {[1, 2, 3].map((i) => (
              <View
                key={i}
                style={[
                  styles.avatar,
                  {
                    backgroundColor: i === 1 ? '#E8D5B7' : i === 2 ? '#C4A77D' : '#8B7355',
                    marginLeft: i > 1 ? -16 : 0,
                    zIndex: 4 - i,
                  },
                ]}
              />
            ))}
          </View>
          <Text variant="body" color="textSecondary" style={styles.communityText}>
            100,000+ learners
          </Text>
        </Card>

        {/* Testimonial */}
        <Card variant="outlined" padding="lg" style={styles.testimonialCard}>
          <View style={styles.testimonialHeader}>
            <Text variant="body" color="textPrimary" fontWeight="600">
              Sarah M.
            </Text>
            <View style={styles.starsRowSmall}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Ionicons
                  key={star}
                  name="star"
                  size={14}
                  color="#FFB800"
                />
              ))}
            </View>
          </View>
          <Text variant="body" color="textPrimary" style={styles.testimonialQuote}>
            "I've learned more in two months of commuting than I did in a year of trying to read before bed. This app actually fits my life."
          </Text>
        </Card>
      </View>
    </OnboardingLayout>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    gap: 16,
    paddingTop: 8,
  },
  ratingCard: {
    width: '100%',
  },
  ratingContainer: {
    alignItems: 'center',
    gap: 8,
  },
  ratingNumber: {
    fontSize: 48,
    fontWeight: '700',
  },
  starsRow: {
    flexDirection: 'row',
    gap: 4,
  },
  communityCard: {
    width: '100%',
  },
  avatarsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  communityText: {
    textAlign: 'center',
  },
  testimonialCard: {
    width: '100%',
  },
  testimonialHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  starsRowSmall: {
    flexDirection: 'row',
    gap: 2,
  },
  testimonialQuote: {
    fontStyle: 'italic',
    lineHeight: 24,
  },
});
