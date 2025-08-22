import AsyncStorage from '@react-native-async-storage/async-storage';
import { FirebaseService } from '@/services/FirebaseService';
import { Alert } from 'react-native';

export class FirebaseMigration {
  private static readonly MIGRATION_KEY = 'firebase_migration_completed';
  private static readonly BACKUP_KEY = 'local_data_backup';

  /**
   * Check if migration has been completed
   */
  static async isMigrationCompleted(): Promise<boolean> {
    try {
      const migrationFlag = await AsyncStorage.getItem(this.MIGRATION_KEY);
      return migrationFlag === 'true';
    } catch (error) {
      console.error('Error checking migration status:', error);
      return false;
    }
  }

  /**
   * Create backup of local data before migration
   */
  static async createLocalBackup(): Promise<void> {
    try {
      const localData = {
        dailyRecords: await AsyncStorage.getItem('dailyRecords'),
        userProfile: await AsyncStorage.getItem('userProfile'),
        appSettings: await AsyncStorage.getItem('appSettings'),
        appTheme: await AsyncStorage.getItem('appTheme'),
        appLanguage: await AsyncStorage.getItem('appLanguage'),
        timestamp: new Date().toISOString(),
      };

      await AsyncStorage.setItem(this.BACKUP_KEY, JSON.stringify(localData));
      console.log('✅ Local data backup created');
    } catch (error) {
      console.error('❌ Error creating local backup:', error);
      throw error;
    }
  }

  /**
   * Migrate all local data to Firebase
   */
  static async migrateToFirebase(userId: string): Promise<void> {
    try {
      console.log('🚀 Starting migration to Firebase...');

      // Create backup first
      await this.createLocalBackup();

      // Get all local data
      const localData = await this.getAllLocalData();

      // Migrate to Firebase
      await FirebaseService.migrateFromAsyncStorage(userId, localData);

      // Mark migration as completed
      await AsyncStorage.setItem(this.MIGRATION_KEY, 'true');

      console.log('✅ Migration to Firebase completed successfully');
    } catch (error) {
      console.error('❌ Error during migration:', error);
      throw error;
    }
  }

  /**
   * Get all local data from AsyncStorage
   */
  private static async getAllLocalData(): Promise<any> {
    try {
      const keys = [
        'dailyRecords',
        'userProfile',
        'appSettings',
        'appTheme',
        'appLanguage',
        'currentUser',
        'authToken',
      ];

      const localData: any = {};

      for (const key of keys) {
        const value = await AsyncStorage.getItem(key);
        if (value) {
          localData[key] = value;
        }
      }

      return localData;
    } catch (error) {
      console.error('Error getting local data:', error);
      throw error;
    }
  }

  /**
   * Restore local data from backup
   */
  static async restoreFromBackup(): Promise<void> {
    try {
      const backupData = await AsyncStorage.getItem(this.BACKUP_KEY);
      
      if (!backupData) {
        throw new Error('No backup data found');
      }

      const backup = JSON.parse(backupData);

      // Restore each item
      for (const [key, value] of Object.entries(backup)) {
        if (key !== 'timestamp' && value) {
          await AsyncStorage.setItem(key, value as string);
        }
      }

      console.log('✅ Data restored from backup');
    } catch (error) {
      console.error('❌ Error restoring from backup:', error);
      throw error;
    }
  }

  /**
   * Clear all local data (after successful migration)
   */
  static async clearLocalData(): Promise<void> {
    try {
      const keysToKeep = [
        this.MIGRATION_KEY,
        this.BACKUP_KEY,
        'appTheme',
        'appLanguage',
      ];

      const allKeys = await AsyncStorage.getAllKeys();
      const keysToRemove = allKeys.filter(key => !keysToKeep.includes(key));

      await AsyncStorage.multiRemove(keysToRemove);
      console.log('✅ Local data cleared (keeping essential keys)');
    } catch (error) {
      console.error('❌ Error clearing local data:', error);
      throw error;
    }
  }

  /**
   * Reset migration status (for testing purposes)
   */
  static async resetMigrationStatus(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.MIGRATION_KEY);
      console.log('✅ Migration status reset');
    } catch (error) {
      console.error('❌ Error resetting migration status:', error);
      throw error;
    }
  }

  /**
   * Get migration statistics
   */
  static async getMigrationStats(): Promise<{
    isCompleted: boolean;
    hasBackup: boolean;
    backupDate?: string;
    localDataSize: number;
  }> {
    try {
      const isCompleted = await this.isMigrationCompleted();
      const backupData = await AsyncStorage.getItem(this.BACKUP_KEY);
      const hasBackup = !!backupData;
      
      let backupDate: string | undefined;
      if (hasBackup) {
        const backup = JSON.parse(backupData!);
        backupDate = backup.timestamp;
      }

      // Calculate local data size
      const allKeys = await AsyncStorage.getAllKeys();
      let localDataSize = 0;
      
      for (const key of allKeys) {
        const value = await AsyncStorage.getItem(key);
        if (value) {
          localDataSize += new Blob([value]).size;
        }
      }

      return {
        isCompleted,
        hasBackup,
        backupDate,
        localDataSize,
      };
    } catch (error) {
      console.error('Error getting migration stats:', error);
      return {
        isCompleted: false,
        hasBackup: false,
        localDataSize: 0,
      };
    }
  }

  /**
   * Interactive migration with user confirmation
   */
  static async interactiveMigration(userId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      Alert.alert(
        '🔄 Migrate to Firebase',
        'Would you like to migrate your local data to Firebase? This will:\n\n• Sync your data across devices\n• Provide automatic backups\n• Enable real-time updates\n\nYour local data will be backed up first.',
        [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => reject(new Error('Migration cancelled by user')),
          },
          {
            text: 'Migrate',
            style: 'default',
            onPress: async () => {
              try {
                await this.migrateToFirebase(userId);
                
                Alert.alert(
                  '✅ Migration Complete',
                  'Your data has been successfully migrated to Firebase!',
                  [{ text: 'OK', onPress: () => resolve() }]
                );
              } catch (error) {
                Alert.alert(
                  '❌ Migration Failed',
                  'Failed to migrate data. Your local data is safe and backed up.',
                  [{ text: 'OK', onPress: () => reject(error) }]
                );
              }
            },
          },
        ]
      );
    });
  }
}