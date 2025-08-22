import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  icon,
  style,
  textStyle,
}) => {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const handlePress = () => {
    scale.value = withSpring(0.95, { duration: 100 }, () => {
      scale.value = withSpring(1, { duration: 200 });
    });
    onPress();
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const getButtonStyle = () => {
    const baseStyle = [styles.button, styles[size]];
    
    switch (variant) {
      case 'primary':
        return [...baseStyle, { backgroundColor: theme.colors.primary }];
      case 'secondary':
        return [...baseStyle, { backgroundColor: theme.colors.secondary }];
      case 'outline':
        return [...baseStyle, { 
          backgroundColor: 'transparent', 
          borderWidth: 2, 
          borderColor: theme.colors.primary 
        }];
      case 'danger':
        return [...baseStyle, { backgroundColor: theme.colors.error }];
      default:
        return [...baseStyle, { backgroundColor: theme.colors.primary }];
    }
  };

  const getTextStyle = () => {
    const baseTextStyle = [styles.text, styles[`${size}Text`]];
    
    if (variant === 'outline') {
      return [...baseTextStyle, { color: theme.colors.primary }];
    }
    
    return [...baseTextStyle, { color: '#ffffff' }];
  };

  return (
    <Animated.View style={[animatedStyle, style]}>
      <TouchableOpacity
        style={[
          ...getButtonStyle(),
          disabled && { backgroundColor: theme.colors.textSecondary, opacity: 0.6 },
          style
        ]}
        onPress={handlePress}
        disabled={disabled}
        activeOpacity={0.8}
      >
        {icon}
        <Text style={[...getTextStyle(), textStyle, icon && { marginLeft: 8 }]}>
          {title}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  small: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  medium: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  large: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  text: {
    fontWeight: '600',
  },
  smallText: {
    fontSize: 12,
  },
  mediumText: {
    fontSize: 14,
  },
  largeText: {
    fontSize: 16,
  },
});