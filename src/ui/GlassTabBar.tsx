import React from 'react';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@designSystem/ThemeProvider';
import { Text } from './Text';
import * as Haptics from 'expo-haptics';
import { Box } from '@ui/primitives';
import { Ionicons } from '@expo/vector-icons';

// Icon mapping for tabs
const getTabIcon = (routeName: string, isFocused: boolean, activeColor: string, inactiveColor: string) => {
  const iconSize = 24;
  const iconColor = isFocused ? activeColor : inactiveColor;
  
  switch (routeName) {
    case 'TodayTab':
      return <Ionicons name={isFocused ? 'home' : 'home-outline'} size={iconSize} color={iconColor} />;
    case 'PlansTab':
      return <Ionicons name={isFocused ? 'calendar' : 'calendar-outline'} size={iconSize} color={iconColor} />;
    default:
      return <Ionicons name="ellipse-outline" size={iconSize} color={iconColor} />;
  }
};

export const GlassTabBar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  // Cal AI-inspired pill-shaped tab bar
  const tabContent = (
    <Box
      flexDirection="row"
      paddingVertical="md"
      paddingHorizontal="lg"
      justifyContent="space-around"
      alignItems="center"
      minHeight={60}
    >
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        // Active: dark gray/black, Inactive: light gray
        const iconColor = isFocused ? theme.colors.textPrimary : theme.colors.textTertiary;
        const textColor = isFocused ? 'textPrimary' : 'textTertiary';

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            style={{ flex: 1 }}
          >
            <Box alignItems="center" justifyContent="center" position="relative">
              {getTabIcon(route.name, isFocused, iconColor, iconColor)}
              <Text
                variant="caption"
                color={textColor}
                marginTop="xs"
              >
                {options.title || route.name}
              </Text>
              {/* Thin horizontal line indicator for active tab */}
              {isFocused && (
                <Box
                  position="absolute"
                  bottom={-2}
                  width={20}
                  height={1.5}
                  backgroundColor="textPrimary"
                  borderRadius="sm"
                />
              )}
            </Box>
          </TouchableOpacity>
        );
      })}
    </Box>
  );

  return (
    <View
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        alignItems: 'center',
        paddingBottom: Math.max(insets.bottom, theme.spacing.sm),
        paddingHorizontal: theme.spacing.md,
      }}
      pointerEvents="box-none"
    >
      <View
        style={[
          styles.pillContainer,
          {
            backgroundColor: theme.colors.white,
            shadowColor: theme.shadows.md.shadowColor,
            shadowOffset: theme.shadows.md.shadowOffset,
            shadowOpacity: theme.shadows.md.shadowOpacity,
            shadowRadius: theme.shadows.md.shadowRadius,
            elevation: theme.shadows.md.elevation,
          },
        ]}
      >
        {tabContent}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  pillContainer: {
    borderRadius: 9999, // Full pill shape
    minWidth: 260,
    maxWidth: '100%',
  },
});

