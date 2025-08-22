import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { CircleCheck as CheckCircle, MapPin } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withDelay,
  runOnJS
} from 'react-native-reanimated';

interface PurchaseData {
  id: string;
  customerName: string;
  location: string;
  product: string;
  timeAgo: string;
  avatar: string;
}

interface PurchaseNotificationProps {
  visible: boolean;
  data: PurchaseData;
  onHide: () => void;
}

export const PurchaseNotification: React.FC<PurchaseNotificationProps> = ({
  visible,
  data,
  onHide,
}) => {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const translateY = useSharedValue(100);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      // Show animation
      translateY.value = withSpring(0, { damping: 20, stiffness: 150 });
      opacity.value = withSpring(1, { damping: 15, stiffness: 100 });

      // Auto hide after 4 seconds
      const timer = setTimeout(() => {
        hideNotification();
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  const hideNotification = () => {
    translateY.value = withSpring(-100, { damping: 20, stiffness: 150 });
    opacity.value = withSpring(0, { damping: 15, stiffness: 100 }, () => {
      runOnJS(onHide)();
    });
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
      opacity: opacity.value,
    };
  });

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.card,
          borderColor: theme.colors.success + '40',
        },
        animatedStyle,
      ]}
      pointerEvents="none"
    >
      {/* Success Icon */}
      <View style={[styles.iconContainer, { backgroundColor: theme.colors.success + '20' }]}>
        <CheckCircle size={16} color={theme.colors.success} />
      </View>

      {/* Customer Avatar */}
      <View style={styles.avatarContainer}>
        <View style={[styles.avatar, { backgroundColor: theme.colors.primary + '20' }]}>
          <Text style={[styles.avatarText, { color: theme.colors.primary }]}>
            {data.customerName.charAt(0).toUpperCase()}
          </Text>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={[styles.customerName, { color: theme.colors.text }]}>
          {data.customerName}
        </Text>
        <Text style={[styles.productText, { color: theme.colors.primary }]}>
          {t('purchased')} {data.product}
        </Text>
        <Text style={[styles.timeText, { color: theme.colors.textSecondary }]}>
          {data.timeAgo}
        </Text>
      </View>

      {/* Pulse Animation */}
      <View style={[styles.pulseContainer]}>
        <View style={[styles.pulse, { backgroundColor: theme.colors.success + '30' }]} />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 80,
    right: 20,
    width: 280,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 1000,
   pointerEvents: 'none',
  },
  iconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  avatarContainer: {
    marginRight: 8,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 12,
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
  customerName: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 1,
  },
  productText: {
    fontSize: 12,
    fontWeight: '500',
  },
  timeText: {
    fontSize: 10,
    marginTop: 2,
  },
  pulseContainer: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 6,
    height: 6,
  },
  pulse: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});