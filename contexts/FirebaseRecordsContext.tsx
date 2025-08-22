import React, { createContext, useContext, useState, useEffect } from 'react';
import { FirebaseService, DailyRecord } from '@/services/FirebaseService';
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext';

interface FirebaseRecordsContextData {
  records: DailyRecord[];
  loading: boolean;
  error: string | null;
  syncStatus: 'synced' | 'syncing' | 'error';
  createRecord: (recordData: Omit<DailyRecord, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateRecord: (recordId: string, updates: Partial<DailyRecord>) => Promise<void>;
  deleteRecord: (recordId: string) => Promise<void>;
  getRecordByDate: (date: string) => Promise<DailyRecord | null>;
  refreshRecords: () => Promise<void>;
}

const FirebaseRecordsContext = createContext<FirebaseRecordsContextData>({} as FirebaseRecordsContextData);

export const FirebaseRecordsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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

    console.log(`🔥 [RecordsContext] Setting up listener for user ${user.uid}`);
    setLoading(true);
    
    // Subscribe to real-time updates
    const unsubscribe = FirebaseService.subscribeToDailyRecords(user.uid, (newRecords) => {
      console.log(`📊 [RecordsContext] Records updated: ${newRecords.length} records`);
      console.log(`📊 [RecordsContext] Records date range:`, {
        oldest: newRecords.length > 0 ? newRecords[newRecords.length - 1]?.date : 'none',
        newest: newRecords.length > 0 ? newRecords[0]?.date : 'none',
        totalCompleted: newRecords.filter(r => r.completed).length
      });
      
      if (newRecords.length > 0) {
        console.log(`📊 [RecordsContext] Sample record:`, {
          date: newRecords[0].date,
          completed: newRecords[0].completed,
          capsules: newRecords[0].capsules,
          id: newRecords[0].id
        });
      }
      
      setRecords(newRecords);
      setLoading(false);
      setError(null);
      setSyncStatus('synced');
      
      // Force re-render of dependent components with delay for UI consistency
      setTimeout(() => {
        console.log(`✅ [RecordsContext] Records propagated to components - Total: ${newRecords.length}`);
      }, 100);
    });

    return () => {
      console.log(`🔥 [RecordsContext] Cleaning up listener for user ${user.uid}`);
      unsubscribe();
    };
  }, [user]);

  const createRecord = async (recordData: Omit<DailyRecord, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!user) throw new Error('No authenticated user');
    
    try {
      setSyncStatus('syncing');
      console.log(`📝 [RecordsContext] Creating record for ${recordData.date}:`, {
        date: recordData.date,
        capsules: recordData.capsules,
        completed: recordData.completed,
        time: recordData.time
      });
      
      await FirebaseService.createDailyRecord({
        ...recordData,
        userId: user.uid,
      });
      
      console.log(`✅ [RecordsContext] Record created successfully for ${recordData.date}`);
      console.log(`📊 [RecordsContext] Record details:`, {
        date: recordData.date,
        capsules: recordData.capsules,
        completed: recordData.completed,
        time: recordData.time,
        userId: user.uid
      });
      // Success feedback will be handled by the calling component
    } catch (error) {
      setSyncStatus('error');
      console.error('❌ [RecordsContext] Error creating record:', error);
      throw error;
    }
  };

  const updateRecord = async (recordId: string, updates: Partial<DailyRecord>) => {
    try {
      setSyncStatus('syncing');
      console.log(`📝 [RecordsContext] Updating record ${recordId}:`, {
        updates,
        recordId
      });
      
      await FirebaseService.updateDailyRecord(recordId, updates);
      
      console.log(`✅ [RecordsContext] Record updated successfully: ${recordId}`);
      setSyncStatus('synced');
      
      // Force immediate refresh
      setTimeout(() => {
        console.log(`🔄 [RecordsContext] Forcing refresh after update`);
      }, 500);
    } catch (error) {
      setSyncStatus('error');
      console.error('❌ [RecordsContext] Error updating record:', error);
      throw error;
    }
  };

  const deleteRecord = async (recordId: string) => {
    try {
      setSyncStatus('syncing');
      console.log(`🗑️ [RecordsContext] Deleting record ${recordId}`);
      
      await FirebaseService.deleteDailyRecord(recordId);
      
      console.log(`✅ [RecordsContext] Record deleted successfully`);
      setSyncStatus('synced');
    } catch (error) {
      setSyncStatus('error');
      console.error('❌ [RecordsContext] Error deleting record:', error);
      throw error;
    }
  };

  const getRecordByDate = async (date: string): Promise<DailyRecord | null> => {
    if (!user) return null;
    
    try {
      console.log(`🔍 [RecordsContext] Searching record for ${date} in ${records.length} loaded records`);
      
      // First try to find in loaded records
      const existingRecord = records.find(r => r.date === date);
      if (existingRecord) {
        console.log(`✅ [RecordsContext] Record found locally for ${date}:`, {
          id: existingRecord.id,
          completed: existingRecord.completed,
          drops: existingRecord.drops
        });
        return existingRecord;
      }
      
      // If not found, search in Firebase
      const firebaseRecord = await FirebaseService.getDailyRecordByDate(user.uid, date);
      if (firebaseRecord) {
        console.log(`✅ [RecordsContext] Record found in Firebase for ${date}:`, {
          id: firebaseRecord.id,
          completed: firebaseRecord.completed,
          drops: firebaseRecord.drops
        });
      } else {
        console.log(`ℹ️ [RecordsContext] No record found in Firebase for ${date}`);
      }
      return firebaseRecord;
    } catch (error) {
      console.error('❌ [RecordsContext] Error getting record by date:', error);
      return null;
    }
  };

  const refreshRecords = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      console.log(`🔄 [RecordsContext] Manually refreshing records`);
      
      // Buscar records sem limit para refresh completo
      const freshRecords = await FirebaseService.getDailyRecords(user.uid);
      
      // Ordenar localmente se necessário (backup)
      freshRecords.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      setRecords(freshRecords);
      setError(null);
      setSyncStatus('synced');
      
      console.log(`✅ [RecordsContext] Records refreshed: ${freshRecords.length} records`);
    } catch (error) {
      setError('Failed to refresh records');
      setSyncStatus('error');
      console.error('❌ [RecordsContext] Error refreshing records:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <FirebaseRecordsContext.Provider
      value={{
        records,
        loading,
        error,
        syncStatus,
        createRecord,
        updateRecord,
        deleteRecord,
        getRecordByDate,
        refreshRecords,
      }}
    >
      {children}
    </FirebaseRecordsContext.Provider>
  );
};

export const useFirebaseRecords = () => {
  const context = useContext(FirebaseRecordsContext);
  if (!context) {
    throw new Error('useFirebaseRecords must be used within a FirebaseRecordsProvider');
  }
  return context;
};