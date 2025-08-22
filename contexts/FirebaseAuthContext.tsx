import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { router } from 'expo-router';
import { auth } from '@/config/firebase';
import { FirebaseService, User, UserProfile } from '@/services/FirebaseService';
import { AuthService, AuthUser } from '@/services/authService';

interface AuthContextData {
  user: FirebaseUser | null;
  userProfile: UserProfile | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: { name: string; email: string; password: string }) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
  setUser: (user: FirebaseUser | null) => void;
  setUserProfile: (profile: UserProfile | null) => void;
  setIsAuthenticated: (authenticated: boolean) => void;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const FirebaseAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        setLoading(true);
        setError(null);
        console.log(`🔐 [Auth] State changed:`, firebaseUser ? `User ${firebaseUser.uid}` : 'No user');
        
        if (firebaseUser) {
          console.log(`🔐 [Auth] User authenticated: ${firebaseUser.uid}`);
          setUser(firebaseUser);
          setIsAuthenticated(true);
          
          // Salvar dados do usuário no AuthService
          const authUser: AuthUser = {
            uid: firebaseUser.uid,
            email: firebaseUser.email!,
            displayName: firebaseUser.displayName || undefined,
            photoURL: firebaseUser.photoURL || undefined,
          };
          await AuthService.saveUser(authUser);
          
          // Load user profile
          console.log(`👤 [Auth] Loading profile for user ${firebaseUser.uid}`);
          const profile = await FirebaseService.getUserProfile(firebaseUser.uid);
          setUserProfile(profile);
          console.log(`✅ [Auth] Profile loaded:`, profile ? 'Success' : 'Not found');
          
          // Log tutorial status for debugging
          if (profile) {
            console.log(`🎓 [Auth] User tutorial status: ${profile.hasSeenTutorial ? 'SEEN' : 'NOT SEEN'}`);
          }
          
          // Check if migration is needed
          await checkAndMigrateLocalData(firebaseUser.uid);
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
        unsubscribe();
        window.removeEventListener('storage', handleStorageChange);
      };
    }
    return unsubscribe;
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
          await migrateLocalDataToFirebase(userId);
          console.log(`✅ [${userId}] Migration completed successfully`);
        } catch (error) {
          console.error('Migration failed, but continuing:', error);
          console.error(`❌ [${userId}] Migration failed:`, error);
          // Don't block the user if migration fails
        }
      } else {
        console.log(`✅ [${userId}] Migration already completed`);
      }
    } catch (error) {
      console.error('Error checking migration:', error);
      console.error(`❌ [${userId}] Migration check failed:`, error);
    }
  };

  const migrateLocalDataToFirebase = async (userId: string) => {
    try {
      console.log(`📦 [${userId}] Collecting local data for migration...`);
      // Migration logic can be implemented here if needed
      // For now, we'll skip this as the new system handles data differently

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
      await FirebaseService.loginUser(email, password);
      console.log(`✅ Login successful for: ${email}`);
      return true;
    } catch (error: any) {
      console.error('Login error:', error);
      console.error(`❌ Login failed for: ${email}`, error.code);
      setError('Login failed. Please check your credentials.');
      
      // Não mostrar alert aqui - deixar para a tela de login tratar
      throw error; // Re-throw para a tela capturar
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: { name: string; email: string; password: string }): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      console.log(`📝 Attempting registration for: ${userData.email}`);
      await FirebaseService.registerUser(userData.email, userData.password, userData.name);
      console.log(`✅ Registration successful for: ${userData.email}`);
      return true;
    } catch (error: any) {
      console.error('Registration error:', error);
      console.error(`❌ Registration failed for: ${userData.email}`, error.code);
      setError('Registration failed. Please try again.');
      // Re-throw para a tela capturar e tratar
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Função de logout centralizada - única responsável pelo redirecionamento
   */
  const logout = async () => {
    try {
      console.log('🚪 [Auth] Starting logout process...');
      setLoading(true);
      
      // Clear Firebase authentication and local storage
      await AuthService.logout();
      
      // Clear local state
      setUser(null);
      setUserProfile(null);
      setIsAuthenticated(false);
      setError(null);
      
      console.log('✅ [Auth] Logout completed successfully');
      router.replace('/auth/login');
    } catch (error) {
      console.error('❌ [Auth] Error during logout:', error);
      
      // Force logout even if Firebase/AuthService fails
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
      console.log(`🔄 [${user.uid}] Updating user profile...`);
      
      // If updating profile image, delete old image first
      if (updates.profileImageUrl && userProfile?.profileImageUrl && 
          userProfile.profileImageUrl !== updates.profileImageUrl) {
        try {
          console.log(`🗑️ [${user.uid}] Deleting old profile image`);
          await FirebaseService.deleteProfileImage(userProfile.profileImageUrl);
        } catch (error) {
          console.warn('Could not delete old profile image:', error);
          // Don't fail the update if old image deletion fails
        }
      }
      
      await FirebaseService.updateUserProfile(user.uid, updates);
      console.log(`✅ [${user.uid}] Profile updated successfully`);
      
      // Update local state
      setUserProfile(prev => prev ? { ...prev, ...updates } : null);
    } catch (error) {
      console.error('Error updating profile:', error);
      console.error(`❌ [${user?.uid}] Profile update failed:`, error);
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