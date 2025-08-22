import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { router } from 'expo-router';

export default function IndexScreen() {
  const { isAuthenticated, loading } = useFirebaseAuth();
  const { theme } = useTheme();
  const [hasRedirected, setHasRedirected] = useState(false);

  useEffect(() => {
    console.log('🔄 [Index] Auth state check:', { isAuthenticated, loading });
    if (!loading && !hasRedirected) {
      if (isAuthenticated) {
        console.log('✅ [Index] User authenticated, redirecting to tabs');
        setHasRedirected(true);
        router.replace('/(tabs)');
      } else {
        console.log('🔐 [Index] User not authenticated, redirecting to login');
        setHasRedirected(true);
        router.replace('/auth/login');
      }
    }
  }, [isAuthenticated, loading, hasRedirected]);

  // Additional safety check
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!loading && !isAuthenticated && !hasRedirected) {
        console.log('🔄 [Index] Safety redirect to login');
        setHasRedirected(true);
        router.replace('/auth/login');
      }
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [isAuthenticated, loading, hasRedirected]);

  // Listen for logout events and storage changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleLogoutEvent = () => {
        console.log('🔄 [Index] Logout event detected, redirecting...');
        setHasRedirected(true);
        router.replace('/auth/login');
      };
      
      const handleStorageChange = (e: StorageEvent) => {
        if (e.key === 'logout' || e.newValue === null) {
          console.log('🔄 [Index] Storage change detected, redirecting...');
          setHasRedirected(true);
          router.replace('/auth/login');
        }
      };
      
      window.addEventListener('logout', handleLogoutEvent);
      window.addEventListener('storage', handleStorageChange);
      return () => {
        window.removeEventListener('logout', handleLogoutEvent);
        window.removeEventListener('storage', handleStorageChange);
      };
    }
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});