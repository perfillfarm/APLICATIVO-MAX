import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { Download, Upload, Trash2, Shield, Database, X, RefreshCw } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext';
import { FirebaseService } from '@/services/FirebaseService';
import { FirebaseMigration } from '@/utils/FirebaseMigration';
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown } from 'react-native-reanimated';

interface FirebaseDataManagementModalProps {
  visible: boolean;
  onClose: () => void;
}

export const FirebaseDataManagementModal: React.FC<FirebaseDataManagementModalProps> = ({
  visible,
  onClose,
}) => {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const { user } = useFirebaseAuth();
  const [loading, setLoading] = useState(false);
  const [migrationStats, setMigrationStats] = useState<any>(null);

  React.useEffect(() => {
    if (visible) {
      loadMigrationStats();
    }
  }, [visible]);

  const loadMigrationStats = async () => {
    try {
      const stats = await FirebaseMigration.getMigrationStats();
      setMigrationStats(stats);
    } catch (error) {
      console.error('Error loading migration stats:', error);
    }
  };

  const handleMigrateToFirebase = async () => {
    if (!user) {
      Alert.alert('Error', 'No authenticated user found');
      return;
    }

    try {
      setLoading(true);
      await FirebaseMigration.interactiveMigration(user.uid);
      await loadMigrationStats();
    } catch (error: any) {
      if (error.message !== 'Migration cancelled by user') {
        Alert.alert('Migration Error', error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClearFirebaseData = async () => {
    if (!user) {
      Alert.alert('Error', 'No authenticated user found');
      return;
    }

    Alert.alert(
      'Clear Firebase Data',
      'WARNING: This will permanently delete ALL your data from Firebase:\n\n• User profile\n• Daily records\n• Settings\n• All progress history\n\nThis action CANNOT be undone!',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'DELETE ALL',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await FirebaseService.clearAllUserData(user.uid);
              Alert.alert(
                'Data Cleared',
                'All Firebase data has been permanently deleted.',
                [{ text: 'OK', onPress: onClose }]
              );
            } catch (error) {
              Alert.alert('Error', 'Failed to clear Firebase data. Please try again.');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleRestoreFromBackup = async () => {
    Alert.alert(
      'Restore from Backup',
      'This will restore your local data from the backup created during migration. Current local data will be overwritten.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Restore',
          onPress: async () => {
            try {
              setLoading(true);
              await FirebaseMigration.restoreFromBackup();
              Alert.alert('Success', 'Data restored from backup successfully!');
            } catch (error) {
              Alert.alert('Error', 'Failed to restore from backup. No backup found or backup is corrupted.');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleResetMigration = async () => {
    Alert.alert(
      'Reset Migration Status',
      'This will reset the migration status, allowing you to migrate again. Use this if migration failed or you want to re-migrate.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          onPress: async () => {
            try {
              setLoading(true);
              await FirebaseMigration.resetMigrationStatus();
              await loadMigrationStats();
              Alert.alert('Success', 'Migration status reset successfully!');
            } catch (error) {
              Alert.alert('Error', 'Failed to reset migration status.');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
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
                Firebase Data Management
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
            
            {/* Migration Status */}
            {migrationStats && (
              <View style={[styles.statsCard, { backgroundColor: theme.colors.background }]}>
                <Text style={[styles.statsTitle, { color: theme.colors.text }]}>
                  Migration Status
                </Text>
                <View style={styles.statsRow}>
                  <Text style={[styles.statsLabel, { color: theme.colors.textSecondary }]}>
                    Status:
                  </Text>
                  <Text style={[
                    styles.statsValue, 
                    { color: migrationStats.isCompleted ? theme.colors.success : theme.colors.warning }
                  ]}>
                    {migrationStats.isCompleted ? 'Completed' : 'Pending'}
                  </Text>
                </View>
                <View style={styles.statsRow}>
                  <Text style={[styles.statsLabel, { color: theme.colors.textSecondary }]}>
                    Local Data Size:
                  </Text>
                  <Text style={[styles.statsValue, { color: theme.colors.primary }]}>
                    {formatBytes(migrationStats.localDataSize)}
                  </Text>
                </View>
                {migrationStats.hasBackup && (
                  <View style={styles.statsRow}>
                    <Text style={[styles.statsLabel, { color: theme.colors.textSecondary }]}>
                      Backup Available:
                    </Text>
                    <Text style={[styles.statsValue, { color: theme.colors.success }]}>
                      Yes ({migrationStats.backupDate ? new Date(migrationStats.backupDate).toLocaleDateString() : 'Unknown'})
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* Data Options */}
            <View style={styles.optionsContainer}>
              <DataOption
                icon={Upload}
                title="Migrate to Firebase"
                subtitle="Move local data to Firebase cloud storage"
                onPress={handleMigrateToFirebase}
                color={theme.colors.success}
                disabled={loading || migrationStats?.isCompleted}
              />

              <DataOption
                icon={Download}
                title="Restore from Backup"
                subtitle="Restore local data from migration backup"
                onPress={handleRestoreFromBackup}
                color={theme.colors.warning}
                disabled={loading || !migrationStats?.hasBackup}
              />

              <DataOption
                icon={RefreshCw}
                title="Reset Migration"
                subtitle="Reset migration status to migrate again"
                onPress={handleResetMigration}
                color="#8B5CF6"
                disabled={loading}
              />

              <DataOption
                icon={Trash2}
                title="Clear Firebase Data"
                subtitle="Permanently delete all Firebase data"
                onPress={handleClearFirebaseData}
                color={theme.colors.error}
                disabled={loading}
              />
            </View>

            {/* Info Section */}
            <View style={[styles.infoSection, { backgroundColor: theme.colors.background }]}>
              <Text style={[styles.infoTitle, { color: theme.colors.text }]}>
                🔥 Firebase Integration
              </Text>
              <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
                Firebase provides real-time synchronization, automatic backups, and cross-device access to your MaxTestorin data. 
                Your data is securely stored in Google's cloud infrastructure with enterprise-grade security.
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