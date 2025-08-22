import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Card } from './Card';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface StatCardProps {
  icon: React.ComponentType<any>;
  title: string;
  value: string | number;
  subtitle?: string;
  color: string;
  delay?: number;
}

export const StatCard: React.FC<StatCardProps> = ({
  icon: Icon,
  title,
  value,
  subtitle,
  color,
  delay = 0,
}) => {
  const { theme } = useTheme();

  return (
    <Animated.View entering={FadeInDown.delay(delay).springify()}>
      <Card
        style={[styles.container, { borderLeftColor: color }]}
        padding={20}
        margin={6}
      >
        <View style={styles.header}>
          <Icon size={24} color={color} />
          <Text style={[styles.title, { color: theme.colors.textSecondary }]}>
            {title}
          </Text>
        </View>
        <Text style={[styles.value, { color: theme.colors.text }]}>
          {value}
        </Text>
        {subtitle && (
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            {subtitle}
          </Text>
        )}
      </Card>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderLeftWidth: 4,
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 13,
    fontWeight: '500',
    marginLeft: 8,
    flex: 1,
  },
  value: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 11,
    lineHeight: 16,
  },
});