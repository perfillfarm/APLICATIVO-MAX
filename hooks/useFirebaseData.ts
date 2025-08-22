import { useState, useEffect } from 'react';
import { FirebaseService, DailyRecord, UserSettings } from '@/services/FirebaseService';
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext';
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
    const unsubscribe = FirebaseService.subscribeToDailyRecords(user.uid, (newRecords) => {
      console.log(`🔥 [${user.uid}] Firebase records updated:`, newRecords.length);
      setRecords(newRecords);
      setLoading(false);
      setError(null);
      setSyncStatus('synced');
      
      // Force re-render of dependent components
      setTimeout(() => {
        console.log(`✅ [${user.uid}] Records synced and propagated: ${newRecords.length} records`);
      }, 100);
    });

    return unsubscribe;
  }, [user]);

  const createRecord = async (recordData: Omit<DailyRecord, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!user) throw new Error('No authenticated user');
    
    try {
      setSyncStatus('syncing');
      console.log(`🔄 [${user.uid}] Creating record for date: ${recordData.date}`);
      
      await FirebaseService.createDailyRecord({
        ...recordData,
        userId: user.uid,
      });
      
      console.log(`✅ [${user.uid}] Record created successfully for ${recordData.date}`);
      setSyncStatus('synced');
      
      // Aguardar Firebase processar e validar
      console.log(`🔄 [${user.uid}] Waiting for Firebase to process...`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Validate record was saved
      const savedRecord = await FirebaseService.getDailyRecordByDate(user.uid, recordData.date);
      if (savedRecord) {
        console.log(`✅ [${user.uid}] Record validation successful for ${recordData.date}`);
        console.log(`✅ [${user.uid}] Saved record details:`, {
          id: savedRecord.id,
          completed: savedRecord.completed,
          drops: savedRecord.drops
        });
      } else {
        console.warn(`⚠️ [${user.uid}] Record validation failed for ${recordData.date}`);
      }
    } catch (error) {
      setSyncStatus('error');
      console.error('Error creating record:', error);
      console.error(`❌ [${user.uid}] Failed to create record for ${recordData.date}`);
      
      // Tentar novamente após 2 segundos
      setTimeout(async () => {
        try {
          setSyncStatus('syncing');
          await FirebaseService.createDailyRecord({
            ...recordData,
            userId: user.uid,
          });
          console.log(`✅ [${user.uid}] Record created on retry for ${recordData.date}`);
          setSyncStatus('synced');
        } catch (retryError) {
          console.error(`❌ [${user.uid}] Retry failed for ${recordData.date}:`, retryError);
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
      console.log(`🔄 [${user?.uid}] Updating record: ${recordId}`);
      
      await FirebaseService.updateDailyRecord(recordId, updates);
      
      console.log(`✅ [${user?.uid}] Record updated successfully: ${recordId}`);
      setSyncStatus('synced');
      
      // Force immediate data refresh
      console.log(`🔄 [${user?.uid}] Forcing data refresh after update...`);
      await new Promise(resolve => setTimeout(resolve, 1500));
    } catch (error) {
      setSyncStatus('error');
      console.error('Error updating record:', error);
      console.error(`❌ [${user?.uid}] Failed to update record: ${recordId}`);
      throw error;
    }
  };

  const deleteRecord = async (recordId: string) => {
    try {
      setSyncStatus('syncing');
      console.log(`🔄 [${user?.uid}] Deleting record: ${recordId}`);
      
      await FirebaseService.deleteDailyRecord(recordId);
      
      console.log(`✅ [${user?.uid}] Record deleted successfully: ${recordId}`);
      setSyncStatus('synced');
    } catch (error) {
      setSyncStatus('error');
      console.error('Error deleting record:', error);
      console.error(`❌ [${user?.uid}] Failed to delete record: ${recordId}`);
      throw error;
    }
  };

  const getRecordByDate = async (date: string): Promise<DailyRecord | null> => {
    if (!user) return null;
    
    try {
      console.log(`🔍 [${user.uid}] Searching record for date: ${date}`);
      
      // Primeiro tentar buscar nos records carregados
      const existingRecord = records.find(r => r.date === date);
      if (existingRecord) {
        console.log(`✅ [${user.uid}] Record found locally for ${date}`);
        return existingRecord;
      }
      
      // Se não encontrar, buscar no Firebase
      const firebaseRecord = await FirebaseService.getDailyRecordByDate(user.uid, date);
      if (firebaseRecord) {
        console.log(`✅ [${user.uid}] Record found in Firebase for ${date}`);
      } else {
        console.log(`ℹ️ [${user.uid}] No record found for ${date}`);
      }
      return firebaseRecord;
    } catch (error) {
      console.error('Error getting record by date:', error);
      console.error(`❌ [${user.uid}] Failed to get record for ${date}`);
      return null;
    }
  };

  const validateRecordSaved = async (date: string) => {
    try {
      // Aguardar um pouco para o Firebase processar
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const savedRecord = await FirebaseService.getDailyRecordByDate(user!.uid, date);
      if (savedRecord) {
        console.log(`✅ [${user!.uid}] Record validation successful for ${date}`);
        return true;
      } else {
        console.warn(`⚠️ [${user!.uid}] Record validation failed for ${date}`);
        return false;
      }
    } catch (error) {
      console.error(`❌ [${user!.uid}] Record validation error for ${date}:`, error);
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
    userId: '',
    notifications: true,
    reminderTime: '09:00',
    dailyGoal: 40,
    weeklyGoal: 280,
    theme: 'light',
    language: 'en',
    createdAt: new Date(),
    updatedAt: new Date()
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
      const userSettings = await FirebaseService.getUserSettings(user.uid);
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
      await FirebaseService.updateUserSettings(user.uid, updates);
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
    averageDrops: 0,
    completionRate: 0,
    totalDrops: 0,
  });

  useEffect(() => {
    calculateStats();
  }, [records]);

  const calculateStats = () => {
    const completedRecords = records.filter(r => r.completed);
    const totalDays = completedRecords.length;
    const totalDrops = completedRecords.reduce((sum, r) => sum + r.drops, 0);
    const averageDrops = totalDays > 0 ? totalDrops / totalDays : 0;

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
      averageDrops,
      completionRate,
      totalDrops,
    });
  };

  return stats;
};

// Hook para calcular progresso mensal
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
    // Últimos 30 dias
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