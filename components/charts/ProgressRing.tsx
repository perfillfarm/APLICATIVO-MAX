import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  interpolate
} from 'react-native-reanimated';

interface ProgressRingProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  label?: string;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  progress,
  size = 120,
  strokeWidth = 8,
  color,
  label = 'Conclusão',
}) => {
  const { theme } = useTheme();
  const progressValue = useSharedValue(0);
  const ringColor = color || theme.colors.primary;

  React.useEffect(() => {
    progressValue.value = withSpring(progress / 100, {
      damping: 15,
      stiffness: 100,
    });
  }, [progress]);

  const progressAnimatedStyle = useAnimatedStyle(() => {
    return {
      width: `${interpolate(progressValue.value, [0, 1], [0, 100])}%`,
    };
  });

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <View style={styles.progressBackground}>
        <View
          style={[
            styles.progressBackgroundCircle,
            {
              width: size - strokeWidth,
              height: size - strokeWidth,
              borderRadius: (size - strokeWidth) / 2,
              borderWidth: strokeWidth,
              borderColor: theme.colors.border,
            },
          ]}
        />
      </View>
      <Animated.View
        style={[
          styles.progressForeground,
          progressAnimatedStyle,
          {
            width: size,
            height: strokeWidth,
            backgroundColor: ringColor,
            borderRadius: strokeWidth / 2,
            position: 'absolute',
            top: strokeWidth / 2,
          },
        ]}
      />
      <View style={styles.progressText}>
        <Text style={[styles.progressValue, { color: theme.colors.text }]}>
          {Math.round(progress)}%
        </Text>
        <Text style={[styles.progressLabel, { color: theme.colors.textSecondary }]}>
          {label}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  progressBackground: {
    position: 'absolute',
  },
  progressBackgroundCircle: {
    position: 'absolute',
  },
  progressForeground: {
    position: 'absolute',
  },
  progressText: {
    position: 'absolute',
    alignItems: 'center',
  },
  progressValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  progressLabel: {
    fontSize: 12,
    marginTop: 2,
  },
});