import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Theme {
  colors: {
    background: string;
    surface: string;
    card: string;
    primary: string;
    secondary: string;
    accent: string;
    text: string;
    textSecondary: string;
    border: string;
    success: string;
    warning: string;
    error: string;
    shadow: string;
  };
  isDark: boolean;
}

const lightTheme: Theme = {
  colors: {
    background: '#f8fafc',
    surface: '#fefefe',
    card: '#ffffff',
    primary: '#e40f11',
    secondary: '#B91C1C',
    accent: '#EF4444',
    text: '#1e293b',
    textSecondary: '#64748b',
    border: '#fecaca',
    success: '#059669',
    warning: '#F59E0B',
    error: '#e40f11',
    shadow: '#000000',
  },
  isDark: false,
};

const darkTheme: Theme = {
  colors: {
    background: '#0f0f0f',
    surface: '#1a1a1a',
    card: '#262626',
    primary: '#e40f11',
    secondary: '#F87171',
    accent: '#FCA5A5',
    text: '#f1f5f9',
    textSecondary: '#cbd5e1',
    border: '#404040',
    success: '#22c55e',
    warning: '#f59e0b',
    error: '#e40f11',
    shadow: '#000000',
  },
  isDark: true,
};

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('appTheme');
      if (savedTheme) {
        setIsDark(savedTheme === 'dark');
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    }
  };

  const toggleTheme = async () => {
    try {
      const newTheme = !isDark;
      setIsDark(newTheme);
      await AsyncStorage.setItem('appTheme', newTheme ? 'dark' : 'light');
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const theme = isDark ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};