import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Pressable, Alert } from 'react-native';
import { X, Info, Copy, Share2 } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import Animated, { 
  FadeIn, 
  FadeOut, 
  SlideInDown, 
  SlideOutDown 
} from 'react-native-reanimated';

interface InfoModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  description: string;
  isShareModal?: boolean;
}

export const InfoModal: React.FC<InfoModalProps> = ({
  visible,
  onClose,
  title,
  description,
  isShareModal = false,
}) => {
  const { theme } = useTheme();
  const { t } = useLanguage();

  const handleCopyLink = async () => {
    try {
      await Clipboard.setStringAsync('app.maxtestorin.com');
      Alert.alert(
        '✅ Link Copiado!',
        'O link app.maxtestorin.com foi copiado para sua área de transferência. Agora você pode compartilhar com seus amigos!',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error copying link:', error);
      Alert.alert(
        'Erro',
        'Não foi possível copiar o link. Tente novamente.',
        [{ text: 'OK' }]
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
              {isShareModal ? (
                <Share2 size={24} color={theme.colors.primary} />
              ) : (
                <Info size={24} color={theme.colors.primary} />
              )}
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                {title}
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
            <Text style={[styles.modalDescription, { color: theme.colors.text }]}>
              {description}
            </Text>
          </View>

          {/* Footer */}
          <View style={styles.modalFooter}>
            {isShareModal ? (
              <View style={styles.compactButtonContainer}>
                <TouchableOpacity
                  style={[styles.compactPrimaryButton, { 
                    backgroundColor: theme.colors.primary,
                  }]}
                  onPress={handleCopyLink}
                >
                  <Copy size={20} color="#ffffff" />
                  <Text style={styles.compactPrimaryButtonText}>
                    {t('copyLink')}
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.compactSecondaryButton, { 
                    backgroundColor: theme.colors.background,
                    borderColor: theme.colors.border 
                  }]}
                  onPress={onClose}
                >
                  <Text style={[styles.compactSecondaryButtonText, { color: theme.colors.textSecondary }]}>
                    {t('close')}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
                onPress={onClose}
              >
                <Text style={styles.actionButtonText}>
                  {t('close')}
                </Text>
              </TouchableOpacity>
            )}
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
  modalDescription: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'justify',
  },
  modalFooter: {
    padding: 24,
    paddingTop: 16,
  },
  actionButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
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
  },
  compactButtonContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  compactPrimaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  compactPrimaryButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  compactSecondaryButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 2,
  },
  compactSecondaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});