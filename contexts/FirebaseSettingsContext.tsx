import React, { createContext, useContext, useState, useEffect } from 'react';
import { SupabaseService } from '@/services/SupabaseService';
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext';
import { UserSettings } from '@/types/database';

interface FirebaseSettingsContextData {
  settings: UserSettings | null;
  loading: boolean;
  error: string | null;
  updateSettings: (updates: Partial<UserSettings>) => Promise<void>;
  refreshSettings: () => Promise<void>;
}

const FirebaseSettingsContext = createContext<FirebaseSettingsContextData>({} as FirebaseSettingsContextData);

export const FirebaseSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useFirebaseAuth();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setSettings(null);
      setLoading(false);
      return;
    }

    console.log(`⚙️ [SettingsContext] Loading settings for user ${user.id}`);
    loadSettings();
  }, [user]);

  const loadSettings = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      console.log(`⚙️ [SettingsContext] Fetching settings from Supabase`);
      
      const userSettings = await SupabaseService.getUserSettings(user.id);
      setSettings(userSettings);
      setError(null);
      
      console.log(`✅ [SettingsContext] Settings loaded successfully`);
    } catch (error) {
      console.error('❌ [SettingsContext] Error loading settings:', error);
      setError('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (updates: Partial<UserSettings>) => {
    if (!user) throw new Error('No authenticated user');
    
    try {
      console.log(`⚙️ [SettingsContext] Updating settings:`, updates);
      
      await SupabaseService.updateUserSettings(user.id, updates);
      setSettings(prev => prev ? { ...prev, ...updates } : null);
      
      console.log(`✅ [SettingsContext] Settings updated successfully`);
    } catch (error) {
      console.error('❌ [SettingsContext] Error updating settings:', error);
      throw error;
    }
  };

  const refreshSettings = async () => {
    console.log(`🔄 [SettingsContext] Manual settings refresh requested`);
    await loadSettings();
  };

  return (
    <FirebaseSettingsContext.Provider
      value={{
        settings,
        loading,
        error,
        updateSettings,
        refreshSettings,
      }}
    >
      {children}
    </FirebaseSettingsContext.Provider>
  );
};

export const useFirebaseSettings = () => {
  const context = useContext(FirebaseSettingsContext);
  if (!context) {
    throw new Error('useFirebaseSettings must be used within a FirebaseSettingsProvider');
  }
  return context;
};