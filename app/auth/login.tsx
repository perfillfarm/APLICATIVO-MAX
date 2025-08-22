import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, KeyboardAvoidingView, Platform, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mail, Lock, Eye, EyeOff, LogIn, UserPlus, Droplets } from 'lucide-react-native';
import { useLanguage } from '@/contexts/LanguageContext';
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext';
import { ForgotPasswordModal } from '@/components/auth/ForgotPasswordModal';
import { router } from 'expo-router';
import Animated, { FadeInDown, FadeInUp, FadeIn } from 'react-native-reanimated';

// Tema fixo para login (sempre claro)
const lightTheme = {
  colors: {
    background: '#ffffff',
    surface: '#ffffff',
    card: '#f8fafc',
    primary: '#e40f11',
    secondary: '#B91C1C',
    text: '#1e293b',
    textSecondary: '#64748b',
    border: '#e2e8f0',
    error: '#e40f11',
  }
};

export default function LoginScreen() {
  const { t } = useLanguage();
  const { login, loading } = useFirebaseAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [loginError, setLoginError] = useState<string>('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};
    
    if (!email.trim()) {
      newErrors.email = 'emailRequired';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'emailInvalid';
    }
    
    if (!password.trim()) {
      newErrors.password = 'passwordRequired';
    } else if (password.length < 6) {
      newErrors.password = 'passwordMinLength';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;
    
    try {
      setLoginError(''); // Limpar erro anterior
      const success = await login(email.trim(), password);
      if (success) {
        router.replace('/(tabs)');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Mapear erros específicos do Firebase
      let errorMessage = '';
      
      switch (error.code) {
        case 'auth/user-not-found':
          setErrors({ email: 'emailNotFound' });
          errorMessage = 'No account found with this email address.';
          break;
        case 'auth/wrong-password':
          setErrors({ password: 'wrongPassword' });
          errorMessage = 'Incorrect password. Please try again.';
          break;
        case 'auth/invalid-email':
          setErrors({ email: 'emailInvalid' });
          errorMessage = 'Please enter a valid email address.';
          break;
        case 'auth/invalid-credential':
          setErrors({ email: 'invalidCredentials', password: 'invalidCredentials' });
          errorMessage = 'Invalid email or password. Please check your credentials.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many failed attempts. Please try again later.';
          break;
        case 'auth/user-disabled':
          errorMessage = 'This account has been disabled. Please contact support.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your internet connection.';
          break;
        default:
          errorMessage = 'Login failed. Please try again.';
          break;
      }
      
      setLoginError(errorMessage);
    }
  };

  const navigateToRegister = () => {
    router.push('/auth/register');
  };

  const handleForgotPassword = () => {
    setShowForgotPassword(true);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: lightTheme.colors.background }]}>
      
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <Animated.View entering={FadeInUp.delay(200)} style={styles.header}>
            {/* MaxTestorin Logo */}
            <View style={styles.logoContainer}>
              <Image
                source={require('@/assets/images/LOGO-MAX.png')}
                style={styles.mainLogoImage}
                resizeMode="contain"
              />
            </View>
            <Text style={[styles.title, { color: '#DC2626' }]}>
              <Text style={[styles.title, { color: '#ec0000' }]}>
                Welcome Back!
              </Text>
            </Text>
            <Text style={[styles.subtitle, { color: lightTheme.colors.textSecondary }]}>
              Sign in to continue
            </Text>
          </Animated.View>

          {/* Form */}
          <Animated.View entering={FadeInDown.delay(400)} style={styles.form}>
            {/* Email Input */}
            <View style={styles.inputContainer}>
              <View style={[styles.inputWrapper, { 
                backgroundColor: lightTheme.colors.card,
                borderColor: errors.email ? lightTheme.colors.error : lightTheme.colors.border
              }]}>
                <Mail size={20} color="#e40f11" />
                <TextInput
                  style={[styles.input, { color: lightTheme.colors.text }]}
                  placeholder="Email"
                  placeholderTextColor={lightTheme.colors.textSecondary}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!loading}
                />
              </View>
              {errors.email && (
                <Text style={[styles.errorText, { color: lightTheme.colors.error }]}>
                  {errors.email === 'emailRequired' ? 'Email is required' : 
                   errors.email === 'emailInvalid' ? 'Invalid email' : errors.email}
                </Text>
              )}
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <View style={[styles.inputWrapper, { 
                backgroundColor: lightTheme.colors.card,
                borderColor: errors.password ? lightTheme.colors.error : lightTheme.colors.border
              }]}>
                <Lock size={20} color="#e40f11" />
                <TextInput
                  style={[styles.input, { color: lightTheme.colors.text }]}
                  placeholder="Password"
                  placeholderTextColor={lightTheme.colors.textSecondary}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!loading}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeButton}
                >
                  {showPassword ? (
                    <EyeOff size={20} color={lightTheme.colors.textSecondary} />
                  ) : (
                    <Eye size={20} color={lightTheme.colors.textSecondary} />
                  )}
                </TouchableOpacity>
              </View>
              {errors.password && (
                <Text style={[styles.errorText, { color: lightTheme.colors.error }]}>
                  {errors.password === 'passwordRequired' ? 'Password is required' : 
                   errors.password === 'passwordMinLength' ? 'Password must be at least 6 characters' : errors.password}
                </Text>
              )}
            </View>

            {/* Login Button */}
            <TouchableOpacity
              style={[
                styles.loginButton,
                { opacity: loading ? 0.7 : 1,
                  backgroundColor: '#e40f11' }
              ]}
              onPress={handleLogin}
              disabled={loading}
            >
              <Droplets size={20} color="#ffffff" />
              <Text style={styles.loginButtonText}>
                {loading ? 'Signing in...' : 'Sign In'}
              </Text>
            </TouchableOpacity>

            {/* Forgot Password Link */}
            <TouchableOpacity 
              style={styles.forgotPasswordContainer}
              onPress={handleForgotPassword}
              disabled={loading}
            >
              <Text style={styles.forgotPasswordText}>
                {t('forgotPassword')}
              </Text>
            </TouchableOpacity>
            {/* Register Link */}
            <View style={styles.registerContainer}>
              <Text style={[styles.registerText, { color: lightTheme.colors.textSecondary }]}>
                Don't have an account?
              </Text>
              <TouchableOpacity 
                onPress={navigateToRegister} 
                disabled={loading}
                style={styles.registerLinkButton}
              >
                <Text style={styles.registerLink}>
                  Sign Up
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
          
          {/* Footer Brand */}
          <Animated.View entering={FadeIn.delay(1000)} style={styles.footerBrand}>
            <Text style={[styles.footerText, { color: lightTheme.colors.textSecondary }]}>
              Powered by MaxTestorin
            </Text>
            <View style={styles.footerDots}>
              <View style={[styles.dot, { backgroundColor: '#DC2626' }]} />
              <View style={[styles.dot, { backgroundColor: '#fca5a5' }]} />
              <View style={[styles.dot, { backgroundColor: '#DC2626' }]} />
            </View>
          </Animated.View>

        </ScrollView>
      </KeyboardAvoidingView>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        visible={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  mainLogoImage: {
    width: 170,
    height: 120,
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 8,
  },
  taglineContainer: {
    marginTop: 8,
    paddingHorizontal: 20,
  },
  form: {
    marginBottom: 40,
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2.5,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  input: {
    flex: 1,
    fontSize: 17,
    paddingVertical: 18,
    paddingHorizontal: 16,
    fontWeight: '500',
    selectionColor: '#ffffff',
  },
  eyeButton: {
    padding: 12,
  },
  errorText: {
    fontSize: 13,
    marginTop: 8,
    marginLeft: 20,
    fontWeight: '500',
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    borderRadius: 20,
    marginTop: 16,
    backgroundColor: '#DC2626',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: 19,
    fontWeight: '700',
    marginLeft: 12,
    letterSpacing: 0.5,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
  },
  registerText: {
    fontSize: 17,
    marginRight: 8,
  },
  registerLinkButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  registerLink: {
    fontSize: 17,
    fontWeight: '700',
    color: '#e40f11',
    textDecorationLine: 'underline',
  },
  forgotPasswordContainer: {
    alignItems: 'center',
    marginTop: 16,
    paddingVertical: 8,
  },
  forgotPasswordText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#e40f11',
    textDecorationLine: 'underline',
  },
  footerBrand: {
    alignItems: 'center',
    marginTop: 40,
    paddingBottom: 20,
  },
  footerText: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 12,
  },
  footerDots: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4
  },
  generalErrorContainer: {
    marginTop: 16,
    marginBottom: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: 'rgba(220, 38, 38, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(220, 38, 38, 0.3)',
  },
  generalErrorText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 20,
  },
});