import { sendPasswordResetEmail, confirmPasswordReset, verifyPasswordResetCode } from 'firebase/auth';
import { auth } from '@/config/firebase';

export interface PasswordResetResult {
  success: boolean;
  message: string;
}

export class PasswordRecoveryService {
  /**
   * Envia email de recuperação de senha
   */
  static async sendPasswordResetEmail(email: string): Promise<PasswordResetResult> {
    try {
      console.log(`🔐 [PasswordRecovery] Sending password reset email to: ${email}`);
      
      await sendPasswordResetEmail(auth, email, {
        url: window.location.origin + '/auth/login', // URL de retorno após reset
        handleCodeInApp: false, // Usar página web padrão do Firebase
      });
      
      console.log(`✅ [PasswordRecovery] Password reset email sent successfully to: ${email}`);
      
      return {
        success: true,
        message: 'Password reset email sent successfully'
      };
    } catch (error: any) {
      console.error('❌ [PasswordRecovery] Error sending password reset email:', error);
      
      // Log do erro específico para debugging
      console.error(`❌ [PasswordRecovery] Firebase error code: ${error.code}`);
      console.error(`❌ [PasswordRecovery] Firebase error message: ${error.message}`);
      
      throw error; // Re-throw para o componente tratar
    }
  }

  /**
   * Verifica se o código de reset é válido
   */
  static async verifyPasswordResetCode(code: string): Promise<string> {
    try {
      console.log(`🔍 [PasswordRecovery] Verifying password reset code`);
      
      const email = await verifyPasswordResetCode(auth, code);
      
      console.log(`✅ [PasswordRecovery] Password reset code verified for email: ${email}`);
      return email;
    } catch (error: any) {
      console.error('❌ [PasswordRecovery] Error verifying password reset code:', error);
      throw error;
    }
  }

  /**
   * Confirma o reset de senha com nova senha
   */
  static async confirmPasswordReset(code: string, newPassword: string): Promise<PasswordResetResult> {
    try {
      console.log(`🔐 [PasswordRecovery] Confirming password reset`);
      
      await confirmPasswordReset(auth, code, newPassword);
      
      console.log(`✅ [PasswordRecovery] Password reset confirmed successfully`);
      
      return {
        success: true,
        message: 'Password reset successfully'
      };
    } catch (error: any) {
      console.error('❌ [PasswordRecovery] Error confirming password reset:', error);
      throw error;
    }
  }

  /**
   * Valida força da senha
   */
  static validatePasswordStrength(password: string): {
    isValid: boolean;
    errors: string[];
    strength: 'weak' | 'medium' | 'strong';
  } {
    const errors: string[] = [];
    let score = 0;

    // Verificações básicas
    if (password.length < 6) {
      errors.push('Password must be at least 6 characters long');
    } else {
      score += 1;
    }

    if (password.length >= 8) {
      score += 1;
    }

    // Verificar se contém letras minúsculas
    if (/[a-z]/.test(password)) {
      score += 1;
    } else {
      errors.push('Password must contain lowercase letters');
    }

    // Verificar se contém letras maiúsculas
    if (/[A-Z]/.test(password)) {
      score += 1;
    }

    // Verificar se contém números
    if (/\d/.test(password)) {
      score += 1;
    }

    // Verificar se contém caracteres especiais
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      score += 1;
    }

    // Determinar força da senha
    let strength: 'weak' | 'medium' | 'strong';
    if (score <= 2) {
      strength = 'weak';
    } else if (score <= 4) {
      strength = 'medium';
    } else {
      strength = 'strong';
    }

    return {
      isValid: errors.length === 0 && password.length >= 6,
      errors,
      strength
    };
  }

  /**
   * Gera sugestões de senha segura
   */
  static generatePasswordSuggestions(): string[] {
    const adjectives = ['Quick', 'Bright', 'Swift', 'Smart', 'Bold', 'Calm'];
    const nouns = ['Tiger', 'Eagle', 'River', 'Mountain', 'Ocean', 'Forest'];
    const numbers = Math.floor(Math.random() * 999) + 100;
    const symbols = ['!', '@', '#', '$', '%'];
    
    const suggestions: string[] = [];
    
    for (let i = 0; i < 3; i++) {
      const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
      const noun = nouns[Math.floor(Math.random() * nouns.length)];
      const symbol = symbols[Math.floor(Math.random() * symbols.length)];
      const num = Math.floor(Math.random() * 99) + 10;
      
      suggestions.push(`${adjective}${noun}${num}${symbol}`);
    }
    
    return suggestions;
  }

  /**
   * Verifica se email existe no sistema (para UX melhor)
   */
  static async checkEmailExists(email: string): Promise<boolean> {
    try {
      // Tentar enviar email de reset - se não der erro, email existe
      await sendPasswordResetEmail(auth, email);
      return true;
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        return false;
      }
      // Para outros erros, assumir que email existe
      return true;
    }
  }

  /**
   * Limpa cache de autenticação (útil após reset de senha)
   */
  static async clearAuthCache(): Promise<void> {
    try {
      console.log('🧹 [PasswordRecovery] Clearing auth cache');
      
      // Limpar localStorage relacionado ao Firebase
      if (typeof window !== 'undefined') {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
          if (key.startsWith('firebase:') || key.startsWith('firebaseui::')) {
            localStorage.removeItem(key);
          }
        });
        
        // Limpar sessionStorage também
        sessionStorage.clear();
      }
      
      console.log('✅ [PasswordRecovery] Auth cache cleared');
    } catch (error) {
      console.error('❌ [PasswordRecovery] Error clearing auth cache:', error);
    }
  }

  /**
   * Formata mensagens de erro do Firebase para o usuário
   */
  static formatFirebaseError(error: any): string {
    switch (error.code) {
      case 'auth/user-not-found':
        return 'No account found with this email address.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/too-many-requests':
        return 'Too many password reset attempts. Please try again later.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your internet connection.';
      case 'auth/weak-password':
        return 'Password is too weak. Please choose a stronger password.';
      case 'auth/expired-action-code':
        return 'Password reset link has expired. Please request a new one.';
      case 'auth/invalid-action-code':
        return 'Invalid or expired password reset link.';
      case 'auth/user-disabled':
        return 'This account has been disabled. Please contact support.';
      default:
        return 'An error occurred. Please try again.';
    }
  }

  /**
   * Log de auditoria para recuperação de senha
   */
  static logPasswordRecoveryAttempt(email: string, success: boolean, errorCode?: string): void {
    const logData = {
      timestamp: new Date().toISOString(),
      email: email.toLowerCase(),
      success,
      errorCode,
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown',
      ip: 'client-side', // Em produção, isso seria capturado no backend
    };

    console.log(`📊 [PasswordRecovery] Audit log:`, logData);
    
    // Em produção, você enviaria isso para um serviço de analytics
    // Analytics.track('password_recovery_attempt', logData);
  }
}