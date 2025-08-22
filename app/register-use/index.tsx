import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Clock, Droplets, FileText, Save } from 'lucide-react-native';
import { router } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext';
import { useFirebaseDailyRecords } from '@/hooks/useFirebaseData';
import { Card } from '@/components/ui/Card';
import { QuickDropsSelector } from '@/components/forms/QuickDropsSelector';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function RegisterUseScreen() {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const { user } = useFirebaseAuth();
  const { createRecord, updateRecord, getRecordByDate } = useFirebaseDailyRecords();
  
  const [capsules, setCapsules] = useState('2');
  const [time, setTime] = useState(
    new Date().toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  );
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  const validateAndSave = async () => {
    if (!capsules.trim()) {
      Alert.alert(t('error'), t('enterValidCapsules'));
      return;
    }

    if (!time.trim()) {
      Alert.alert(t('error'), t('enterTime'));
      return;
    }

    const capsulesNumber = parseInt(capsules);
    if (isNaN(capsulesNumber) || capsulesNumber <= 0) {
      Alert.alert(t('error'), t('enterValidCapsules'));
      return;
    }

    // Verificar se a dosagem está incorreta (não é 2 cápsulas)
    if (capsulesNumber !== 2) {
      Alert.alert(
        t('incorrectDosage'),
        t('dosageWarning').replace('{capsules}', capsulesNumber.toString()),
        [
          { text: t('correct'), style: 'cancel' },
          { text: t('continue'), onPress: () => saveRecord(capsulesNumber) }
        ]
      );
    } else {
      await saveRecord(capsulesNumber);
    }
  };

  const saveRecord = async (capsulesNumber: number) => {
    try {
      setLoading(true);
      
      if (!user) {
        Alert.alert(t('error'), 'No authenticated user found');
        return;
      }
      
      console.log(`💊 [${user?.uid}] Saving record: ${capsulesNumber} capsules for ${today}`);

      // Verificar se já existe um registro para hoje
      const existingRecord = await getRecordByDate(today);

      const recordData = {
        date: today,
        capsules: capsulesNumber,
        time: time,
        notes: notes.trim(),
        completed: true,
      };

      if (existingRecord?.id) {
        // Atualizar registro existente
        console.log(`🔄 [${user?.uid}] Updating existing record: ${existingRecord.id}`);
        await updateRecord(existingRecord.id, recordData);
        console.log(`✅ [${user?.uid}] Record updated successfully`);
        Alert.alert(
          t('todayRecordUpdated'),
          t('recordUpdatedSuccess'),
          [{ 
            text: t('ok'), 
            onPress: () => {
              // Navegar para Home após confirmar
              router.replace('/(tabs)');
            }
          }]
        );
      } else {
        // Criar novo registro
        console.log(`🔄 [${user?.uid}] Creating new record for ${today}`);
        await createRecord(recordData);
        console.log(`✅ [${user?.uid}] Record created successfully`);
        Alert.alert(
          t('congratulations'),
          t('recordSavedSuccess'),
          [{ 
            text: t('ok'), 
            onPress: () => {
              // Navegar para Home após confirmar
              router.replace('/(tabs)');
            }
          }]
        );
      }
      
      // Validar se foi salvo corretamente
      setTimeout(async () => {
        try {
          const savedRecord = await getRecordByDate(today);
          if (savedRecord && savedRecord.capsules === capsulesNumber) {
            console.log(`✅ [${user?.uid}] Record validation successful - ${capsulesNumber} capsules saved`);
          } else {
            console.warn(`⚠️ [${user?.uid}] Record validation failed - expected ${capsulesNumber} capsules`);
          }
        } catch (error) {
          console.error(`❌ [${user?.uid}] Record validation error:`, error);
        }
      }
      )
      Alert.alert(
        t('congratulations'),
        t('recordSavedSuccess'),
        [{ 
          text: t('ok'), 
          onPress: () => {
            // Navegar para Home após confirmar
            router.replace('/(tabs)');
          }
        }]
      );
    } catch (error) {
      console.error('Error saving record:', error);
      console.error(`❌ [${user?.uid}] Failed to save record:`, error);
      Alert.alert(t('error'), t('couldNotSaveRecord') || 'Could not save record');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: theme.colors.card }]}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
              {t('registerUse')}
            </Text>
            <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
              {t('registerDailyUse')}
            </Text>
          </View>
        </View>

        <ScrollView 
          style={styles.scrollView} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Capsules Input */}
          <Animated.View entering={FadeInDown.delay(400)}>
            <Card style={{ marginHorizontal: 20, marginBottom: 20 }}>
              <View style={styles.inputSection}>
                <View style={styles.inputHeader}>
                  <Droplets size={24} color={theme.colors.primary} />
                  <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
                    {t('capsulesQuantity')}
                  </Text>
                </View>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: theme.colors.background,
                      borderColor: theme.colors.border,
                      color: theme.colors.text,
                    },
                  ]}
                  value={capsules}
                  onChangeText={setCapsules}
                  placeholder={t('enterCapsulesNumber')}
                  placeholderTextColor={theme.colors.textSecondary}
                  keyboardType="numeric"
                  maxLength={3}
                />
              </View>
              
              <QuickDropsSelector
                selectedValue={capsules}
                onSelect={setCapsules}
              />
            </Card>
          </Animated.View>

          {/* Time Input */}
          <Animated.View entering={FadeInDown.delay(500)}>
            <Card style={{ marginHorizontal: 20, marginBottom: 20 }}>
              <View style={styles.inputSection}>
                <View style={styles.inputHeader}>
                  <Clock size={24} color={theme.colors.primary} />
                  <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
                    {t('time')}
                  </Text>
                </View>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: theme.colors.background,
                      borderColor: theme.colors.border,
                      color: theme.colors.text,
                    },
                  ]}
                  value={time}
                  onChangeText={setTime}
                  placeholder="09:00"
                  placeholderTextColor={theme.colors.textSecondary}
                  maxLength={5}
                />
              </View>
            </Card>
          </Animated.View>

          {/* Notes Input */}
          <Animated.View entering={FadeInDown.delay(600)}>
            <Card style={{ marginHorizontal: 20, marginBottom: 20 }}>
              <View style={styles.inputSection}>
                <View style={styles.inputHeader}>
                  <FileText size={24} color={theme.colors.primary} />
                  <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
                    {t('observations')}
                  </Text>
                </View>
                <TextInput
                  style={[
                    styles.textArea,
                    {
                      backgroundColor: theme.colors.background,
                      borderColor: theme.colors.border,
                      color: theme.colors.text,
                    },
                  ]}
                  value={notes}
                  onChangeText={setNotes}
                  placeholder={t('addObservations')}
                  placeholderTextColor={theme.colors.textSecondary}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>
            </Card>
          </Animated.View>

          {/* Usage Tips */}
          <Animated.View entering={FadeInDown.delay(700)}>
            <Card style={{ marginHorizontal: 20, marginBottom: 20 }}>
              <Text style={[styles.tipsTitle, { color: theme.colors.text }]}>
                {t('usageTips')}
              </Text>
              <View style={styles.tipsList}>
                <Text style={[styles.tipItem, { color: theme.colors.textSecondary }]}>
                  {t('tip1')}
                </Text>
                <Text style={[styles.tipItem, { color: theme.colors.textSecondary }]}>
                  {t('tip2')}
                </Text>
                <Text style={[styles.tipItem, { color: theme.colors.textSecondary }]}>
                  {t('tip3')}
                </Text>
                <Text style={[styles.tipItem, { color: theme.colors.textSecondary }]}>
                  {t('tip4')}
                </Text>
              </View>
            </Card>
          </Animated.View>

          {/* Save Button */}
          <Animated.View entering={FadeInDown.delay(800)}>
            <TouchableOpacity
              style={[
                styles.saveButton,
                {
                  backgroundColor: theme.colors.primary,
                  opacity: loading ? 0.7 : 1,
                },
              ]}
              onPress={validateAndSave}
              disabled={loading}
            >
              <Save size={20} color="#ffffff" />
              <Text style={styles.saveButtonText}>
                {loading ? 'Salvando cápsulas...' : t('saveRecord')}
              </Text>
            </TouchableOpacity>
          </Animated.View>

          <View style={styles.bottomSpacing} />
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    lineHeight: 18,
  },
  scrollView: {
    flex: 1,
    paddingTop: 20,
  },
  inputSection: {
    marginBottom: 8,
  },
  inputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 12,
  },
  input: {
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    fontWeight: '500',
  },
  textArea: {
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    fontWeight: '500',
    minHeight: 100,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  tipsList: {
    gap: 8,
  },
  tipItem: {
    fontSize: 14,
    lineHeight: 20,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 12,
  },
  bottomSpacing: {
    height: 40,
  },
});