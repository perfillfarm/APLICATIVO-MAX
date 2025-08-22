import { supabase } from '@/config/supabase';

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
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/login`,
      });

      if (error) throw error;
      
      console.log(`✅ [PasswordRecovery] Password reset email sent successfully to: ${email}`);
      
      return {
        success: true,
        message: 'Password reset email sent successfully'
      };
    } catch (error: any) {
      console.error('❌ [PasswordRecovery] Error sending password reset email:', error);
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
   * Verifica se email existe no sistema
   */
  static async checkEmailExists(email: string): Promise<boolean> {
    try {
      // Try to send reset email - if no error, email exists
      await this.sendPasswordResetEmail(email);
      return true;
    } catch (error: any) {
      if (error.message?.includes('User not found')) {
        return false;
      }
      // For other errors, assume email exists
      return true;
    }
  }

  /**
   * Limpa cache de autenticação
   */
  static async clearAuthCache(): Promise<void> {
    try {
      console.log('🧹 [PasswordRecovery] Clearing auth cache');
      
      if (typeof window !== 'undefined') {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
          if (key.startsWith('supabase.') || key.startsWith('sb-')) {
            localStorage.removeItem(key);
          }
        });
        
        sessionStorage.clear();
      }
      
      console.log('✅ [PasswordRecovery] Auth cache cleared');
    } catch (error) {
      console.error('❌ [PasswordRecovery] Error clearing auth cache:', error);
    }
  }

  /**
   * Formata mensagens de erro do Supabase para o usuário
   */
  static formatSupabaseError(error: any): string {
    const message = error.message?.toLowerCase() || '';
    
    if (message.includes('user not found')) {
      return 'No account found with this email address.';
    }
    if (message.includes('invalid email')) {
      return 'Please enter a valid email address.';
    }
    if (message.includes('too many requests')) {
      return 'Too many password reset attempts. Please try again later.';
    }
    if (message.includes('network')) {
      return 'Network error. Please check your internet connection.';
    }
    if (message.includes('weak password')) {
      return 'Password is too weak. Please choose a stronger password.';
    }
    if (message.includes('email already registered')) {
      return 'This email is already registered. Please use a different email or try logging in.';
    }
    
    return 'An error occurred. Please try again.';
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
    };

    console.log(`📊 [PasswordRecovery] Audit log:`, logData);
  }
}