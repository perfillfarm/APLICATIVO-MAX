// Serviço de autenticação responsável pela persistência de dados
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FirebaseService } from './FirebaseService';

export interface AuthUser {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
}

export class AuthService {
  private static readonly USER_STORAGE_KEY = 'max_testorin_user';
  private static readonly AUTH_TOKEN_KEY = 'max_testorin_auth_token';

  /**
   * Salva os dados do usuário no armazenamento local
   */
  static async saveUser(user: AuthUser): Promise<void> {
    try {
      await AsyncStorage.setItem(this.USER_STORAGE_KEY, JSON.stringify(user));
      await AsyncStorage.setItem(this.AUTH_TOKEN_KEY, `token_${Date.now()}`);
      console.log('✅ [AuthService] User data saved to storage');
    } catch (error) {
      console.error('❌ [AuthService] Error saving user data:', error);
      throw error;
    }
  }

  /**
   * Recupera os dados do usuário do armazenamento local
   */
  static async getUser(): Promise<AuthUser | null> {
    try {
      const userData = await AsyncStorage.getItem(this.USER_STORAGE_KEY);
      const authToken = await AsyncStorage.getItem(this.AUTH_TOKEN_KEY);
      
      if (userData && authToken) {
        const user = JSON.parse(userData);
        console.log('✅ [AuthService] User data retrieved from storage');
        return user;
      }
      
      console.log('ℹ️ [AuthService] No user data found in storage');
      return null;
    } catch (error) {
      console.error('❌ [AuthService] Error retrieving user data:', error);
      return null;
    }
  }

  /**
   * Remove todos os dados de autenticação do armazenamento local
   */
  static async logout(): Promise<void> {
    try {
      console.log('🚪 [AuthService] Starting logout process...');
      
      // Logout do Firebase primeiro
      await FirebaseService.logoutUser();
      
      // Remover dados locais
      await AsyncStorage.multiRemove([
        this.USER_STORAGE_KEY,
        this.AUTH_TOKEN_KEY,
      ]);
      
      // Set logout flag for cross-tab synchronization
      if (typeof window !== 'undefined') {
        localStorage.setItem('logout', 'true');
        
        // Clear logout flag after a short delay
        setTimeout(() => {
          localStorage.removeItem('logout');
        }, 1000);
        
        // Limpar dados do Firebase do localStorage também
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
          if (key.startsWith('firebase:') || key.startsWith('firebaseui::')) {
            localStorage.removeItem(key);
          }
        });
        
        // Dispatch logout event
        window.dispatchEvent(new CustomEvent('logout'));
      }
      
      console.log('✅ [AuthService] Logout completed successfully');
    } catch (error) {
      console.error('❌ [AuthService] Error during logout:', error);
      // Mesmo com erro, garantir que dados locais sejam removidos
      try {
        await AsyncStorage.multiRemove([
          this.USER_STORAGE_KEY,
          this.AUTH_TOKEN_KEY,
        ]);
        
        // Force logout event even on error
        if (typeof window !== 'undefined') {
          // Clear Firebase data from localStorage even on error
          const keys = Object.keys(localStorage);
          keys.forEach(key => {
            if (key.startsWith('firebase:') || key.startsWith('firebaseui::')) {
              localStorage.removeItem(key);
            }
          });
          
          window.dispatchEvent(new CustomEvent('logout'));
        }
      } catch (storageError) {
        console.error('❌ [AuthService] Error clearing local storage:', storageError);
      }
      throw error;
    }
  }

  /**
   * Verifica se existe uma sessão válida
   */
  static async hasValidSession(): Promise<boolean> {
    try {
      const user = await this.getUser();
      return user !== null;
    } catch (error) {
      console.error('❌ [AuthService] Error checking session validity:', error);
      return false;
    }
  }

  /**
   * Limpa todos os dados da aplicação (para casos extremos)
   */
  static async clearAllData(): Promise<void> {
    try {
      console.log('🧹 [AuthService] Clearing all application data...');
      await AsyncStorage.clear();
      
      if (typeof window !== 'undefined') {
        localStorage.clear();
        sessionStorage.clear();
      }
      
      console.log('✅ [AuthService] All data cleared');
    } catch (error) {
      console.error('❌ [AuthService] Error clearing all data:', error);
      throw error;
    }
  }
}