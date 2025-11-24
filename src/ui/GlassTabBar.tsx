import React from 'react';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@designSystem/ThemeProvider';
import { Text } from './Text';
import * as Haptics from 'expo-haptics';
import { Box } from '@ui/primitives';
import { Ionicons } from '@expo/vector-icons';

// Icon mapping for tabs - Minimalist style
const getTabIcon = (routeName: string, isFocused: boolean, color: string) => {
  const iconSize = 26; // Standard refined size - increased for better visibility
  
  switch (routeName) {
    case 'TodayTab':
      // Cal AI uses filled for active, outline for inactive
      return <Ionicons name={isFocused ? 'home' : 'home-outline'} size={iconSize} color={color} />;
    case 'PlansTab':
      return <Ionicons name={isFocused ? 'calendar' : 'calendar-outline'} size={iconSize} color={color} />;
    default:
      return <Ionicons name="ellipse-outline" size={iconSize} color={color} />;
  }
};

export const GlassTabBar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Box
      position="absolute"
      bottom={0}
      left={0}
      right={0}
      backgroundColor="navBackground"
      style={[
        theme.shadows.none,
        { paddingBottom: insets.bottom }
      ]}
    >
      <Box
        flexDirection="row"
        height={60} // Fixed height
        alignItems="center"
        justifyContent="space-around"
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

          // Active: Black (primary), Inactive: Gray (tertiary)
          const color = isFocused ? theme.colors.navActive : theme.colors.navInactive;

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
              activeOpacity={0.7}
            >
              <Box alignItems="center" justifyContent="center">
                {getTabIcon(route.name, isFocused, color)}
                <Text
                  variant="caption"
                  style={{ 
                    color: color,
                    marginTop: 4,
                    fontSize: 10,
                    fontWeight: isFocused ? '600' : '400' 
                  }}
                >
                  {options.title || route.name}
                </Text>
              </Box>
            </TouchableOpacity>
          );
        })}
      </Box>
    </Box>
  );
};
