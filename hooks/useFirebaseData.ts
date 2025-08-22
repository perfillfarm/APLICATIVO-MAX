import { useState, useEffect } from 'react';
import { SupabaseService } from '@/services/SupabaseService';
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext';
import { DailyRecord, UserSettings } from '@/types/database';
import { Alert } from 'react-native';

export const useFirebaseDailyRecords = () => {
  const { user } = useFirebaseAuth();
  const [records, setRecords] = useState<DailyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'error'>('synced');

  useEffect(() => {
    if (!user) {
      setRecords([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    
    // Subscribe to real-time updates
    const subscription = SupabaseService.subscribeToDailyRecords(user.id, (newRecords) => {
      console.log(`🔥 [${user.id}] Supabase records updated:`, newRecords.length);
      setRecords(newRecords);
      setLoading(false);
      setError(null);
      setSyncStatus('synced');
      
      setTimeout(() => {
        console.log(`✅ [${user.id}] Records synced and propagated: ${newRecords.length} records`);
      }, 100);
    });

    return () => subscription?.unsubscribe();
  }, [user]);

  const createRecord = async (recordData: Omit<DailyRecord, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) throw new Error('No authenticated user');
    
    try {
      setSyncStatus('syncing');
      console.log(`🔄 [${user.id}] Creating record for date: ${recordData.date}`);
      
      await SupabaseService.createDailyRecord({
        ...recordData,
        user_id: user.id,
      });
      
      console.log(`✅ [${user.id}] Record created successfully for ${recordData.date}`);
      setSyncStatus('synced');
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const savedRecord = await SupabaseService.getDailyRecordByDate(user.id, recordData.date);
      if (savedRecord) {
        console.log(`✅ [${user.id}] Record validation successful for ${recordData.date}`);
      } else {
        console.warn(`⚠️ [${user.id}] Record validation failed for ${recordData.date}`);
      }
    } catch (error) {
      setSyncStatus('error');
      console.error('Error creating record:', error);
      
      setTimeout(async () => {
        try {
          setSyncStatus('syncing');
          await SupabaseService.createDailyRecord({
            ...recordData,
            user_id: user.id,
          });
          console.log(`✅ [${user.id}] Record created on retry for ${recordData.date}`);
          setSyncStatus('synced');
        } catch (retryError) {
          console.error(`❌ [${user.id}] Retry failed for ${recordData.date}:`, retryError);
          setSyncStatus('error');
          Alert.alert(
            'Sync Error',
            'Failed to save your data. Please check your internet connection and try again.',
            [{ text: 'OK' }]
          );
        }
      }, 2000);
      
      throw error;
    }
  };

  const updateRecord = async (recordId: string, updates: Partial<DailyRecord>) => {
    try {
      setSyncStatus('syncing');
      console.log(`🔄 [${user?.id}] Updating record: ${recordId}`);
      
      await SupabaseService.updateDailyRecord(recordId, updates);
      
      console.log(`✅ [${user?.id}] Record updated successfully: ${recordId}`);
      setSyncStatus('synced');
      
      await new Promise(resolve => setTimeout(resolve, 1500));
    } catch (error) {
      setSyncStatus('error');
      console.error('Error updating record:', error);
      throw error;
    }
  };

  const deleteRecord = async (recordId: string) => {
    try {
      setSyncStatus('syncing');
      console.log(`🔄 [${user?.id}] Deleting record: ${recordId}`);
      
      await SupabaseService.deleteDailyRecord(recordId);
      
      console.log(`✅ [${user?.id}] Record deleted successfully: ${recordId}`);
      setSyncStatus('synced');
    } catch (error) {
      setSyncStatus('error');
      console.error('Error deleting record:', error);
      throw error;
    }
  };

  const getRecordByDate = async (date: string): Promise<DailyRecord | null> => {
    if (!user) return null;
    
    try {
      console.log(`🔍 [${user.id}] Searching record for date: ${date}`);
      
      const existingRecord = records.find(r => r.date === date);
      if (existingRecord) {
        console.log(`✅ [${user.id}] Record found locally for ${date}`);
        return existingRecord;
      }
      
      const supabaseRecord = await SupabaseService.getDailyRecordByDate(user.id, date);
      if (supabaseRecord) {
        console.log(`✅ [${user.id}] Record found in Supabase for ${date}`);
      } else {
        console.log(`ℹ️ [${user.id}] No record found for ${date}`);
      }
      return supabaseRecord;
    } catch (error) {
      console.error('Error getting record by date:', error);
      return null;
    }
  };

  const validateRecordSaved = async (date: string) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const savedRecord = await SupabaseService.getDailyRecordByDate(user!.id, date);
      if (savedRecord) {
        console.log(`✅ [${user!.id}] Record validation successful for ${date}`);
        return true;
      } else {
        console.warn(`⚠️ [${user!.id}] Record validation failed for ${date}`);
        return false;
      }
    } catch (error) {
      console.error(`❌ [${user!.id}] Record validation error for ${date}:`, error);
      return false;
    }
  };

  return {
    records,
    loading,
    error,
    syncStatus,
    createRecord,
    updateRecord,
    deleteRecord,
    getRecordByDate,
    validateRecordSaved,
  };
};

export const useFirebaseSettings = () => {
  const { user } = useFirebaseAuth();
  const [settings, setSettings] = useState<UserSettings>({
    user_id: '',
    notifications: true,
    reminder_time: '09:00',
    daily_goal: 2,
    weekly_goal: 14,
    theme: 'light',
    language: 'en',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setSettings(null);
      setLoading(false);
      return;
    }

    loadSettings();
  }, [user]);

  const loadSettings = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const userSettings = await SupabaseService.getUserSettings(user.id);
      if (userSettings) {
        setSettings(userSettings);
      }
      setError(null);
    } catch (error) {
      console.error('Error loading settings:', error);
      setError('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (updates: Partial<UserSettings>) => {
    if (!user) throw new Error('No authenticated user');
    
    try {
      await SupabaseService.updateUserSettings(user.id, updates);
      setSettings(prev => ({ ...prev, ...updates }));
    } catch (error) {
      console.error('Error updating settings:', error);
      throw error;
    }
  };

  return {
    settings,
    loading,
    error,
    updateSettings,
    reloadSettings: loadSettings,
  };
};

export const useFirebaseStats = () => {
  const { records } = useFirebaseDailyRecords();
  const [stats, setStats] = useState({
    totalDays: 0,
    currentStreak: 0,
    averageCapsules: 0,
    completionRate: 0,
    totalCapsules: 0,
  });

  useEffect(() => {
    calculateStats();
  }, [records]);

  const calculateStats = () => {
    const completedRecords = records.filter(r => r.completed);
    const totalDays = completedRecords.length;
    const totalCapsules = completedRecords.reduce((sum, r) => sum + r.capsules, 0);
    const averageCapsules = totalDays > 0 ? totalCapsules / totalDays : 0;

    // Calculate current streak
    let currentStreak = 0;
    const sortedRecords = completedRecords
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    for (let i = 0; i < sortedRecords.length; i++) {
      const recordDate = new Date(sortedRecords[i].date);
      const expectedDate = new Date();
      expectedDate.setDate(expectedDate.getDate() - i);

      if (recordDate.toDateString() === expectedDate.toDateString()) {
        currentStreak++;
      } else {
        break;
      }
    }

    // Calculate completion rate (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const last30DaysRecords = records.filter(r => {
      const recordDate = new Date(r.date);
      return recordDate >= thirtyDaysAgo;
    });
    
    const completedLast30Days = last30DaysRecords.filter(r => r.completed).length;
    const completionRate = (completedLast30Days / 30) * 100;

    setStats({
      totalDays,
      currentStreak,
      averageCapsules,
      completionRate,
      totalCapsules,
    });
  };

  return stats;
};

export const useMonthlyProgress = (records: DailyRecord[]) => {
  const [progress, setProgress] = useState({
    completionRate: 0,
    completedDays: 0,
    totalDays: 30,
  });

  useEffect(() => {
    calculateMonthlyProgress();
  }, [records]);

  const calculateMonthlyProgress = () => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const last30DaysRecords = records.filter(r => {
      const recordDate = new Date(r.date);
      return recordDate >= thirtyDaysAgo;
    });
    
    const completedDays = last30DaysRecords.filter(r => r.completed).length;
    const completionRate = (completedDays / 30) * 100;

    setProgress({
      completionRate,
      completedDays,
      totalDays: 30,
    });
  };

  return progress;
};