import React, { createContext, useContext, useState, useEffect } from 'react';
import { router } from 'expo-router';
import { supabase } from '@/config/supabase';
import { SupabaseService } from '@/services/SupabaseService';
import { AuthService, AuthUser } from '@/services/authService';
import { UserProfile } from '@/types/database';

interface AuthContextData {
  user: any | null;
  userProfile: UserProfile | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: { name: string; email: string; password: string }) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
  setUser: (user: any | null) => void;
  setUserProfile: (profile: UserProfile | null) => void;
  setIsAuthenticated: (authenticated: boolean) => void;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const FirebaseAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Listen to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      try {
        setLoading(true);
        setError(null);
        console.log(`🔐 [Auth] State changed:`, event, session?.user?.id || 'No user');
        
        if (session?.user) {
          console.log(`🔐 [Auth] User authenticated: ${session.user.id}`);
          setUser(session.user);
          setIsAuthenticated(true);
          
          // Save user data to AuthService
          const authUser: AuthUser = {
            uid: session.user.id,
            email: session.user.email!,
            displayName: session.user.user_metadata?.name || undefined,
            photoURL: session.user.user_metadata?.avatar_url || undefined,
          };
          await AuthService.saveUser(authUser);
          
          // Load user profile
          console.log(`👤 [Auth] Loading profile for user ${session.user.id}`);
          const profile = await SupabaseService.getUserProfile(session.user.id);
          setUserProfile(profile);
          console.log(`✅ [Auth] Profile loaded:`, profile ? 'Success' : 'Not found');
          
          // Check if migration is needed
          await checkAndMigrateLocalData(session.user.id);
        } else {
          console.log(`🚪 [Auth] User logged out`);
          
          // Ensure complete state cleanup
          setUser(null);
          setUserProfile(null);
          setIsAuthenticated(false);
          setError(null);
          
          // Clear any remaining local data
          try {
            await AuthService.clearAllData();
            console.log(`🧹 [Auth] Local data cleared after logout`);
          } catch (error) {
            console.warn(`⚠️ [Auth] Could not clear local data:`, error);
          }
        }
      } catch (error) {
        console.error('❌ [Auth] Error in auth state change:', error);
        setError('Authentication error occurred');
        
        // On error, ensure user is logged out
        setUser(null);
        setUserProfile(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    });

    // Listen for logout events from other tabs/windows
    if (typeof window !== 'undefined') {
      const handleStorageChange = (e: StorageEvent) => {
        if (e.key === 'logout' && e.newValue === 'true') {
          console.log('🔄 [Auth] Logout detected from another tab');
          handleCrossTabLogout();
        }
      };
      
      window.addEventListener('storage', handleStorageChange);
      return () => {
        subscription.unsubscribe();
        window.removeEventListener('storage', handleStorageChange);
      };
    }

    return () => subscription.unsubscribe();
  }, []);

  const handleCrossTabLogout = async () => {
    try {
      setUser(null);
      setUserProfile(null);
      setIsAuthenticated(false);
      setError(null);
      router.replace('/auth/login');
    } catch (error) {
      console.error('❌ [Auth] Error handling cross-tab logout:', error);
    }
  };

  const checkAndMigrateLocalData = async (userId: string) => {
    try {
      console.log(`🔄 [${userId}] Checking migration status...`);
      const migrationFlag = await AuthService.getUser();
      
      if (!migrationFlag) {
        console.log(`📦 [${userId}] Starting data migration...`);
        try {
          await migrateLocalDataToSupabase(userId);
          console.log(`✅ [${userId}] Migration completed successfully`);
        } catch (error) {
          console.error('Migration failed, but continuing:', error);
          console.error(`❌ [${userId}] Migration failed:`, error);
        }
      } else {
        console.log(`✅ [${userId}] Migration already completed`);
      }
    } catch (error) {
      console.error('Error checking migration:', error);
      console.error(`❌ [${userId}] Migration check failed:`, error);
    }
  };

  const migrateLocalDataToSupabase = async (userId: string) => {
    try {
      console.log(`📦 [${userId}] Collecting local data for migration...`);
      console.log(`ℹ️ [${userId}] Migration skipped - using new auth system`);
    } catch (error) {
      console.error('❌ Error migrating local data:', error);
      console.error(`❌ [${userId}] Migration failed:`, error);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      console.log(`🔐 Attempting login for: ${email}`);
      await SupabaseService.loginUser(email, password);
      console.log(`✅ Login successful for: ${email}`);
      return true;
    } catch (error: any) {
      console.error('Login error:', error);
      console.error(`❌ Login failed for: ${email}`, error.message);
      setError('Login failed. Please check your credentials.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: { name: string; email: string; password: string }): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      console.log(`📝 Attempting registration for: ${userData.email}`);
      await SupabaseService.registerUser(userData.email, userData.password, userData.name);
      console.log(`✅ Registration successful for: ${userData.email}`);
      return true;
    } catch (error: any) {
      console.error('Registration error:', error);
      console.error(`❌ Registration failed for: ${userData.email}`, error.message);
      setError('Registration failed. Please try again.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      console.log('🚪 [Auth] Starting logout process...');
      setLoading(true);
      
      await AuthService.logout();
      
      setUser(null);
      setUserProfile(null);
      setIsAuthenticated(false);
      setError(null);
      
      console.log('✅ [Auth] Logout completed successfully');
      router.replace('/auth/login');
    } catch (error) {
      console.error('❌ [Auth] Error during logout:', error);
      
      setUser(null);
      setUserProfile(null);
      setIsAuthenticated(false);
      setError(null);
      
      router.replace('/auth/login');
    } finally {
      setLoading(false);
    }
  };

  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    try {
      if (!user) throw new Error('No authenticated user');
      
      setError(null);
      console.log(`🔄 [${user.id}] Updating user profile...`);
      
      // If updating profile image, delete old image first
      if (updates.profile_image_url && userProfile?.profile_image_url && 
          userProfile.profile_image_url !== updates.profile_image_url) {
        try {
          console.log(`🗑️ [${user.id}] Deleting old profile image`);
          await SupabaseService.deleteProfileImage(userProfile.profile_image_url);
        } catch (error) {
          console.warn('Could not delete old profile image:', error);
        }
      }
      
      await SupabaseService.updateUserProfile(user.id, updates);
      console.log(`✅ [${user.id}] Profile updated successfully`);
      
      // Update local state
      setUserProfile(prev => prev ? { ...prev, ...updates } : null);
    } catch (error) {
      console.error('Error updating profile:', error);
      console.error(`❌ [${user?.id}] Profile update failed:`, error);
      setError('Failed to update profile. Please try again.');
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        isAuthenticated,
        loading,
        error,
        login,
        register,
        logout,
        updateUserProfile,
        setUser,
        setUserProfile,
        setIsAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useFirebaseAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useFirebaseAuth must be used within a FirebaseAuthProvider');
  }
  return context;
};