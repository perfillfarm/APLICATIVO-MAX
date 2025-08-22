import React from 'react';
import { Tabs } from 'expo-router';
import { House, ShoppingCart, TrendingUp, User, Settings } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { AnimatedTabIcon } from '@/components/navigation/AnimatedTabIcon';

export default function TabLayout() {
  const { theme } = useTheme();
  const { t } = useLanguage();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopWidth: 1,
          borderTopColor: theme.colors.border,
          height: 60,
          paddingBottom: 10,
          paddingTop: 10,
          paddingHorizontal: 10,
          shadowColor: theme.colors.shadow,
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: theme.isDark ? 0.3 : 0.1,
          shadowRadius: 8,
          elevation: 8,
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarShowLabel: false,
        tabBarItemStyle: {
          borderRadius: 12,
          marginHorizontal: 2,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused, size, color }) => (
            <AnimatedTabIcon icon={House} focused={focused} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="shop"
        options={{
          tabBarIcon: ({ focused, size, color }) => (
            <AnimatedTabIcon icon={ShoppingCart} focused={focused} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          tabBarIcon: ({ focused, size, color }) => (
            <AnimatedTabIcon icon={TrendingUp} focused={focused} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused, size, color }) => (
            <AnimatedTabIcon icon={User} focused={focused} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          tabBarIcon: ({ focused, size, color }) => (
            <AnimatedTabIcon icon={Settings} focused={focused} size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}