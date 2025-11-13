import React from 'react';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { TouchableOpacity } from 'react-native';
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

  return (
    <Box
      position="absolute"
      bottom={0}
      left={0}
      right={0}
      backgroundColor="navBackground"
      borderTopWidth={1}
      borderTopColor="border"
    >
      {/* Subtle separator line */}
      <Box
        height={1}
        backgroundColor="white"
        opacity={0.1}
      />
      
      <Box
        flexDirection="row"
        paddingVertical="md"
        paddingHorizontal="lg"
        justifyContent="space-around"
        alignItems="center"
        paddingBottom="lg"
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

          const textColor = isFocused ? 'navActive' : 'navInactive';

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              onLongPress={onLongPress}
            >
              <Box flex={1} alignItems="center" justifyContent="center">
                {getTabIcon(route.name, isFocused, theme.colors.navActive, theme.colors.navInactive)}
                <Text
                  variant="caption"
                  color={textColor}
                  marginTop="xs"
                >
                  {options.title || route.name}
                </Text>
                {/* Green underline for active tab */}
                {isFocused && (
                  <Box
                    position="absolute"
                    bottom={-8}
                    width={24}
                    height={2}
                    backgroundColor="navActive"
                    borderRadius="sm"
                  />
                )}
              </Box>
            </TouchableOpacity>
          );
        })}
      </Box>
    </Box>
  );
};

