import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Calendar, CircleCheck, Circle, Zap, Clock } from 'lucide-react-native';
import { Card } from '@/components/ui/Card';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  SlideInRight 
} from 'react-native-reanimated';

interface DailyCheckCardProps {
  isCompleted: boolean;
  onToggle: () => void;
  canCheckIn: boolean;
  capsules?: number;
  time?: string;
  streak: number;
  loading?: boolean;
}

export const DailyCheckCard: React.FC<DailyCheckCardProps> = ({
  isCompleted,
  onToggle,
  canCheckIn,
  capsules,
  time,
  streak,
  loading = false,
}) => {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const checkScale = useSharedValue(1);


  const handlePress = () => {
    console.log(`🎯 [DailyCheckCard] Button pressed:`, {
      isCompleted,
      canCheckIn,
      loading,
      capsules,
      time
    });

    if (loading) {
      console.log(`⏳ [DailyCheckCard] Loading in progress, ignoring press`);
      return;
    }

    if (isCompleted) {
      console.log(`🔒 [DailyCheckCard] Already completed, showing alert`);
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      const timeUntilMidnight = tomorrow.getTime() - now.getTime();
      const hoursUntilMidnight = Math.ceil(timeUntilMidnight / (1000 * 60 * 60));
      
      Alert.alert(
        t('dailyCheckCompleted'),
        `${t('nextCheckInAvailable')}\n\n${t('nextCheckInTomorrow')}`,
        [{ text: t('ok') }]
      );
      return;
    }
    
    // Animação do botão
    checkScale.value = withSpring(0.8, { duration: 100 }, () => {
      checkScale.value = withSpring(1, { duration: 200 });
    });
    
    console.log(`🎯 [DailyCheckCard] Triggering check-in`);
    onToggle();
  };

  const checkAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: checkScale.value }],
    };
  });

  const getButtonStatus = () => {
    if (loading) return 'loading';
    if (isCompleted) return 'completed';
    if (!canCheckIn) return 'blocked';
    return 'available';
  };

  const getStatusText = () => {
    const status = getButtonStatus();
    switch (status) {
      case 'loading':
        return t('loading') || 'Processing...';
      case 'completed':
        return `${t('completedToday')} ✅`;
      case 'blocked':
        return t('alreadyCompletedToday');
      case 'available':
      default:
        return t('markAsCompleted');
    }
  };

  const getDetailsText = () => {
    const status = getButtonStatus();
    
    switch (status) {
      case 'loading':
        return t('saving') || 'Saving your capsules...';
      case 'completed':
        const completedTime = time || '--:--';
        return `${capsules || 2} ${t('capsules')} ${t('at')} ${completedTime}`;
      case 'blocked':
        const now = new Date();
        const midnight = new Date(now);
        midnight.setDate(midnight.getDate() + 1);
        midnight.setHours(0, 0, 0, 0);
        const timeLeft = midnight.getTime() - now.getTime();
        const hoursLeft = Math.ceil(timeLeft / (1000 * 60 * 60));
        return `Next check-in in ${hoursLeft}h (at midnight)`;
      case 'available':
      default:
        return t('tapToRegister');
    }
  };

  const getStatusColor = () => {
    const status = getButtonStatus();
    switch (status) {
      case 'loading':
        return theme.colors.warning;
      case 'completed':
        return theme.colors.success;
      case 'blocked':
        return theme.colors.error;
      case 'available':
      default:
        return theme.colors.textSecondary;
    }
  };

  const getBorderColor = () => {
    const status = getButtonStatus();
    switch (status) {
      case 'loading':
        return theme.colors.warning;
      case 'completed':
        return theme.colors.success;
      case 'blocked':
        return theme.colors.error;
      case 'available':
      default:
        return theme.colors.border;
    }
  };


  return (
    <Animated.View entering={SlideInRight.delay(400)}>
      <Card style={{ marginHorizontal: 20, marginBottom: 20 }}>
        <View style={styles.header}>
          <Calendar size={24} color={theme.colors.primary} />
          <Text style={[styles.title, { color: theme.colors.text }]}>
            {t('dailyCheckIn')}
          </Text>
          <View style={styles.streakBadge}>
            <Zap size={16} color="#EA580C" />
            <Text style={styles.streakText}>{streak}</Text>
          </View>
        </View>
        
        <TouchableOpacity 
          style={[
            styles.checkButton, 
            { 
              backgroundColor: theme.colors.background, 
              borderColor: getBorderColor(),
              opacity: loading ? 0.8 : 1,
            }
          ]}
          onPress={handlePress}
          activeOpacity={0.8}
          disabled={loading}
        >
          <Animated.View style={[styles.checkIcon, checkAnimatedStyle]}>
            {loading ? (
              <Clock size={48} color={theme.colors.warning} />
            ) : isCompleted ? (
              <CircleCheck size={48} color={theme.colors.success} />
            ) : (
              <Circle size={48} color="#94a3b8" />
            )}
          </Animated.View>
          <View style={styles.checkContent}>
            <Text style={[
              styles.checkStatus, 
              { color: getStatusColor() }
            ]}>
              {getStatusText()}
            </Text>
            <Text style={[styles.checkDetails, { color: theme.colors.textSecondary }]}>
              {getDetailsText()}
            </Text>
          </View>
        </TouchableOpacity>

      </Card>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  modernCard: {
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    flex: 1,
    marginLeft: 12,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fed7aa',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(249, 115, 22, 0.2)',
  },
  streakText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F97316',
    marginLeft: 4,
    textShadowColor: 'rgba(249, 115, 22, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  checkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
  },
  checkIcon: {
    marginRight: 16,
  },
  checkContent: {
    flex: 1,
  },
  checkStatus: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  checkDetails: {
    fontSize: 14,
  },
});