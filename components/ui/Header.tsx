import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Pressable, ScrollView, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Menu, Settings, User, Bell, Moon, Sun, Info, CircleHelp as HelpCircle, Share2, Shield, Languages } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext';
import { router } from 'expo-router';
import Animated, { 
  FadeIn, 
  FadeOut, 
  SlideInLeft, 
  SlideOutLeft,
  useSharedValue,
  useAnimatedStyle,
  withSpring
} from 'react-native-reanimated';

interface HeaderProps {
  title: string;
  subtitle?: string;
  showOptions?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  showOptions = true,
}) => {
  const { theme, toggleTheme } = useTheme();
  const { t, language, setLanguage } = useLanguage();
  const { logout, loading, setUser, setUserProfile, setIsAuthenticated } = useFirebaseAuth();
  const [showMenu, setShowMenu] = useState(false);
  const buttonScale = useSharedValue(1);

  const handleMenuPress = () => {
    buttonScale.value = withSpring(0.9, { duration: 100 }, () => {
      buttonScale.value = withSpring(1, { duration: 200 });
    });
    setShowMenu(true);
  };

  const closeMenu = () => {
    setShowMenu(false);
  };

  const navigateToSettings = () => {
    closeMenu();
    router.push('/(tabs)/settings');
  };

  const navigateToProfile = () => {
    closeMenu();
    router.push('/(tabs)/profile');
  };

  const handleThemeToggle = () => {
    toggleTheme();
    closeMenu();
  };

  const handleLanguageToggle = () => {
    const newLanguage = language === 'en' ? 'pt' : 'en';
    setLanguage(newLanguage);
    closeMenu();
  };

  const showPrivacyFromMenu = () => {
    closeMenu();
    router.push('/(tabs)/settings');
  };

  const handleLogout = () => {
    closeMenu();
    logout();
  };

  const buttonAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: buttonScale.value }],
    };
  });

  const MenuOption = ({ 
    icon: Icon, 
    title: optionTitle, 
    onPress, 
    color = theme.colors.text,
    disabled = false,
    isDestructive = false
  }: any) => (
    <TouchableOpacity 
      style={[
        styles.menuOption,
        { 
          opacity: disabled ? 0.6 : 1,
          backgroundColor: isDestructive ? theme.colors.error + '10' : 'transparent'
        }
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <View style={styles.menuOptionContent}>
        <Icon size={20} color={color} />
        <Text style={[styles.menuOptionText, { color }]}>{optionTitle}</Text>
      </View>
      {isDestructive && (
        <View style={[styles.destructiveIndicator, { backgroundColor: theme.colors.error }]} />
      )}
    </TouchableOpacity>
  );

  return (
    <>
      <LinearGradient
        colors={[
          '#e90101', // Cor 1: Vermelho vibrante
          '#960000', // Cor 2: Vermelho escuro
          theme.isDark ? '#7f1d1d' : '#ef4444' // Manter variação para tema
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientContainer}
      >
        <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          {showOptions && (
            <Animated.View style={buttonAnimatedStyle}>
              <TouchableOpacity
                style={[styles.menuButton, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}
                onPress={handleMenuPress}
              >
                <Menu size={24} color="#ffffff" />
              </TouchableOpacity>
            </Animated.View>
          )}
          
          <View style={styles.titleSection}>
            <Text style={[styles.title, { color: '#ffffff' }]}>
              {title}
            </Text>
            {subtitle && (
              <Text style={[styles.subtitle, { color: 'rgba(255, 255, 255, 0.8)' }]}>
                {subtitle}
              </Text>
            )}
          </View>
          
          {/* Max Testorin Logo */}
          <View style={styles.logoContainer}>
            <Image
              source={require('@/assets/images/LOGO-MAX-WHITE.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
        </View>
        </SafeAreaView>
      </LinearGradient>

      {/* Sidebar Menu Modal */}
      <Modal
        visible={showMenu}
        transparent
        animationType="none"
        onRequestClose={closeMenu}
      >
        <View style={styles.modalContainer}>
          {/* Background Overlay */}
          <Animated.View
            entering={FadeIn.duration(200)}
            exiting={FadeOut.duration(150)}
            style={styles.overlayBackground}
          >
            <Pressable style={styles.overlayRight} onPress={closeMenu} />
          </Animated.View>
          
          {/* Sidebar Menu */}
          <Animated.View
            entering={SlideInLeft.springify().damping(15)}
            exiting={SlideOutLeft.duration(200)}
            style={[styles.sidebarContainer, { backgroundColor: theme.colors.card }]}
          >
            <View style={styles.sidebarHeader}>
              <Text style={[styles.sidebarTitle, { color: theme.colors.text }]}>
                {t('menu')}
              </Text>
              <View style={[styles.sidebarDivider, { backgroundColor: theme.colors.border }]} />
            </View>

            <ScrollView 
              style={styles.sidebarContent}
              contentContainerStyle={styles.sidebarScrollContent}
              showsVerticalScrollIndicator={false}
            >
              <MenuOption
                icon={User}
                title={t('profile')}
                onPress={navigateToProfile}
              />
              
              <MenuOption
                icon={Settings}
                title={t('settings')}
                onPress={navigateToSettings}
              />
              
              <View style={[styles.menuDivider, { backgroundColor: theme.colors.border }]} />
              
              <MenuOption
                icon={theme.isDark ? Sun : Moon}
                title={theme.isDark ? t('lightMode') : t('darkMode')}
                onPress={handleThemeToggle}
              />
              
              <MenuOption
                icon={Languages}
                title={language === 'en' ? 'Português' : 'English'}
                onPress={handleLanguageToggle}
              />
              
              <MenuOption
                icon={Bell}
                title={t('notifications')}
                onPress={() => {
                  closeMenu();
                  router.push('/(tabs)/settings');
                }}
              />
              
              <View style={[styles.menuDivider, { backgroundColor: theme.colors.border }]} />
              
              <MenuOption
                icon={Info}
                title={t('helpAndSupport')}
                onPress={() => {
                  closeMenu();
                  router.push('/(tabs)/settings');
                  // Small delay to ensure navigation completes before showing modal
                  setTimeout(() => {
                    // This will be handled by the settings screen
                  }, 500);
                }}
              />
              
              <MenuOption
                icon={Shield}
                title={t('logout')}
                onPress={handleLogout}
                color={theme.colors.error}
                disabled={loading}
                isDestructive={true}
              />
              
              <View style={[styles.menuDivider, { backgroundColor: theme.colors.border }]} />
            </ScrollView>
          </Animated.View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  gradientContainer: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 1000,
  },
  container: {
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  menuButton: {
    padding: 8,
    borderRadius: 8,
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  titleSection: {
    flex: 1,
    marginLeft: 16,
  },
  logoContainer: {
    marginLeft: 16,
  },
  logoImage: {
    width: 80,
    height: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 18,
  },
  modalContainer: {
    flex: 1,
    position: 'relative',
  },
  overlayBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  overlayRight: {
    position: 'absolute',
    top: 0,
    left: '50%',
    right: 0,
    bottom: 0,
  },
  sidebarContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: '50%',
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 1000,
  },
  sidebarHeader: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  sidebarTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16,
  },
  sidebarDivider: {
    height: 1,
    width: '100%',
  },
  sidebarContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  sidebarScrollContent: {
    paddingBottom: 24,
  },
  menuOption: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    position: 'relative',
    overflow: 'hidden',
  },
  menuOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuOptionText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 16,
  },
  destructiveIndicator: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderTopRightRadius: 2,
    borderBottomRightRadius: 2,
  },
  menuDivider: {
    height: 1,
    marginVertical: 16,
    marginHorizontal: 16,
  },
});