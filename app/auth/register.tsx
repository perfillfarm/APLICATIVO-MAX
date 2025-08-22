import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mail, Lock, Eye, EyeOff, UserPlus, User, ArrowLeft, Droplets } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext';
import { router } from 'expo-router';
import Animated, { FadeInDown, FadeInUp, FadeIn } from 'react-native-reanimated';

export default function RegisterScreen() {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const { register, loading } = useFirebaseAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [registerError, setRegisterError] = useState<string>('');

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'nameRequired';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'nameMinLength';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'emailRequired';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'emailInvalid';
    }
    
    if (!formData.password.trim()) {
      newErrors.password = 'passwordRequired';
    } else if (formData.password.length < 6) {
      newErrors.password = 'passwordMinLength';
    }
    
    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'confirmPasswordRequired';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'passwordsDoNotMatch';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;
    
    try {
      setRegisterError(''); // Limpar erro anterior
      const success = await register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });
      
      if (success) {
        router.replace('/(tabs)');
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      
      // Mapear erros específicos do Firebase
      let errorMessage = '';
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          setErrors({ email: 'emailAlreadyExists' });
          errorMessage = 'This email is already registered. Please use a different email or try logging in.';
          break;
        case 'auth/invalid-email':
          setErrors({ email: 'emailInvalid' });
          errorMessage = 'Please enter a valid email address.';
          break;
        case 'auth/weak-password':
          setErrors({ password: 'passwordTooWeak' });
          errorMessage = 'Password is too weak. Please use at least 6 characters with a mix of letters and numbers.';
          break;
        case 'auth/operation-not-allowed':
          errorMessage = 'Email/password accounts are not enabled. Please contact support.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your internet connection and try again.';
          break;
        default:
          errorMessage = 'Registration failed. Please try again.';
          break;
      }
      
      setRegisterError(errorMessage);
    }
  };

  const navigateToLogin = () => {
    router.back();
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
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
            <TouchableOpacity 
              style={[styles.backButton, { backgroundColor: 'rgba(220, 38, 38, 0.1)' }]}
              onPress={navigateToLogin}
            >
              <ArrowLeft size={24} color="#e40f11" />
            </TouchableOpacity>
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
                Create Account
              </Text>
            </Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
              Sign up to get started
            </Text>
          </Animated.View>

          {/* Form */}
          <Animated.View entering={FadeInDown.delay(400)} style={styles.form}>
            {/* Name Input */}
            <View style={styles.inputContainer}>
              <View style={[styles.inputWrapper, { 
                backgroundColor: theme.colors.card,
                borderColor: errors.name ? '#DC2626' : '#fecaca'
              }]}>
                <User size={20} color="#e40f11" />
                <TextInput
                  style={[styles.input, { color: theme.colors.text }]}
                  placeholder="Full Name"
                  placeholderTextColor={theme.colors.textSecondary}
                  value={formData.name}
                  onChangeText={(value) => updateFormData('name', value)}
                  autoCapitalize="words"
                  autoCorrect={false}
                  editable={!loading}
                />
              </View>
              {errors.name && (
                <Text style={[styles.errorText, { color: theme.colors.error }]}>
                  {errors.name === 'nameRequired' ? 'Name is required' : 
                   errors.name === 'nameMinLength' ? 'Name must be at least 2 characters' : errors.name}
                </Text>
              )}
            </View>

            {/* Email Input */}
            <View style={styles.inputContainer}>
              <View style={[styles.inputWrapper, { 
                backgroundColor: theme.colors.card,
                borderColor: errors.email ? '#DC2626' : '#fecaca'
              }]}>
                <Mail size={20} color="#e40f11" />
                <TextInput
                  style={[styles.input, { color: theme.colors.text }]}
                  placeholder="Email"
                  placeholderTextColor={theme.colors.textSecondary}
                  value={formData.email}
                  onChangeText={(value) => updateFormData('email', value)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!loading}
                />
              </View>
              {errors.email && (
                <Text style={[styles.errorText, { color: theme.colors.error }]}>
                  {errors.email === 'emailRequired' ? 'Email is required' : 
                   errors.email === 'emailInvalid' ? 'Invalid email' : 
                   errors.email === 'emailAlreadyExists' ? 'This email is already registered' : errors.email}
                </Text>
              )}
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <View style={[styles.inputWrapper, { 
                backgroundColor: theme.colors.card,
                borderColor: errors.password ? '#DC2626' : '#fecaca'
              }]}>
                <Lock size={20} color="#e40f11" />
                <TextInput
                  style={[styles.input, { color: theme.colors.text }]}
                  placeholder="Password"
                  placeholderTextColor={theme.colors.textSecondary}
                  value={formData.password}
                  onChangeText={(value) => updateFormData('password', value)}
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
                    <EyeOff size={20} color={theme.colors.textSecondary} />
                  ) : (
                    <Eye size={20} color={theme.colors.textSecondary} />
                  )}
                </TouchableOpacity>
              </View>
              {errors.password && (
                <Text style={[styles.errorText, { color: theme.colors.error }]}>
                  {errors.password === 'passwordRequired' ? 'Password is required' : 
                   errors.password === 'passwordMinLength' ? 'Password must be at least 6 characters' : 
                   errors.password === 'passwordTooWeak' ? 'Password is too weak' : errors.password}
                </Text>
              )}
            </View>

            {/* Confirm Password Input */}
            <View style={styles.inputContainer}>
              <View style={[styles.inputWrapper, { 
                backgroundColor: theme.colors.card,
                borderColor: errors.confirmPassword ? '#DC2626' : '#fecaca'
              }]}>
                <Lock size={20} color="#e40f11" />
                <TextInput
                  style={[styles.input, { color: theme.colors.text }]}
                  placeholder="Confirm Password"
                  placeholderTextColor={theme.colors.textSecondary}
                  value={formData.confirmPassword}
                  onChangeText={(value) => updateFormData('confirmPassword', value)}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!loading}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.eyeButton}
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} color={theme.colors.textSecondary} />
                  ) : (
                    <Eye size={20} color={theme.colors.textSecondary} />
                  )}
                </TouchableOpacity>
              </View>
              {errors.confirmPassword && (
                <Text style={[styles.errorText, { color: theme.colors.error }]}>
                  {errors.confirmPassword === 'confirmPasswordRequired' ? 'Password confirmation is required' : 
                   errors.confirmPassword === 'passwordsDoNotMatch' ? 'Passwords do not match' : errors.confirmPassword}
                </Text>
              )}
            </View>

            {/* General Error Message */}
            {registerError && (
              <View style={[styles.generalErrorContainer, { 
                backgroundColor: 'rgba(220, 38, 38, 0.1)',
                borderColor: 'rgba(220, 38, 38, 0.3)'
              }]}>
                <Text style={[styles.generalErrorText, { color: '#DC2626' }]}>
                  {registerError}
                </Text>
              </View>
            )}

            {/* Register Button */}
            <TouchableOpacity
              style={[
                styles.registerButton,
                { opacity: loading ? 0.7 : 1,
                  backgroundColor: '#e40f11' }
              ]}
              onPress={handleRegister}
              disabled={loading}
            >
              <Droplets size={20} color="#ffffff" />
              <Text style={styles.registerButtonText}>
                {loading ? 'Creating account...' : 'Create Account'}
              </Text>
            </TouchableOpacity>

            {/* Login Link */}
            <View style={styles.loginContainer}>
              <Text style={[styles.loginText, { color: theme.colors.textSecondary }]}>
                Already have an account?
              </Text>
              <TouchableOpacity 
                onPress={navigateToLogin} 
                disabled={loading}
                style={styles.loginLinkButton}
              >
                <Text style={styles.loginLink}>
                  Sign In
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
          
          {/* Footer Brand */}
          <Animated.View entering={FadeIn.delay(1000)} style={styles.footerBrand}>
            <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>
              Powered by MaxTestorin
            </Text>
            <View style={styles.footerDots}>
              <View style={[styles.dot, { backgroundColor: '#e40f11' }]} />
              <View style={[styles.dot, { backgroundColor: '#fecaca' }]} />
              <View style={[styles.dot, { backgroundColor: '#e40f11' }]} />
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
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
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
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
    fontSize: 30,
    fontWeight: '800',
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 17,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 8,
  },
  taglineContainer: {
    marginTop: 8,
    paddingHorizontal: 20,
  },
  tagline: {
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
    opacity: 0.8,
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
  registerButton: {
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
  registerButtonText: {
    color: '#ffffff',
    fontSize: 19,
    fontWeight: '700',
    marginLeft: 12,
    letterSpacing: 0.5,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
  },
  loginText: {
    fontSize: 17,
    marginRight: 8,
  },
  loginLinkButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  loginLink: {
    fontSize: 17,
    fontWeight: '700',
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
  languageToggle: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 1000,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  generalErrorContainer: {
    marginTop: 16,
    marginBottom: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  generalErrorText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 20,
  },
});