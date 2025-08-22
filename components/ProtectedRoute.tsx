import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext';
import { useTheme } from '@/contexts/ThemeContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  fallback 
}) => {
  const { isAuthenticated, loading } = useFirebaseAuth();
  const { theme } = useTheme();

  // Mostrar loading enquanto verifica autenticação
  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  // Se não autenticado, mostrar fallback (tela de login)
  if (!isAuthenticated) {
    return fallback ? <>{fallback}</> : null;
  }

  // Se autenticado, mostrar conteúdo protegido
  return <>{children}</>;
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});