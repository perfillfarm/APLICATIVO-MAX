import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: number;
  margin?: number;
  elevation?: number;
  delay?: number;
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  padding = 20,
  margin = 0,
  elevation = 4,
  delay = 0,
}) => {
  const { theme } = useTheme();

  return (
    <Animated.View
      entering={delay > 0 ? FadeInDown.delay(delay) : undefined}
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.card,
          padding,
          margin,
          shadowOpacity: elevation * 0.02,
          elevation,
        },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
  },
});