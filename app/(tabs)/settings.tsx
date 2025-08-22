import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { Bell, Target, Info, Shield, Share2, Moon, Sun, Languages, Database, CircleHelp as HelpCircle, Settings as SettingsIcon } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext';
import { useFirebaseSettings } from '@/contexts/FirebaseSettingsContext';
import { useTutorial } from '@/hooks/useTutorial';
import { router } from 'expo-router';
import { Header } from '@/components/ui/Header';
import { InfoModal } from '@/components/ui/InfoModal';
import { DataManagementModal } from '@/components/ui/DataManagementModal';
import { HelpSupportModal } from '@/components/ui/HelpSupportModal';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface Settings {
  notifications: boolean;
  reminderTime: string;
  dailyGoal: number;
  weeklyGoal: number;
}

export default function SettingsScreen() {
  const { theme, toggleTheme } = useTheme();
  const { t, language, setLanguage } = useLanguage();
  const { logout, loading } = useFirebaseAuth();
  const { settings, updateSettings } = useFirebaseSettings();
  const { resetTutorial } = useTutorial();
  const [showMaxTestorinInfo, setShowMaxTestorinInfo] = useState(false);
  const [showPrivacyInfo, setShowPrivacyInfo] = useState(false);
  const [showShareInfo, setShowShareInfo] = useState(false);
  const [showDataManagement, setShowDataManagement] = useState(false);
  const [showHelpSupport, setShowHelpSupport] = useState(false);

  useEffect(() => {
    // Settings are loaded automatically via useFirebaseSettings hook
  }, []);

  const toggleNotifications = async (value: boolean) => {
    try {
      await updateSettings({ notifications: value });
    } catch (error) {
      console.error('Error updating notifications:', error);
    }
  };

  const shareApp = () => {
    setShowShareInfo(true);
  };


  const showProductInfo = () => {
    setShowMaxTestorinInfo(true);
  };

  const showPrivacyPolicy = () => {
    setShowPrivacyInfo(true);
  };

  const showHelpAndSupport = () => {
    setShowHelpSupport(true);
  };

  const handleShowTutorial = () => {
    Alert.alert(
      t('tutorialTitle') || 'Tutorial',
      t('tutorialSubtitle') || 'Would you like to watch the tutorial again?',
      [
        { text: t('cancel'), style: 'cancel' },
        { 
          text: t('yes'), 
          onPress: () => {
            resetTutorial();
          }
        }
      ]
    );
  };

  const toggleLanguage = () => {
    const newLanguage = language === 'en' ? 'pt' : 'en';
    setLanguage(newLanguage);
  };

  const handleLogout = () => {
    logout();
  };


  const SettingItem = ({ 
    icon: Icon, 
    title, 
    subtitle, 
    onPress, 
    rightElement,
    color = theme.colors.primary,
    disabled = false,
    isDestructive = false
  }: any) => (
    <TouchableOpacity 
      style={[
        styles.settingItem, 
        { 
          backgroundColor: theme.colors.card,
          opacity: disabled ? 0.6 : 1,
          borderLeftWidth: isDestructive ? 4 : 0,
          borderLeftColor: isDestructive ? theme.colors.error : 'transparent',
        }
      ]} 
      onPress={onPress}
      disabled={disabled}
    >
      <View style={styles.settingLeft}>
        <View style={[
          styles.settingIconContainer,
          { 
            backgroundColor: isDestructive ? theme.colors.error + '15' : color + '15',
          }
        ]}>
          <Icon size={24} color={color} />
        </View>
        <View style={styles.settingText}>
          <Text style={[styles.settingTitle, { color: theme.colors.text }]}>{title}</Text>
          {subtitle && <Text style={[styles.settingSubtitle, { color: theme.colors.textSecondary }]}>{subtitle}</Text>}
        </View>
      </View>
      {isDestructive && (
        <View style={styles.destructiveWarning}>
          <Text style={[styles.destructiveText, { color: theme.colors.error }]}>⚠️</Text>
        </View>
      )}
      {rightElement}
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header 
        title={
          <View style={styles.headerTitleContainer}>
            <SettingsIcon size={24} color="#ffffff" style={styles.headerIcon} />
            <Text style={styles.headerTitleText}>{t('settings')}</Text>
          </View>
        }
        subtitle={
          <View style={styles.headerSubtitleContainer}>
            <Text style={styles.headerSubtitleText}>{t('customizeExperience')}</Text>
          </View>
        }
        showOptions={false}
      />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>

        <Animated.View entering={FadeInDown.delay(400)} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t('appearance')}</Text>
          <SettingItem
            icon={theme.isDark ? Sun : Moon}
            title={t('theme')}
            subtitle={theme.isDark ? t('darkModeEnabled') : t('lightModeEnabled')}
            onPress={toggleTheme}
            rightElement={
              <Switch
                value={theme.isDark}
                onValueChange={toggleTheme}
                thumbColor={theme.colors.primary}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary + '40' }}
              />
            }
          />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(500)} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t('notifications')}</Text>
          <SettingItem
            icon={Bell}
            title={t('dailyReminders')}
            subtitle={t('receiveNotifications')}
            rightElement={
              <Switch
                value={settings.notifications}
                onValueChange={toggleNotifications}
                thumbColor={theme.colors.primary}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary + '40' }}
              />
            }
          />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(550)} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t('help')}</Text>
          <SettingItem
            icon={HelpCircle}
            title={t('helpAndSupport')}
            subtitle={t('needHelp')}
            onPress={showHelpAndSupport}
          />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(550)} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t('language')}</Text>
          <SettingItem
            icon={Languages}
            title={t('language')}
            subtitle={language === 'en' ? 'English' : 'Português'}
            onPress={toggleLanguage}
            rightElement={
              <Text style={[styles.languageIndicator, { color: theme.colors.primary }]}>
                {language === 'en' ? 'EN' : 'PT'}
              </Text>
            }
          />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(600)} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Data Management</Text>
          <SettingItem
            icon={Database}
            title="Backup & Restore"
            subtitle="Export, import, and manage your data"
            onPress={() => setShowDataManagement(true)}
          />
        </Animated.View>


        <Animated.View entering={FadeInDown.delay(650)} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t('goals')}</Text>
          <SettingItem
            icon={Target}
            title={t('dailyGoal')}
            subtitle={t('mandatoryDosage')}
            onPress={() => Alert.alert(t('dailyGoal'), t('developmentFeature'))}
          />
          <SettingItem
            icon={Target}
            title={t('weeklyGoal')}
            subtitle={t('weeklyDosage')}
            onPress={() => Alert.alert(t('weeklyGoal'), t('developmentFeature'))}
          />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(750)} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t('information')}</Text>
          <SettingItem
            icon={Info}
            title={t('aboutMaxTestorin')}
            onPress={showProductInfo}
          />
          <SettingItem
            icon={Shield}
            title={t('privacy')}
            subtitle={t('privacyPolicy')}
            onPress={showPrivacyPolicy}
          />
          <SettingItem
            icon={Share2}
            title={t('shareApp')}
            subtitle={t('inviteFriends')}
            onPress={shareApp}
          />
        </Animated.View>

        {/* Logout Section - Moved above footer */}
        <Animated.View entering={FadeInDown.delay(850)} style={[styles.section, styles.logoutSection]}>
          <SettingItem
            icon={Shield}
            title={t('logout')}
            subtitle={t('signOutOfAccount')}
            onPress={handleLogout}
            color={theme.colors.error}
            disabled={loading}
            isDestructive={true}
          />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(900)} style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>
            {t('appVersion')}
          </Text>
          <Text style={[styles.footerSubtext, { color: theme.colors.textSecondary }]}>
            {t('developedFor')}
          </Text>
        </Animated.View>

      </ScrollView>

      {/* MaxTestorin Info Modal */}
      <InfoModal
        visible={showMaxTestorinInfo}
        onClose={() => setShowMaxTestorinInfo(false)}
        title={t('aboutMaxTestorinTitle')}
        description={t('aboutMaxTestorinDescription')}
      />

      {/* Privacy Policy Modal */}
      <InfoModal
        visible={showPrivacyInfo}
        onClose={() => setShowPrivacyInfo(false)}
        title={t('privacyPolicyTitle')}
        description={t('privacyPolicyDescription')}
      />

      {/* Share App Modal */}
      <InfoModal
        visible={showShareInfo}
        onClose={() => setShowShareInfo(false)}
        title={t('shareAppTitle')}
        description={t('shareAppDescription')}
        isShareModal={true}
      />

      {/* Data Management Modal */}
      <DataManagementModal
        visible={showDataManagement}
        onClose={() => setShowDataManagement(false)}
      />

      {/* Help and Support Modal */}
      <HelpSupportModal
        visible={showHelpSupport}
        onClose={() => setShowHelpSupport(false)}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingTop: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    marginHorizontal: 24,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 18,
    marginHorizontal: 24,
    marginBottom: 12,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 18,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 17,
    fontWeight: '500',
  },
  settingSubtitle: {
    fontSize: 15,
    marginTop: 4,
  },
  destructiveWarning: {
    marginRight: 12,
  },
  destructiveText: {
    fontSize: 18,
    fontWeight: '600',
  },
  footer: {
    padding: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 17,
    fontWeight: '500',
    marginBottom: 6,
  },
  footerSubtext: {
    fontSize: 15,
  },
  logoutSection: {
    marginTop: 40,
    marginBottom: 40,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(220, 38, 38, 0.2)',
  },
  languageIndicator: {
    fontSize: 16,
    fontWeight: '700',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(220, 38, 38, 0.1)',
    overflow: 'hidden',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    marginRight: 8,
  },
  headerTitleText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
  },
  headerSubtitleContainer: {
    marginTop: 2,
  },
  headerSubtitleText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 18,
  },
});