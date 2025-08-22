import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  BounceIn 
} from 'react-native-reanimated';

interface QuickDropsSelectorProps {
  selectedValue: string;
  onSelect: (value: string) => void;
  options?: number[];
}

export const QuickDropsSelector: React.FC<QuickDropsSelectorProps> = ({
  selectedValue,
  onSelect,
  options = [1, 2, 3],
}) => {
  const { theme } = useTheme();
  const { t } = useLanguage();

  const QuickButton: React.FC<{ amount: number }> = ({ amount }) => {
    const scale = useSharedValue(1);

    const handlePress = () => {
      scale.value = withSpring(0.9, { duration: 100 }, () => {
        scale.value = withSpring(1, { duration: 200 });
      });
      onSelect(amount.toString());
    };

    const animatedStyle = useAnimatedStyle(() => {
      return {
        transform: [{ scale: scale.value }],
      };
    });

    const isSelected = selectedValue === amount.toString();

    return (
      <Animated.View style={animatedStyle}>
        <TouchableOpacity
          style={[
            styles.quickButton,
            {
              backgroundColor: isSelected ? theme.colors.primary : theme.colors.card,
              borderColor: isSelected ? theme.colors.primary : theme.colors.border,
            },
          ]}
          onPress={handlePress}
        >
          <Text
            style={[
              styles.quickButtonText,
              {
                color: isSelected ? '#ffffff' : theme.colors.primary,
              },
            ]}
          >
            {amount}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
        {t('quickAccessCapsules')}
      </Text>
      <Animated.View entering={BounceIn.delay(800)} style={styles.buttonsRow}>
        {options.map((amount) => (
          <QuickButton key={amount} amount={amount} />
        ))}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    marginBottom: 16,
    fontWeight: '500',
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: 16,
    justifyContent: 'space-between',
  },
  quickButton: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  quickButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});