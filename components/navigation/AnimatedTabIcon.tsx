import React from 'react';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

interface AnimatedTabIconProps {
  icon: React.ComponentType<any>;
  focused: boolean;
  size: number;
  color: string;
}

export const AnimatedTabIcon: React.FC<AnimatedTabIconProps> = ({ 
  icon: Icon, 
  focused, 
  size, 
  color 
}) => {
  const scale = useSharedValue(1);
  
  React.useEffect(() => {
    scale.value = withSpring(focused ? 1.2 : 1, {
      damping: 15,
      stiffness: 200,
    });
  }, [focused]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  return (
    <Animated.View style={animatedStyle}>
      <Icon size={size} color={color} strokeWidth={focused ? 2.5 : 2} />
    </Animated.View>
  );
};