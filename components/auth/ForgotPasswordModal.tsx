import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Mail, X, ArrowLeft, CircleCheck as CheckCircle } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { PasswordRecoveryService } from '@/services/PasswordRecoveryService';
import Animated, { 
  FadeIn, 
  FadeOut, 
  SlideInDown, 
  SlideOutDown,
  useSharedValue,
  useAnimatedStyle,
  withSpring
} from 'react-native-reanimated';

interface ForgotPasswordModalProps {
  visible: boolean;
  onClose: () => void;
}

type ModalStep = 'email' | 'success' | 'error';

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  visible,
  onClose,
}) => {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<ModalStep>('email');
  const [error, setError] = useState<string>('');
  const buttonScale = useSharedValue(1);

  const resetModal = () => {
    setEmail('');
    setLoading(false);
    setCurrentStep('email');
    setError('');
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSendRecoveryEmail = async () => {
    if (!email.trim()) {
      setError(t('emailRequired'));
      return;
    }

    if (!validateEmail(email)) {
      setError(t('emailInvalid'));
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // Animate button press
      buttonScale.value = withSpring(0.95, { duration: 100 }, () => {
        buttonScale.value = withSpring(1, { duration: 200 });
      });

      await PasswordRecoveryService.sendPasswordResetEmail(email.trim());
      
      setCurrentStep('success');
    } catch (error: any) {
      console.error('Password recovery error:', error);
      
      // Handle specific Firebase errors
      let errorMessage = '';
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = t('emailNotFound');
          break;
        case 'auth/invalid-email':
          errorMessage = t('emailInvalid');
          break;
        case 'auth/too-many-requests':
          errorMessage = t('tooManyRequests');
          break;
        case 'auth/network-request-failed':
          errorMessage = t('networkError');
          break;
        default:
          errorMessage = t('passwordRecoveryError');
          break;
      }
      
      setError(errorMessage);
      setCurrentStep('error');
    } finally {
      setLoading(false);
    }
  };

  const buttonAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: buttonScale.value }],
    };
  });

  const renderEmailStep = () => (
    <Animated.View entering={FadeIn.duration(300)} style={styles.stepContainer}>
      {/* Header */}
      <View style={styles.modalHeader}>
        <View style={styles.titleSection}>
          <Mail size={24} color={theme.colors.primary} />
          <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
            {t('forgotPassword')}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.closeButton, { backgroundColor: theme.colors.background }]}
          onPress={handleClose}
        >
          <X size={20} color={theme.colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Description */}
      <View style={styles.descriptionContainer}>
        <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
          {t('forgotPasswordDescription')}
        </Text>
      </View>

      {/* Email Input */}
      <View style={styles.inputContainer}>
        <View style={[
          styles.inputWrapper,
          {
            backgroundColor: theme.colors.card,
            borderColor: error ? theme.colors.error : theme.colors.border,
          }
        ]}>
          <Mail size={20} color={theme.colors.primary} />
          <TextInput
            style={[styles.input, { color: theme.colors.text }]}
            placeholder={t('enterYourEmail')}
            placeholderTextColor={theme.colors.textSecondary}
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (error) setError('');
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
            autoFocus
          />
        </View>
        
        {error && (
          <Animated.View entering={FadeIn.duration(200)} style={styles.errorContainer}>
            <Text style={[styles.errorText, { color: theme.colors.error }]}>
              {error}
            </Text>
          </Animated.View>
        )}
      </View>

      {/* Send Button */}
      <Animated.View style={[styles.buttonContainer, buttonAnimatedStyle]}>
        <TouchableOpacity
          style={[
            styles.sendButton,
            {
              backgroundColor: theme.colors.primary,
              opacity: loading ? 0.7 : 1,
            }
          ]}
          onPress={handleSendRecoveryEmail}
          disabled={loading}
        >
          <Text style={styles.sendButtonText}>
            {loading ? t('sending') : t('sendRecoveryEmail')}
          </Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Back to Login */}
      <TouchableOpacity
        style={styles.backToLoginContainer}
        onPress={handleClose}
        disabled={loading}
      >
        <ArrowLeft size={16} color={theme.colors.textSecondary} />
        <Text style={[styles.backToLoginText, { color: theme.colors.textSecondary }]}>
          {t('backToLogin')}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderSuccessStep = () => (
    <Animated.View entering={FadeIn.duration(300)} style={styles.stepContainer}>
      {/* Header */}
      <View style={styles.modalHeader}>
        <View style={styles.titleSection}>
          <CheckCircle size={24} color={theme.colors.success} />
          <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
            {t('emailSent')}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.closeButton, { backgroundColor: theme.colors.background }]}
          onPress={handleClose}
        >
          <X size={20} color={theme.colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Success Message */}
      <View style={[styles.successContainer, { backgroundColor: theme.colors.success + '10' }]}>
        <CheckCircle size={48} color={theme.colors.success} />
        <Text style={[styles.successTitle, { color: theme.colors.success }]}>
          {t('recoveryEmailSent')}
        </Text>
        <Text style={[styles.successDescription, { color: theme.colors.text }]}>
          {t('checkEmailInstructions')}
        </Text>
        <Text style={[styles.emailSentTo, { color: theme.colors.textSecondary }]}>
          {t('sentTo')}: {email}
        </Text>
      </View>

      {/* Instructions */}
      <View style={styles.instructionsContainer}>
        <Text style={[styles.instructionsTitle, { color: theme.colors.text }]}>
          {t('nextSteps')}:
        </Text>
        <View style={styles.instructionsList}>
          <Text style={[styles.instructionItem, { color: theme.colors.textSecondary }]}>
            • {t('checkInboxSpam')}
          </Text>
          <Text style={[styles.instructionItem, { color: theme.colors.textSecondary }]}>
            • {t('clickResetLink')}
          </Text>
          <Text style={[styles.instructionItem, { color: theme.colors.textSecondary }]}>
            • {t('createNewPassword')}
          </Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.successButtonsContainer}>
        <TouchableOpacity
          style={[styles.resendButton, { 
            backgroundColor: theme.colors.background,
            borderColor: theme.colors.border 
          }]}
          onPress={() => {
            setCurrentStep('email');
            setError('');
          }}
        >
          <Text style={[styles.resendButtonText, { color: theme.colors.textSecondary }]}>
            {t('resendEmail')}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.doneButton, { backgroundColor: theme.colors.success }]}
          onPress={handleClose}
        >
          <Text style={styles.doneButtonText}>
            {t('done')}
          </Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  const renderErrorStep = () => (
    <Animated.View entering={FadeIn.duration(300)} style={styles.stepContainer}>
      {/* Header */}
      <View style={styles.modalHeader}>
        <View style={styles.titleSection}>
          <X size={24} color={theme.colors.error} />
          <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
            {t('errorOccurred')}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.closeButton, { backgroundColor: theme.colors.background }]}
          onPress={handleClose}
        >
          <X size={20} color={theme.colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Error Message */}
      <View style={[styles.errorStepContainer, { backgroundColor: theme.colors.error + '10' }]}>
        <X size={48} color={theme.colors.error} />
        <Text style={[styles.errorStepTitle, { color: theme.colors.error }]}>
          {t('couldNotSendEmail')}
        </Text>
        <Text style={[styles.errorStepDescription, { color: theme.colors.text }]}>
          {error}
        </Text>
      </View>

      {/* Retry Button */}
      <TouchableOpacity
        style={[styles.retryButton, { backgroundColor: theme.colors.primary }]}
        onPress={() => {
          setCurrentStep('email');
          setError('');
        }}
      >
        <Text style={styles.retryButtonText}>
          {t('tryAgain')}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'email':
        return renderEmailStep();
      case 'success':
        return renderSuccessStep();
      case 'error':
        return renderErrorStep();
      default:
        return renderEmailStep();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <View style={styles.modalContainer}>
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(150)}
          style={styles.overlay}
          onTouchEnd={handleClose}
        />
        
        <Animated.View
          entering={SlideInDown.springify().damping(15)}
          exiting={SlideOutDown.duration(200)}
          style={[styles.modalContent, { backgroundColor: theme.colors.card }]}
        >
          {renderCurrentStep()}
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    zIndex: 1000,
  },
  stepContainer: {
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  titleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginLeft: 12,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  descriptionContainer: {
    marginBottom: 24,
  },
  description: {
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 16,
    paddingHorizontal: 12,
    fontWeight: '500',
  },
  errorContainer: {
    marginTop: 8,
    paddingHorizontal: 16,
  },
  errorText: {
    fontSize: 14,
    fontWeight: '500',
  },
  buttonContainer: {
    marginBottom: 16,
  },
  sendButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  sendButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  backToLoginContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  backToLoginText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  successContainer: {
    alignItems: 'center',
    padding: 24,
    borderRadius: 16,
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  successDescription: {
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 12,
  },
  emailSentTo: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  instructionsContainer: {
    marginBottom: 24,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  instructionsList: {
    gap: 8,
  },
  instructionItem: {
    fontSize: 14,
    lineHeight: 20,
  },
  successButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  resendButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
  },
  resendButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  doneButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  doneButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  errorStepContainer: {
    alignItems: 'center',
    padding: 24,
    borderRadius: 16,
    marginBottom: 24,
  },
  errorStepTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorStepDescription: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  retryButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});