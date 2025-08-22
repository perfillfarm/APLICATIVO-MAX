import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';

export interface UserData {
  profile: any;
  records: any[];
  settings: any;
  auth: any;
  metadata: {
    version: string;
    exportDate: string;
    deviceInfo: string;
  };
}

export class DataManager {
  private static readonly STORAGE_KEYS = {
    USER_PROFILE: 'userProfile',
    DAILY_RECORDS: 'dailyRecords',
    APP_SETTINGS: 'appSettings',
    USER_AUTH: 'user',
    AUTH_TOKEN: 'authToken',
    APP_THEME: 'appTheme',
    APP_LANGUAGE: 'appLanguage',
  };

  private static readonly CURRENT_VERSION = '1.0.0';

  /**
   * Exporta todos os dados do usuário
   */
  static async exportUserData(): Promise<string> {
    try {
      const data: UserData = {
        profile: await this.getStorageItem(this.STORAGE_KEYS.USER_PROFILE),
        records: await this.getStorageItem(this.STORAGE_KEYS.DAILY_RECORDS) || [],
        settings: {
          appSettings: await this.getStorageItem(this.STORAGE_KEYS.APP_SETTINGS),
          theme: await this.getStorageItem(this.STORAGE_KEYS.APP_THEME),
          language: await this.getStorageItem(this.STORAGE_KEYS.APP_LANGUAGE),
        },
        auth: {
          user: await this.getStorageItem(this.STORAGE_KEYS.USER_AUTH),
          token: await this.getStorageItem(this.STORAGE_KEYS.AUTH_TOKEN),
        },
        metadata: {
          version: this.CURRENT_VERSION,
          exportDate: new Date().toISOString(),
          deviceInfo: 'MaxTestorin Tracker',
        },
      };

      return JSON.stringify(data, null, 2);
    } catch (error) {
      console.error('Error exporting data:', error);
      throw new Error('Failed to export data');
    }
  }

  /**
   * Importa dados do usuário
   */
  static async importUserData(jsonData: string): Promise<void> {
    try {
      const data: UserData = JSON.parse(jsonData);
      
      // Validar estrutura dos dados
      this.validateImportData(data);

      // Importar dados
      if (data.profile) {
        await this.setStorageItem(this.STORAGE_KEYS.USER_PROFILE, data.profile);
      }

      if (data.records && Array.isArray(data.records)) {
        await this.setStorageItem(this.STORAGE_KEYS.DAILY_RECORDS, data.records);
      }

      if (data.settings) {
        if (data.settings.appSettings) {
          await this.setStorageItem(this.STORAGE_KEYS.APP_SETTINGS, data.settings.appSettings);
        }
        if (data.settings.theme) {
          await this.setStorageItem(this.STORAGE_KEYS.APP_THEME, data.settings.theme);
        }
        if (data.settings.language) {
          await this.setStorageItem(this.STORAGE_KEYS.APP_LANGUAGE, data.settings.language);
        }
      }

      if (data.auth) {
        if (data.auth.user) {
          await this.setStorageItem(this.STORAGE_KEYS.USER_AUTH, data.auth.user);
        }
        if (data.auth.token) {
          await this.setStorageItem(this.STORAGE_KEYS.AUTH_TOKEN, data.auth.token);
        }
      }

    } catch (error) {
      console.error('Error importing data:', error);
      throw new Error('Failed to import data. Please check the file format.');
    }
  }

  /**
   * Cria backup em arquivo
   */
  static async createBackupFile(): Promise<string> {
    try {
      const data = await this.exportUserData();
      const fileName = `MaxTestorin_Backup_${new Date().toISOString().split('T')[0]}.json`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;
      
      await FileSystem.writeAsStringAsync(fileUri, data);
      return fileUri;
    } catch (error) {
      console.error('Error creating backup file:', error);
      throw new Error('Failed to create backup file');
    }
  }

  /**
   * Compartilha arquivo de backup
   */
  static async shareBackup(): Promise<void> {
    try {
      const fileUri = await this.createBackupFile();
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/json',
          dialogTitle: 'Share MaxTestorin Backup',
        });
      } else {
        throw new Error('Sharing is not available on this device');
      }
    } catch (error) {
      console.error('Error sharing backup:', error);
      throw new Error('Failed to share backup');
    }
  }

  /**
   * Seleciona e importa arquivo de backup
   */
  static async selectAndImportBackup(): Promise<void> {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const fileContent = await FileSystem.readAsStringAsync(result.assets[0].uri);
        await this.importUserData(fileContent);
      } else {
        throw new Error('No file selected');
      }
    } catch (error) {
      console.error('Error importing backup:', error);
      throw new Error('Failed to import backup file');
    }
  }

  /**
   * Limpa todos os dados
   */
  static async clearAllData(): Promise<void> {
    try {
      const keys = Object.values(this.STORAGE_KEYS);
      await AsyncStorage.multiRemove(keys);
    } catch (error) {
      console.error('Error clearing data:', error);
      throw new Error('Failed to clear data');
    }
  }

  /**
   * Valida integridade dos dados
   */
  static async validateDataIntegrity(): Promise<boolean> {
    try {
      const profile = await this.getStorageItem(this.STORAGE_KEYS.USER_PROFILE);
      const records = await this.getStorageItem(this.STORAGE_KEYS.DAILY_RECORDS);
      
      // Validações básicas
      if (records && !Array.isArray(records)) {
        return false;
      }

      if (profile && typeof profile !== 'object') {
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error validating data integrity:', error);
      return false;
    }
  }

  /**
   * Migra dados para nova versão
   */
  static async migrateData(fromVersion: string, toVersion: string): Promise<void> {
    try {
      // Implementar migrações específicas conforme necessário
      console.log(`Migrating data from ${fromVersion} to ${toVersion}`);
      
      // Exemplo de migração
      if (fromVersion === '0.9.0' && toVersion === '1.0.0') {
        // Migrar estrutura de dados se necessário
      }
    } catch (error) {
      console.error('Error migrating data:', error);
      throw new Error('Failed to migrate data');
    }
  }

  /**
   * Comprime dados para economizar espaço
   */
  static async compressData(data: any): Promise<string> {
    try {
      // Implementação básica de compressão
      const jsonString = JSON.stringify(data);
      
      // Remover espaços desnecessários e otimizar
      return jsonString.replace(/\s+/g, ' ').trim();
    } catch (error) {
      console.error('Error compressing data:', error);
      return JSON.stringify(data);
    }
  }

  /**
   * Obtém estatísticas de uso de armazenamento
   */
  static async getStorageStats(): Promise<{
    totalSize: number;
    itemCount: number;
    breakdown: Record<string, number>;
  }> {
    try {
      const keys = Object.values(this.STORAGE_KEYS);
      const breakdown: Record<string, number> = {};
      let totalSize = 0;
      let itemCount = 0;

      for (const key of keys) {
        try {
          const value = await AsyncStorage.getItem(key);
          if (value) {
            const size = new Blob([value]).size;
            breakdown[key] = size;
            totalSize += size;
            itemCount++;
          }
        } catch (error) {
          breakdown[key] = 0;
        }
      }

      return {
        totalSize,
        itemCount,
        breakdown,
      };
    } catch (error) {
      console.error('Error getting storage stats:', error);
      return {
        totalSize: 0,
        itemCount: 0,
        breakdown: {},
      };
    }
  }

  // Métodos auxiliares privados
  private static async getStorageItem(key: string): Promise<any> {
    try {
      const value = await AsyncStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error(`Error getting storage item ${key}:`, error);
      return null;
    }
  }

  private static async setStorageItem(key: string, value: any): Promise<void> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting storage item ${key}:`, error);
      throw error;
    }
  }

  private static validateImportData(data: UserData): void {
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid data format');
    }

    if (data.records && !Array.isArray(data.records)) {
      throw new Error('Invalid records format');
    }

    if (data.metadata && !data.metadata.version) {
      throw new Error('Missing version information');
    }
  }
}