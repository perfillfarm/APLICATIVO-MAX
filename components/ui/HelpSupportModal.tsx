import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Pressable, Linking, Alert } from 'react-native';
import { X, CircleHelp as HelpCircle, Mail, MessageCircle, Phone } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import Animated, { 
  FadeIn, 
  FadeOut, 
  SlideInDown, 
  SlideOutDown 
} from 'react-native-reanimated';

interface HelpSupportModalProps {
  visible: boolean;
  onClose: () => void;
}

export const HelpSupportModal: React.FC<HelpSupportModalProps> = ({
  visible,
  onClose,
}) => {
  const { theme } = useTheme();
  const { t } = useLanguage();

  const handleEmailSupport = async () => {
    const email = 'support@maxtestorin.com';
    const subject = 'MaxTestorin App';
    const body = 'Hello MaxTestorin Support Team,';

    const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    try {
      const supported = await Linking.canOpenURL(mailtoUrl);
      if (supported) {
        await Linking.openURL(mailtoUrl);
        onClose();
      } else {
        // Fallback: show email address for manual copy
        Alert.alert(
          t('contactSupport'),
          `${t('emailSupport')}:\n\n${email}\n\n${t('copyEmailManually')}`,
          [
            { text: t('cancel'), style: 'cancel' },
            { 
              text: t('copyEmail'), 
              onPress: async () => {
                try {
                  await Clipboard.setStringAsync(email);
                  Alert.alert(t('emailCopied'), email);
                } catch (error) {
                  console.error('Error copying email to clipboard:', error);
                  Alert.alert(t('error'), 'Could not copy email to clipboard');
                }
              }
            }
          ]
        );
      }
    } catch (error) {
      console.error('Error opening email client:', error);
      Alert.alert(
        t('contactSupport'),
        `${t('emailSupport')}:\n\n${email}\n\n${t('copyEmailManually')}`,
        [
          { text: t('cancel'), style: 'cancel' },
          { 
            text: t('copyEmail'), 
            onPress: async () => {
              try {
                await Clipboard.setStringAsync(email);
                Alert.alert(t('emailCopied'), email);
              } catch (error) {
                console.error('Error copying email to clipboard:', error);
                Alert.alert(t('error'), 'Could not copy email to clipboard');
              }
            }
          }
        ]
      );
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        {/* Background Overlay */}
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(150)}
          style={styles.overlay}
        >
          <Pressable style={styles.overlayPressable} onPress={onClose} />
        </Animated.View>
        
        {/* Modal Content */}
        <Animated.View
          entering={SlideInDown.springify().damping(15)}
          exiting={SlideOutDown.duration(200)}
          style={[styles.modalContent, { backgroundColor: theme.colors.card }]}
        >
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.titleSection}>
              <HelpCircle size={24} color={theme.colors.primary} />
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                {t('helpAndSupport')}
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: theme.colors.background }]}
              onPress={onClose}
            >
              <X size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />

          {/* Content */}
          <View style={styles.modalBody}>
            <Text style={[styles.welcomeText, { color: theme.colors.text }]}>
              {t('needHelp')}
            </Text>
            <Text style={[styles.descriptionText, { color: theme.colors.textSecondary }]}>
              {t('helpDescription')}
            </Text>

            {/* Contact Options */}
            <View style={styles.contactOptions}>
              
              {/* Email Support */}
              <TouchableOpacity
                style={[styles.contactOption, { backgroundColor: theme.colors.background }]}
                onPress={async () => {
                  try {
                    await Clipboard.setStringAsync('support@maxtestorin.com');
                    Alert.alert(
                      t('emailCopied'), 
                      'support@maxtestorin.com',
                      [
                        { text: t('cancel'), style: 'cancel' },
                        { 
                          text: t('contactSupport'), 
                          onPress: handleEmailSupport
                        }
                      ]
                    );
                  } catch (error) {
                    console.error('Error copying email:', error);
                    Alert.alert(t('error'), 'Could not copy email');
                  }
                }}
              >
                <View style={[styles.contactIcon, { backgroundColor: theme.colors.primary + '20' }]}>
                  <Mail size={24} color={theme.colors.primary} />
                </View>
                <View style={styles.contactInfo}>
                  <Text style={[styles.contactTitle, { color: theme.colors.text }]}>
                    {t('emailSupport')}
                  </Text>
                  <Text style={[styles.contactSubtitle, { color: theme.colors.primary, fontWeight: '700' }]}>
                    support@maxtestorin.com
                  </Text>
                  <Text style={[styles.contactDescription, { color: theme.colors.textSecondary }]}>
                    {t('emailSupportDescription')}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
              onPress={handleEmailSupport}
            >
              <Mail size={20} color="#ffffff" />
              <Text style={styles.actionButtonText}>
                {t('contactSupport')}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.copyButton, 
                { 
                  backgroundColor: theme.colors.background,
                  borderColor: theme.colors.border 
                }
              ]}
              onPress={async () => {
                try {
                  await Clipboard.setStringAsync('support@maxtestorin.com');
                  Alert.alert(t('emailCopied'), 'support@maxtestorin.com');
                } catch (error) {
                  console.error('Error copying email:', error);
                  Alert.alert(t('error'), 'Could not copy email');
                }
              }}
            >
              <Text style={[styles.copyButtonText, { color: theme.colors.textSecondary }]}>
                {t('copyEmail')}
              </Text>
            </TouchableOpacity>
          </View>
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
  overlayPressable: {
    flex: 1,
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
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 24,
    paddingBottom: 16,
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
  divider: {
    height: 1,
    marginHorizontal: 24,
  },
  modalBody: {
    padding: 24,
    paddingTop: 20,
    paddingBottom: 20,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  descriptionText: {
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 24,
  },
  contactOptions: {
    gap: 16,
  },
  contactOption: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  contactIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  contactInfo: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  contactSubtitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  contactDescription: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  modalFooter: {
    padding: 24,
    paddingTop: 16,
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  copyButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
  },
  copyButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});