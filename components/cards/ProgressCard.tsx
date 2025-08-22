import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card } from '@/components/ui/Card';
import { LinearGradient } from 'expo-linear-gradient';
import { Target, TrendingUp, Calendar, Award } from 'lucide-react-native';
import Animated, { BounceIn } from 'react-native-reanimated';

interface ProgressCardProps {
  progress: number;
  completedDays: number;
  totalDays: number;
  title?: string;
  records?: any[];
}

export const ProgressCard: React.FC<ProgressCardProps> = ({
  progress,
  completedDays,
  totalDays,
  title,
  records = [],
}) => {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const cardTitle = title || t('monthlyProgress');

  // Recalcular progresso baseado nos records atuais em tempo real
  const actualProgress = React.useMemo(() => {
    // Calcular progresso do mês atual apenas
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const totalDaysInMonth = lastDay.getDate();
    
    const currentMonthRecords = records.filter((r: any) => {
      const recordDate = new Date(r.date);
      return recordDate >= firstDay && recordDate <= lastDay;
    });
    
    const actualCompletedDays = currentMonthRecords.filter((r: any) => r.completed).length;
    const actualProgress = (actualCompletedDays / totalDaysInMonth) * 100;
    
    return {
      progress: actualProgress,
      completedDays: actualCompletedDays,
    };
  }, [records, progress, JSON.stringify(records)]);

  const getProgressColor = () => {
    const currentProgress = actualProgress.progress || progress;
    if (currentProgress >= 80) return theme.colors.success;
    if (currentProgress >= 60) return theme.colors.warning;
    return theme.colors.error;
  };

  const getProgressMessage = () => {
    const currentProgress = actualProgress.progress || progress;
    if (currentProgress >= 80) return t('excellentConsistency');
    if (currentProgress >= 60) return t('goodProgress');
    if (currentProgress >= 40) return t('letsImprove');
    return t('focusOnConsistency');
  };

  const displayProgress = actualProgress.progress || progress;
  const displayCompletedDays = actualProgress.completedDays || completedDays;

  return (
    <Animated.View entering={BounceIn.delay(600)}>
      <LinearGradient
        colors={[
          theme.colors.card,
          theme.isDark ? '#1f2937' : '#f8fafc',
          theme.colors.surface
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.modernCard, { 
          marginHorizontal: 20, 
          marginBottom: 20,
          shadowColor: theme.colors.shadow,
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: theme.isDark ? 0.3 : 0.15,
          shadowRadius: 20,
          elevation: 12,
        }]}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.titleSection}>
            <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary + '20' }]}>
              <Calendar size={24} color={theme.colors.primary} />
            </View>
            <Text style={[styles.title, { color: theme.colors.text }]}>
              {cardTitle}
            </Text>
          </View>
          <View style={[styles.streakBadge, { 
            backgroundColor: '#fed7aa',
            shadowColor: '#F97316',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 6,
          }]}>
            <Text style={[styles.progressText, { color: getProgressColor() }]}>
              {Math.round(displayProgress)}%
            </Text>
          </View>
        </View>

        {/* Central Progress Info */}
        <View style={styles.centralInfo}>
          <Text style={[styles.progressValue, { color: theme.colors.text }]}>
            {Math.round(displayProgress)}%
          </Text>
          <Text style={[styles.progressMessage, { color: theme.colors.text }]}>
            {getProgressMessage()}
          </Text>
          <Text style={[styles.progressSubtext, { color: theme.colors.textSecondary }]}>
            {displayCompletedDays} {t('of')} {totalDays} {t('completedDays')}
          </Text>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={[styles.statItem, { backgroundColor: theme.colors.background }]}>
            <Target size={20} color={theme.colors.success} />
            <Text style={[styles.statValue, { color: theme.colors.success }]}>
              {displayCompletedDays}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
              {t('completed')}
            </Text>
          </View>

          <View style={[styles.statItem, { backgroundColor: theme.colors.background }]}>
            <TrendingUp size={20} color={theme.colors.warning} />
            <Text style={[styles.statValue, { color: theme.colors.warning }]}>
              {totalDays - displayCompletedDays}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
              {t('pending')}
            </Text>
          </View>

          <View style={[styles.statItem, { backgroundColor: theme.colors.background }]}>
            <Award size={20} color={theme.colors.primary} />
            <Text style={[styles.statValue, { color: theme.colors.primary }]}>
              {Math.max(0, totalDays - displayCompletedDays)}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
              {t('remaining')}
            </Text>
          </View>
        </View>

        {/* Goal Progress Bar */}
        <View style={styles.goalSection}>
          <View style={styles.goalHeader}>
            <Text style={[styles.goalTitle, { color: theme.colors.text }]}>
              {t('consistencyGoal')}
            </Text>
            <Text style={[styles.goalPercentage, { color: getProgressColor() }]}>
              {Math.round(displayProgress)}%
            </Text>
          </View>
          
          <View style={[styles.goalBar, { backgroundColor: theme.colors.border }]}>
            <View
              style={[
                styles.goalFill,
                {
                  width: `${Math.min(displayProgress, 100)}%`,
                  backgroundColor: getProgressColor(),
                },
              ]}
            />
            <View style={[styles.goalTarget, { left: '80%' }]}>
              <View style={[styles.goalTargetLine, { backgroundColor: theme.colors.text }]} />
            </View>
          </View>
          
          <View style={styles.goalLabels}>
            <Text style={[styles.goalLabel, { color: theme.colors.textSecondary }]}>
              0%
            </Text>
            <Text style={[styles.goalLabel, { color: theme.colors.textSecondary }]}>
              {t('goal')}
            </Text>
            <Text style={[styles.goalLabel, { color: theme.colors.textSecondary }]}>
              100%
            </Text>
          </View>
        </View>
      </LinearGradient>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  titleSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    flex: 1,
  },
  progressBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '700',
  },
  centralInfo: {
    alignItems: 'center',
    marginBottom: 24,
  },
  progressValue: {
    fontSize: 48,
    fontWeight: '800',
    marginBottom: 8,
  },
  progressMessage: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  progressSubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 8,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
  goalSection: {
    marginTop: 8,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  goalPercentage: {
    fontSize: 16,
    fontWeight: '700',
  },
  goalBar: {
    height: 8,
    borderRadius: 4,
    position: 'relative',
    overflow: 'hidden',
  },
  goalFill: {
    height: '100%',
    borderRadius: 4,
  },
  goalTarget: {
    position: 'absolute',
    top: -2,
    height: 12,
    width: 2,
  },
  goalTargetLine: {
    width: 2,
    height: '100%',
    opacity: 0.7,
  },
  goalLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  goalLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
});