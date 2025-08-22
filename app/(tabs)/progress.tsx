import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Target, TrendingUp, Award, Clock, Calendar, ChartBar as BarChart3, ChevronLeft, ChevronRight, Activity } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useFirebaseRecords } from '@/contexts/FirebaseRecordsContext';
import { FirebaseService } from '@/services/FirebaseService';

// Helper function to get translated month name
const getTranslatedMonth = (date: Date, t: (key: string) => string): string => {
  const monthNames = [
    'january', 'february', 'march', 'april', 'may', 'june',
    'july', 'august', 'september', 'october', 'november', 'december'
  ];
  
  const monthIndex = date.getMonth();
  const monthKey = monthNames[monthIndex];
  return t(monthKey);
};

import { Card } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { Header } from '@/components/ui/Header';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface DailyRecord {
  id?: string;
  date: string;
  capsules: number;
  time: string;
  notes?: string;
  completed: boolean;
}

export default function ProgressScreen() {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const { records } = useFirebaseRecords();
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [monthlyRecords, setMonthlyRecords] = useState<DailyRecord[]>([]);
  const [periodStats, setPeriodStats] = useState({
    totalCapsules: 0,
    averageCapsules: 0,
    bestDay: 'N/A',
    consistency: 0,
    completedDays: 0,
    totalDays: 0,
  });
  const [monthlyStats, setMonthlyStats] = useState({
    totalCapsules: 0,
    averageCapsules: 0,
    completedDays: 0,
    totalDaysInMonth: 0,
    consistency: 0,
  });

  useEffect(() => {
    console.log(`📊 [Progress] Records updated: ${records.length} total records`);
    console.log(`📊 [Progress] Selected month: ${selectedMonth.toISOString().slice(0, 7)}`);
    if (records.length >= 0) { // Allow for empty records
      calculatePeriodStats();
      calculateMonthlyStats();
      filterRecordsByMonth();
    }
  }, [records, selectedMonth]);

  const filterRecordsByMonth = () => {
    try {
      const year = selectedMonth.getFullYear();
      const month = selectedMonth.getMonth();
      
      // Get first and last day of selected month
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      
      // Filter records for selected month from all available records
      const filteredRecords = records.filter(record => {
        const recordDate = new Date(record.date);
        const isInRange = recordDate >= firstDay && recordDate <= lastDay;
        
        return isInRange;
      });
      
      // Sort by date (most recent first)
      filteredRecords.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      setMonthlyRecords(filteredRecords);
    } catch (error) {
      console.error('❌ [Progress] Error filtering records by month:', error);
      setMonthlyRecords([]);
    }
  };

  const calculateMonthlyStats = () => {
    try {
      const year = selectedMonth.getFullYear();
      const month = selectedMonth.getMonth();
      
      // Get first and last day of selected month
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const totalDaysInMonth = lastDay.getDate();
      
      // Filter records for selected month with real-time data
      const monthRecords = records.filter(record => {
        const recordDate = new Date(record.date);
        return recordDate >= firstDay && recordDate <= lastDay;
      });
      
      const completedRecords = monthRecords.filter(r => r.completed);
      const totalCapsules = completedRecords.reduce((sum, r) => sum + (r.capsules || 2), 0);
      const averageCapsules = completedRecords.length > 0 ? totalCapsules / completedRecords.length : 0;
      const completedDays = completedRecords.length;
      const consistency = (completedDays / totalDaysInMonth) * 100;
      
      const newMonthlyStats = {
        totalCapsules,
        averageCapsules,
        completedDays,
        totalDaysInMonth,
        consistency,
      };
      
      setMonthlyStats(newMonthlyStats);
    } catch (error) {
      console.error('❌ [Progress] Error calculating monthly stats:', error);
      setMonthlyStats({
        totalCapsules: 0,
        averageCapsules: 0,
        completedDays: 0,
        totalDaysInMonth: 0,
        consistency: 0,
      });
    }
  };


  const calculatePeriodStats = () => {
    try {
      // Use monthly records instead of period-based filtering
      const year = selectedMonth.getFullYear();
      const month = selectedMonth.getMonth();
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const totalDaysInMonth = lastDay.getDate();
      
      // Filter records for selected month
      const monthRecords = records.filter(record => {
        const recordDate = new Date(record.date);
        return recordDate >= firstDay && recordDate <= lastDay;
      });

      // Calculate stats for the selected month
      const completedRecords = monthRecords.filter(r => r.completed);
      const totalCapsules = completedRecords.reduce((sum, r) => sum + (r.capsules || 2), 0);
      const averageCapsules = completedRecords.length > 0 ? totalCapsules / completedRecords.length : 0;
      const bestDay = completedRecords.reduce((best, current) => 
        (current.capsules || 2) > (best.capsules || 2) ? current : best, 
        completedRecords[0] || { date: '', capsules: 2 }
      );
      const consistency = (completedRecords.length / totalDaysInMonth) * 100;
      
      const newPeriodStats = {
        totalCapsules,
        averageCapsules,
        bestDay: bestDay.date ? new Date(bestDay.date).toLocaleDateString('pt-BR') : 'N/A',
        consistency,
        completedDays: completedRecords.length,
        totalDays: totalDaysInMonth,
      };
      
      setPeriodStats(newPeriodStats);
    } catch (error) {
      console.error('❌ [Progress] Error calculating period stats:', error);
      // Set default values in case of error
      setPeriodStats({
        totalCapsules: 0,
        averageCapsules: 0,
        bestDay: 'N/A',
        consistency: 0,
        completedDays: 0,
        totalDays: 0,
      });
    }
  };

  const clearAllRecords = async () => {
    Alert.alert(
      t('clearAllRecords'),
      t('clearWarning'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('yesDeleteAll'),
          style: 'destructive',
          onPress: async () => {
            try {
              // Delete all records from Firebase
              for (const record of records) {
                if (record.id) {
                  await FirebaseService.deleteDailyRecord(record.id);
                }
              }
              
              Alert.alert(t('cleaningCompleted'), t('allRecordsRemoved'));
            } catch (error) {
              console.error('Error clearing records:', error);
              Alert.alert(t('couldNotClearRecords'), 'Please try again.');
            }
          }
        }
      ]
    );
  };

  const MonthSelector = () => {
    const goToPreviousMonth = () => {
      const newMonth = new Date(selectedMonth);
      newMonth.setMonth(newMonth.getMonth() - 1);
      setSelectedMonth(newMonth);
    };

    const goToNextMonth = () => {
      const newMonth = new Date(selectedMonth);
      newMonth.setMonth(newMonth.getMonth() + 1);
      setSelectedMonth(newMonth);
    };

    const isCurrentMonth = () => {
      const now = new Date();
      return selectedMonth.getFullYear() === now.getFullYear() && 
             selectedMonth.getMonth() === now.getMonth();
    };

    const isFutureMonth = () => {
      const now = new Date();
      const maxDate = new Date(2027, 11, 31); // December 2027
      return selectedMonth > maxDate;
    };

    const isPastLimit = () => {
      const minDate = new Date(2020, 0, 1); // January 2020
      return selectedMonth < minDate;
    };

    return (
      <View style={styles.monthSelector}>
        <TouchableOpacity
          style={[
            styles.monthButton,
            { 
              backgroundColor: theme.colors.card, 
              borderColor: theme.colors.border,
              opacity: isPastLimit() ? 0.5 : 1
            }
          ]}
          onPress={goToPreviousMonth}
          disabled={isPastLimit()}
        >
          <ChevronLeft size={20} color={theme.colors.primary} />
        </TouchableOpacity>
        
        <View style={[styles.monthDisplay, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.monthText, { color: theme.colors.text }]}>
            {getTranslatedMonth(selectedMonth, t)} {selectedMonth.getFullYear()}
          </Text>
          {isCurrentMonth() && (
            <Text style={[styles.currentMonthBadge, { color: theme.colors.primary }]}>
              {t('current')}
            </Text>
          )}
        </View>
        
        <TouchableOpacity
          style={[
            styles.monthButton,
            { 
              backgroundColor: theme.colors.card, 
              borderColor: theme.colors.border,
              opacity: isFutureMonth() ? 0.5 : 1
            }
          ]}
          onPress={goToNextMonth}
          disabled={isFutureMonth()}
        >
          <ChevronRight size={20} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>
    );
  };


  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header 
        title={
          <View style={styles.headerTitleContainer}>
            <Activity size={24} color="#ffffff" style={styles.headerIcon} />
            <Text style={styles.headerTitleText}>{t('progress')}</Text>
          </View>
        }
        subtitle={
          <View style={styles.headerSubtitleContainer}>
            <Text style={styles.headerSubtitleText}>{t('trackYourDevelopment')}</Text>
          </View>
        }
        showOptions={false}
      />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>

        {/* Monthly Progress Section */}
        <Animated.View entering={FadeInDown.delay(300)} style={[styles.section, styles.firstSection]}>
          <View style={styles.sectionHeader}>
            <Calendar size={24} color={theme.colors.primary} />
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              {t('monthlyProgress')}
            </Text>
          </View>
          
          <MonthSelector />
          
          <Card style={{ marginHorizontal: 20, marginBottom: 20 }}>
            <View style={styles.monthlyProgressContent}>
              <View style={styles.monthlyProgressHeader}>
                <Text style={[styles.monthlyProgressTitle, { color: theme.colors.text }]}>
                  {selectedMonth.toLocaleDateString('pt-BR', { 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </Text>
                <View style={styles.monthlyDataInfo}>
                  <Text style={[styles.monthlyDataText, { color: theme.colors.textSecondary }]}>
                    {monthlyRecords.length} {t('records')}
                  </Text>
                </View>
                <View style={[
                  styles.consistencyBadge, 
                  { backgroundColor: monthlyStats.consistency >= 80 ? theme.colors.success + '20' : theme.colors.warning + '20' }
                ]}>
                  <Text style={[
                    styles.consistencyText, 
                    { color: monthlyStats.consistency >= 80 ? theme.colors.success : theme.colors.warning }
                  ]}>
                    {Math.round(monthlyStats.consistency)}%
                  </Text>
                </View>
              </View>
              
              <View style={styles.monthlyStatsGrid}>
                <View style={styles.monthlyStatItem}>
                  <Text style={[styles.monthlyStatValue, { color: theme.colors.success }]}>
                    {monthlyStats.completedDays}
                  </Text>
                  <Text style={[styles.monthlyStatLabel, { color: theme.colors.textSecondary }]}>
                    {t('completedDays')}
                  </Text>
                </View>
                
                <View style={styles.monthlyStatItem}>
                  <Text style={[styles.monthlyStatValue, { color: theme.colors.primary }]}>
                    {monthlyStats.totalDaysInMonth}
                  </Text>
                  <Text style={[styles.monthlyStatLabel, { color: theme.colors.textSecondary }]}>
                    {t('totalDays')}
                  </Text>
                </View>
                
                <View style={styles.monthlyStatItem}>
                  <Text style={[styles.monthlyStatValue, { color: theme.colors.warning }]}>
                    {monthlyStats.totalCapsules}
                  </Text>
                  <Text style={[styles.monthlyStatLabel, { color: theme.colors.textSecondary }]}>
                    {t('totalCapsules')}
                  </Text>
                </View>
                
                <View style={styles.monthlyStatItem}>
                  <Text style={[styles.monthlyStatValue, { color: '#8B5CF6' }]}>
                    {monthlyStats.averageCapsules.toFixed(1)}
                  </Text>
                  <Text style={[styles.monthlyStatLabel, { color: theme.colors.textSecondary }]}>
                    {t('averageCapsules')}
                  </Text>
                </View>
              </View>
              
              {/* Progress Bar */}
              <View style={styles.monthlyProgressBar}>
                <View style={styles.progressBarHeader}>
                  <Text style={[styles.progressBarLabel, { color: theme.colors.text }]}>
                    {t('monthlyGoal')}: 80%
                  </Text>
                  <Text style={[styles.progressBarValue, { color: theme.colors.primary }]}>
                    {Math.round(monthlyStats.consistency)}%
                  </Text>
                </View>
                <View style={[styles.progressBarTrack, { backgroundColor: theme.colors.border }]}>
                  <View
                    style={[
                      styles.progressBarFill,
                      {
                        width: `${Math.min(monthlyStats.consistency, 100)}%`,
                        backgroundColor: monthlyStats.consistency >= 80 ? theme.colors.success : theme.colors.warning,
                      },
                    ]}
                  />
                  <View style={[styles.goalMarker, { left: '80%' }]}>
                    <View style={[styles.goalMarkerLine, { backgroundColor: theme.colors.text }]} />
                  </View>
                </View>
              </View>
            </View>
          </Card>
          
        </Animated.View>


        {/* Monthly Days Calendar */}
        <Animated.View entering={FadeInDown.delay(450)} style={[styles.section, styles.firstSection]}>
          <View style={styles.sectionHeader}>
            <Calendar size={24} color={theme.colors.primary} />
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              {t('monthlyDaysStatus')}
            </Text>
          </View>
          
          <Card style={{ marginHorizontal: 20, marginBottom: 20 }}>
            <View style={styles.monthlyCalendarHeader}>
              <Text style={[styles.monthlyCalendarTitle, { color: theme.colors.text }]}>
                {getTranslatedMonth(selectedMonth, t)} {selectedMonth.getFullYear()}
              </Text>
            </View>
            
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.daysScrollView}
              contentContainerStyle={styles.daysScrollContent}
            >
              {Array.from({ length: monthlyStats.totalDaysInMonth }, (_, index) => {
                const day = index + 1;
                const date = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), day);
                const dateStr = date.toISOString().split('T')[0];
                const dayRecord = monthlyRecords.find(r => r.date === dateStr);
                const isCompleted = dayRecord?.completed || false;
                const isToday = dateStr === new Date().toISOString().split('T')[0];
                const isFuture = date > new Date();
                
                return (
                  <View
                    key={day}
                    style={[
                      styles.dayItem,
                      {
                        backgroundColor: isFuture 
                          ? '#f5f5f5'
                          : isCompleted 
                            ? theme.colors.success + '20'
                            : theme.colors.error + '20',
                        borderColor: isFuture
                          ? '#e0e0e0'
                          : isCompleted 
                            ? theme.colors.success
                            : theme.colors.error,
                        borderWidth: isToday ? 3 : 1,
                      }
                    ]}
                  >
                    <Text style={[
                      styles.dayNumber,
                      {
                        color: isFuture
                          ? '#9e9e9e'
                          : isCompleted 
                            ? theme.colors.success
                            : theme.colors.error,
                        fontWeight: isToday ? '800' : '600'
                      }
                    ]}>
                      {day}
                    </Text>
                    
                    {isCompleted && (
                      <View style={styles.dayStatusIndicator}>
                        <Text style={[styles.dayStatusText, { color: theme.colors.success }]}>
                          {dayRecord?.capsules || 2}💊
                        </Text>
                      </View>
                    )}
                    
                    {!isCompleted && !isFuture && (
                      <View style={styles.dayStatusIndicator}>
                        <Text style={[styles.dayStatusText, { color: theme.colors.error }]}>
                          ❌
                        </Text>
                      </View>
                    )}
                    
                    {isFuture && (
                      <View style={styles.dayStatusIndicator}>
                        <Text style={[styles.dayStatusText, { color: '#9e9e9e' }]}>
                          ⏳
                        </Text>
                      </View>
                    )}
                  </View>
                );
              })}
            </ScrollView>
            
            {/* Legend */}
            <View style={styles.daysLegend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: theme.colors.success }]} />
                <Text style={[styles.legendText, { color: theme.colors.text }]}>
                  {t('completed') || 'Completado'}
                </Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: theme.colors.error }]} />
                <Text style={[styles.legendText, { color: theme.colors.text }]}>
                  {t('notCompleted') || 'Não Completado'}
                </Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#f5f5f5', borderWidth: 1, borderColor: '#e0e0e0' }]} />
                <Text style={[styles.legendText, { color: theme.colors.text }]}>
                  {t('future') || 'Futuro'}
                </Text>
              </View>
            </View>
            
            {/* Minimalist Swipe Hint */}
            <View style={styles.minimalistSwipeHint}>
              <Text style={[styles.minimalistSwipeText, { color: theme.colors.textSecondary }]}>
                ← →
              </Text>
            </View>
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(500)} style={styles.section}>
          <View style={styles.sectionHeader}>
            <Target size={24} color={theme.colors.primary} />
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              {t('monthlyStatistics')}
            </Text>
          </View>
          
          <View style={styles.statsGrid}>
            <StatCard
              icon={Award}
              title={t('totalCapsules')}
              value={periodStats.totalCapsules}
              subtitle={t('inMonth')}
              color={theme.colors.success}
              delay={600}
            />
            <StatCard
              icon={TrendingUp}
              title={t('averageCapsules')}
              value={`${periodStats.averageCapsules.toFixed(1)}`}
              subtitle={t('capsulesPerDay')}
              color="#F59E0B"
              delay={700}
            />
            <StatCard
              icon={Calendar}
              title={t('completedDays')}
              value={`${periodStats.completedDays}/${periodStats.totalDays}`}
              subtitle={t('ofDays').replace('{total}', periodStats.totalDays.toString())}
              color="#8B5CF6"
              delay={800}
            />
            <StatCard
              icon={Clock}
              title={t('consistency')}
              value={`${periodStats.consistency.toFixed(0)}%`}
              subtitle={t('completionRate')}
              color={theme.colors.error}
              delay={900}
            />
          </View>
        </Animated.View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginLeft: 8,
  },
  firstSection: {
    marginTop: 24,
  },
  statsGrid: {
    paddingHorizontal: 20,
  },
  recordsList: {
    gap: 12,
  },
  bottomSpacing: {
    height: 20,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    marginRight: 8,
  },
  headerTitleText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
  },
  headerSubtitleContainer: {
    marginTop: 2,
  },
  headerSubtitleText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 18,
  },
  monthlyCalendarHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  monthlyCalendarTitle: {
    fontSize: 18,
    fontWeight: '700',
    textTransform: 'capitalize',
    marginBottom: 4,
  },
  monthlyCalendarSubtitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  daysScrollView: {
    marginBottom: 16,
  },
  daysScrollContent: {
    paddingHorizontal: 4,
    gap: 8,
  },
  dayItem: {
    width: 60,
    height: 80,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  dayNumber: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  dayStatusIndicator: {
    alignItems: 'center',
  },
  dayStatusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  daysLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 12,
    fontWeight: '500',
  },
  minimalistSwipeHint: {
    alignItems: 'center',
    paddingVertical: 8,
    marginTop: 4,
  },
  minimalistSwipeText: {
    fontSize: 16,
    fontWeight: '300',
    opacity: 0.6,
    letterSpacing: 8,
  },
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 16,
    gap: 12,
  },
  monthButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthDisplay: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  monthText: {
    fontSize: 16,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  currentMonthBadge: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  monthlyProgressContent: {
    padding: 4,
  },
  monthlyProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  monthlyProgressTitle: {
    fontSize: 18,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  consistencyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  consistencyText: {
    fontSize: 14,
    fontWeight: '700',
  },
  monthlyStatsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  monthlyStatItem: {
    alignItems: 'center',
    flex: 1,
  },
  monthlyStatValue: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  monthlyStatLabel: {
    fontSize: 11,
    textAlign: 'center',
    fontWeight: '500',
  },
  monthlyProgressBar: {
    marginTop: 8,
  },
  progressBarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressBarLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  progressBarValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  progressBarTrack: {
    height: 8,
    borderRadius: 4,
    position: 'relative',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  goalMarker: {
    position: 'absolute',
    top: -2,
    height: 12,
    width: 2,
  },
  goalMarkerLine: {
    width: 2,
    height: '100%',
    opacity: 0.7,
  },
  monthlyDataInfo: {
    alignItems: 'center',
  },
  monthlyDataText: {
    fontSize: 12,
    fontWeight: '500',
  },
});