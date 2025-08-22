import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { Download, Upload, Trash2, Shield, Database, X } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { DataManager } from '@/utils/DataManager';
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown } from 'react-native-reanimated';

interface DataManagementModalProps {
  visible: boolean;
  onClose: () => void;
}

export const DataManagementModal: React.FC<DataManagementModalProps> = ({
  visible,
  onClose,
}) => {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [storageStats, setStorageStats] = useState<any>(null);

  React.useEffect(() => {
    if (visible) {
      loadStorageStats();
    }
  }, [visible]);

  const loadStorageStats = async () => {
    try {
      const stats = await DataManager.getStorageStats();
      setStorageStats(stats);
    } catch (error) {
      console.error('Error loading storage stats:', error);
    }
  };

  const handleExportData = async () => {
    try {
      setLoading(true);
      await DataManager.shareBackup();
      Alert.alert(
        'Success',
        'Backup file created and shared successfully!',
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to create backup. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleImportData = async () => {
    Alert.alert(
      'Import Data',
      'This will replace all current data. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Import',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await DataManager.selectAndImportBackup();
              Alert.alert(
                'Success',
                'Data imported successfully! Please restart the app.',
                [{ text: 'OK', onPress: onClose }]
              );
            } catch (error) {
              Alert.alert(
                'Error',
                'Failed to import data. Please check the file format.',
                [{ text: 'OK' }]
              );
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleClearAllData = async () => {
    Alert.alert(
      'Clear All Data',
      'WARNING: This will permanently delete ALL data including:\n\n• User profile\n• Daily records\n• Settings\n• Progress history\n\nThis action CANNOT be undone!',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'DELETE ALL',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await DataManager.clearAllData();
              Alert.alert(
                'Data Cleared',
                'All data has been permanently deleted.',
                [{ text: 'OK', onPress: onClose }]
              );
            } catch (error) {
              Alert.alert(
                'Error',
                'Failed to clear data. Please try again.',
                [{ text: 'OK' }]
              );
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleValidateData = async () => {
    try {
      setLoading(true);
      const isValid = await DataManager.validateDataIntegrity();
      Alert.alert(
        'Data Validation',
        isValid ? 'All data is valid and intact!' : 'Some data corruption detected. Consider creating a backup.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to validate data.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const DataOption = ({ 
    icon: Icon, 
    title, 
    subtitle, 
    onPress, 
    color = theme.colors.primary,
    disabled = false 
  }: any) => (
    <TouchableOpacity
      style={[
        styles.dataOption,
        { 
          backgroundColor: theme.colors.card,
          opacity: disabled ? 0.6 : 1,
        }
      ]}
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
    >
      <View style={styles.dataOptionLeft}>
        <View style={[styles.dataOptionIcon, { backgroundColor: color + '20' }]}>
          <Icon size={24} color={color} />
        </View>
        <View style={styles.dataOptionText}>
          <Text style={[styles.dataOptionTitle, { color: theme.colors.text }]}>
            {title}
          </Text>
          <Text style={[styles.dataOptionSubtitle, { color: theme.colors.textSecondary }]}>
            {subtitle}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(150)}
          style={styles.overlay}
          onTouchEnd={onClose}
        />
        
        <Animated.View
          entering={SlideInDown.springify().damping(15)}
          exiting={SlideOutDown.duration(200)}
          style={[styles.modalContent, { backgroundColor: theme.colors.card }]}
        >
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.titleSection}>
              <Database size={24} color={theme.colors.primary} />
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                Data Management
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: theme.colors.background }]}
              onPress={onClose}
            >
              <X size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            
            {/* Storage Stats */}
            {storageStats && (
              <View style={[styles.statsCard, { backgroundColor: theme.colors.background }]}>
                <Text style={[styles.statsTitle, { color: theme.colors.text }]}>
                  Storage Usage
                </Text>
                <View style={styles.statsRow}>
                  <Text style={[styles.statsLabel, { color: theme.colors.textSecondary }]}>
                    Total Size:
                  </Text>
                  <Text style={[styles.statsValue, { color: theme.colors.primary }]}>
                    {formatBytes(storageStats.totalSize)}
                  </Text>
                </View>
                <View style={styles.statsRow}>
                  <Text style={[styles.statsLabel, { color: theme.colors.textSecondary }]}>
                    Items Stored:
                  </Text>
                  <Text style={[styles.statsValue, { color: theme.colors.primary }]}>
                    {storageStats.itemCount}
                  </Text>
                </View>
              </View>
            )}

            {/* Data Options */}
            <View style={styles.optionsContainer}>
              <DataOption
                icon={Download}
                title="Export Data"
                subtitle="Create backup file and share"
                onPress={handleExportData}
                color={theme.colors.success}
                disabled={loading}
              />

              <DataOption
                icon={Upload}
                title="Import Data"
                subtitle="Restore from backup file"
                onPress={handleImportData}
                color={theme.colors.warning}
                disabled={loading}
              />

              <DataOption
                icon={Shield}
                title="Validate Data"
                subtitle="Check data integrity"
                onPress={handleValidateData}
                color="#8B5CF6"
                disabled={loading}
              />

              <DataOption
                icon={Trash2}
                title="Clear All Data"
                subtitle="Permanently delete everything"
                onPress={handleClearAllData}
                color={theme.colors.error}
                disabled={loading}
              />
            </View>

            {/* Info Section */}
            <View style={[styles.infoSection, { backgroundColor: theme.colors.background }]}>
              <Text style={[styles.infoTitle, { color: theme.colors.text }]}>
                📱 Local Storage
              </Text>
              <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
                All your data is stored locally on your device for maximum privacy and security. 
                Use the export feature to create backups that you can save to cloud storage or share between devices.
              </Text>
            </View>

            {loading && (
              <View style={styles.loadingContainer}>
                <Text style={[styles.loadingText, { color: theme.colors.primary }]}>
                  Processing...
                </Text>
              </View>
            )}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
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
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 12,
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
  modalBody: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  statsCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statsLabel: {
    fontSize: 14,
  },
  statsValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  optionsContainer: {
    gap: 12,
    marginBottom: 24,
  },
  dataOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  dataOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dataOptionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  dataOptionText: {
    flex: 1,
  },
  dataOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  dataOptionSubtitle: {
    fontSize: 14,
    lineHeight: 18,
  },
  infoSection: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
  },
});