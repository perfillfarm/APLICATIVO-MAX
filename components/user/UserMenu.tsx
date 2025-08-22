import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { LogOut, User, Settings, Shield } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext';
import { router } from 'expo-router';

interface UserMenuProps {
  onClose?: () => void;
}

export const UserMenu: React.FC<UserMenuProps> = ({ onClose }) => {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const { logout, user, userProfile, loading } = useFirebaseAuth();

  const handleLogout = () => {
    onClose?.();
    logout();
  };

  const handleNavigateToProfile = () => {
    onClose?.();
    router.push('/(tabs)/profile');
  };

  const handleNavigateToSettings = () => {
    onClose?.();
    router.push('/(tabs)/settings');
  };

  const MenuOption = ({ 
    icon: Icon, 
    title, 
    onPress, 
    color = theme.colors.text,
    destructive = false,
    disabled = false
  }: any) => (
    <TouchableOpacity 
      style={[
        styles.menuOption,
        { 
          backgroundColor: destructive ? theme.colors.error + '08' : theme.colors.card,
          opacity: disabled ? 0.6 : 1,
          borderLeftWidth: destructive ? 3 : 0,
          borderLeftColor: destructive ? theme.colors.error : 'transparent',
        }
      ]} 
      onPress={onPress}
      disabled={disabled}
    >
      <View style={[
        styles.menuIconContainer,
        { 
          backgroundColor: destructive ? theme.colors.error + '15' : color + '15',
        }
      ]}>
        <Icon size={20} color={destructive ? theme.colors.error : color} />
      </View>
      <Text style={[
        styles.menuOptionText, 
        { color: destructive ? theme.colors.error : color }
      ]}>
        {title}
      </Text>
      {destructive && (
        <View style={styles.destructiveIndicator}>
          <Text style={[styles.destructiveIcon, { color: theme.colors.error }]}>⚠️</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      {/* User Info */}
      <View style={[styles.userInfo, { backgroundColor: theme.colors.card }]}>
        <View style={[styles.avatar, { backgroundColor: theme.colors.primary + '20' }]}>
          <User size={24} color={theme.colors.primary} />
        </View>
        <View style={styles.userDetails}>
          <Text style={[styles.userName, { color: theme.colors.text }]}>
            {userProfile?.name || user?.displayName || 'User'}
          </Text>
          <Text style={[styles.userEmail, { color: theme.colors.textSecondary }]}>
            {user?.email || 'No email'}
          </Text>
        </View>
      </View>

      {/* Menu Options */}
      <View style={styles.menuOptions}>
        <MenuOption
          icon={User}
          title={t('profile')}
          onPress={handleNavigateToProfile}
        />
        
        <MenuOption
          icon={Settings}
          title={t('settings')}
          onPress={handleNavigateToSettings}
        />
        
        <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
        
        <MenuOption
          icon={LogOut}
          title={t('logout')}
          onPress={handleLogout}
          destructive={true}
          disabled={loading}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    minWidth: 200,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 12,
  },
  menuOptions: {
    padding: 8,
  },
  menuOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 4,
    position: 'relative',
  },
  menuIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuOptionText: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  destructiveIndicator: {
    marginLeft: 8,
  },
  destructiveIcon: {
    fontSize: 16,
  },
  divider: {
    height: 1,
    marginVertical: 8,
    marginHorizontal: 8,
  },
});