import React, { createContext, useContext, useState, useEffect } from 'react';
import { SupabaseService } from '@/services/SupabaseService';
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext';
import { DailyRecord } from '@/types/database';

interface FirebaseRecordsContextData {
  records: DailyRecord[];
  loading: boolean;
  error: string | null;
  syncStatus: 'synced' | 'syncing' | 'error';
  createRecord: (recordData: Omit<DailyRecord, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
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

    console.log(`🔥 [RecordsContext] Setting up listener for user ${user.id}`);
    setLoading(true);
    
    // Subscribe to real-time updates
    const subscription = SupabaseService.subscribeToDailyRecords(user.id, (newRecords) => {
      console.log(`📊 [RecordsContext] Records updated: ${newRecords.length} records`);
      
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
      
      setTimeout(() => {
        console.log(`✅ [RecordsContext] Records propagated to components - Total: ${newRecords.length}`);
      }, 100);
    });

    return () => {
      console.log(`🔥 [RecordsContext] Cleaning up listener for user ${user.id}`);
      subscription?.unsubscribe();
    };
  }, [user]);

  const createRecord = async (recordData: Omit<DailyRecord, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) throw new Error('No authenticated user');
    
    try {
      setSyncStatus('syncing');
      console.log(`📝 [RecordsContext] Creating record for ${recordData.date}`);
      
      await SupabaseService.createDailyRecord({
        ...recordData,
        user_id: user.id,
      });
      
      console.log(`✅ [RecordsContext] Record created successfully for ${recordData.date}`);
    } catch (error) {
      setSyncStatus('error');
      console.error('❌ [RecordsContext] Error creating record:', error);
      throw error;
    }
  };

  const updateRecord = async (recordId: string, updates: Partial<DailyRecord>) => {
    try {
      setSyncStatus('syncing');
      console.log(`📝 [RecordsContext] Updating record ${recordId}`);
      
      await SupabaseService.updateDailyRecord(recordId, updates);
      
      console.log(`✅ [RecordsContext] Record updated successfully: ${recordId}`);
      setSyncStatus('synced');
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
      
      await SupabaseService.deleteDailyRecord(recordId);
      
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
      console.log(`🔍 [RecordsContext] Searching record for ${date}`);
      
      // First try to find in loaded records
      const existingRecord = records.find(r => r.date === date);
      if (existingRecord) {
        console.log(`✅ [RecordsContext] Record found locally for ${date}`);
        return existingRecord;
      }
      
      // If not found, search in Supabase
      const supabaseRecord = await SupabaseService.getDailyRecordByDate(user.id, date);
      if (supabaseRecord) {
        console.log(`✅ [RecordsContext] Record found in Supabase for ${date}`);
      } else {
        console.log(`ℹ️ [RecordsContext] No record found in Supabase for ${date}`);
      }
      return supabaseRecord;
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
      
      const freshRecords = await SupabaseService.getDailyRecords(user.id);
      
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