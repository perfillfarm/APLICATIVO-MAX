import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  updateProfile,
  User as FirebaseUser
} from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, auth, storage } from '@/config/firebase';

// Types
export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile {
  userId: string;
  name: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  email: string;
  phone?: string;
  profileImageUrl?: string;
  treatmentStartDate?: string;
  hasSeenTutorial?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface DailyRecord {
  id?: string;
  userId: string;
  date: string;
  capsules: number;
  time: string;
  notes?: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserSettings {
  userId: string;
  notifications: boolean;
  reminderTime: string;
  dailyGoal: number; // 2 capsules
  weeklyGoal: number; // 14 capsules
  theme: 'light' | 'dark';
  language: 'en' | 'pt';
  createdAt: Date;
  updatedAt: Date;
}

export class FirebaseService {
  // Authentication Methods
  static async registerUser(email: string, password: string, name: string): Promise<User> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Update display name
      await updateProfile(firebaseUser, { displayName: name });
      
      // Create user document
      const userData: User = {
        id: firebaseUser.uid,
        email: firebaseUser.email!,
        name,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await setDoc(doc(db, 'users', firebaseUser.uid), {
        ...userData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      // Create default profile
      await this.createUserProfile(firebaseUser.uid, {
        userId: firebaseUser.uid,
        name,
        email: firebaseUser.email!,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      // Create default settings
      await this.createUserSettings(firebaseUser.uid, {
        userId: firebaseUser.uid,
        notifications: true,
        reminderTime: '09:00',
        dailyGoal: 2,
        weeklyGoal: 14,
        theme: 'light',
        language: 'en',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      return userData;
    } catch (error) {
      console.error('Error registering user:', error);
      throw error;
    }
  }
  
  static async loginUser(email: string, password: string): Promise<FirebaseUser> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      console.error('Error logging in:', error);
      throw error;
    }
  }
  
  static async logoutUser(): Promise<void> {
    try {
      console.log('🔥 [Firebase] Starting Firebase Auth signOut...');
      
      // Get current user before signing out
      const currentUser = auth.currentUser;
      console.log('🔥 [Firebase] Current user before logout:', currentUser?.uid || 'none');
      
      // Clear any cached auth state
      if (typeof window !== 'undefined') {
        localStorage.removeItem('firebase:authUser');
        localStorage.removeItem('firebase:host');
        
        // Clear all Firebase-related localStorage keys
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
          if (key.startsWith('firebase:') || key.startsWith('firebaseui::')) {
            localStorage.removeItem(key);
          }
        });
        
        sessionStorage.clear();
      }
      
      await signOut(auth);
      console.log('✅ [Firebase] Firebase Auth signOut completed');
      
      // Verify user is signed out
      const userAfterLogout = auth.currentUser;
      console.log('🔥 [Firebase] User after logout:', userAfterLogout?.uid || 'none');
      
    } catch (error) {
      console.error('❌ [Firebase] Error during signOut:', error);
      
      // Force clear even on error
      if (typeof window !== 'undefined') {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
          if (key.startsWith('firebase:') || key.startsWith('firebaseui::')) {
            localStorage.removeItem(key);
          }
        });
        sessionStorage.clear();
      }
      
      // Don't throw error to prevent blocking logout
      console.log('⚠️ [Firebase] Logout completed with errors, but state cleared');
    }
  }
  
  // User Profile Methods
  static async createUserProfile(userId: string, profileData: Omit<UserProfile, 'userId'>): Promise<void> {
    try {
      await setDoc(doc(db, 'userProfiles', userId), {
        ...profileData,
        userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw error;
    }
  }
  
  static async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const docRef = doc(db, 'userProfiles', userId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as UserProfile;
      }
      return null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      throw error;
    }
  }
  
  static async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<void> {
    try {
      const docRef = doc(db, 'userProfiles', userId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  // Tutorial Methods
  static async markTutorialAsSeen(userId: string): Promise<void> {
    try {
      console.log(`🎓 [Firebase] Marking tutorial as seen for user ${userId}`);
      const docRef = doc(db, 'userProfiles', userId);
      await updateDoc(docRef, {
        hasSeenTutorial: true,
        updatedAt: serverTimestamp()
      });
      console.log(`✅ [Firebase] Tutorial marked as seen for user ${userId}`);
    } catch (error) {
      console.error('❌ [Firebase] Error marking tutorial as seen:', error);
      throw error;
    }
  }

  static async hasUserSeenTutorial(userId: string): Promise<boolean> {
    try {
      console.log(`🔍 [Firebase] Checking if user ${userId} has seen tutorial`);
      const docRef = doc(db, 'userProfiles', userId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        const hasSeenTutorial = data.hasSeenTutorial || false;
        console.log(`✅ [Firebase] User ${userId} tutorial status: ${hasSeenTutorial}`);
        return hasSeenTutorial;
      }
      
      console.log(`ℹ️ [Firebase] No profile found for user ${userId}, tutorial not seen`);
      return false;
    } catch (error) {
      console.error('❌ [Firebase] Error checking tutorial status:', error);
      // Em caso de erro, não mostrar tutorial para evitar spam
      return true;
    }
  }

  static async resetTutorialStatus(userId: string): Promise<void> {
    try {
      console.log(`🔄 [Firebase] Resetting tutorial status for user ${userId}`);
      const docRef = doc(db, 'userProfiles', userId);
      await updateDoc(docRef, {
        hasSeenTutorial: false,
        updatedAt: serverTimestamp()
      });
      console.log(`✅ [Firebase] Tutorial status reset for user ${userId}`);
    } catch (error) {
      console.error('❌ [Firebase] Error resetting tutorial status:', error);
      throw error;
    }
  }
  
  // Daily Records Methods
  static async createDailyRecord(record: Omit<DailyRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      console.log(`💊 [Firebase] Creating daily record for user ${record.userId} on ${record.date}:`, {
        date: record.date,
        capsules: record.capsules,
        completed: record.completed,
        time: record.time,
        notes: record.notes
      });
      
      const docRef = doc(collection(db, 'dailyRecords'));
      await setDoc(docRef, {
        ...record,
        id: docRef.id,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      console.log(`✅ [Firebase] Daily record created with ID: ${docRef.id} for ${record.date}`);
      return docRef.id;
    } catch (error) {
      console.error('Error creating daily record:', error);
      console.error(`❌ [Firebase] Failed to create daily record for user ${record.userId}:`, error);
      throw error;
    }
  }
  
  static async getDailyRecords(userId: string, limitCount?: number): Promise<DailyRecord[]> {
    try {
      console.log(`🔍 [Firebase] Getting daily records for user ${userId}${limitCount ? ` (limit: ${limitCount})` : ' (all records)'}`);
      
      // Usar query simples sem orderBy para evitar erro de índice
      const q = query(
        collection(db, 'dailyRecords'),
        where('userId', '==', userId)
      );
      
      const querySnapshot = await getDocs(q);
      const recordCount = querySnapshot.docs.length;
      console.log(`✅ [Firebase] Retrieved ${recordCount} daily records for user ${userId}`);
      
      let records = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as DailyRecord;
      });
      
      // Ordenar localmente por data (mais recente primeiro)
      records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      // Log date range for debugging
      if (records.length > 0) {
        console.log(`📅 [Firebase] Records date range:`, {
          oldest: records[records.length - 1].date,
          newest: records[0].date,
          completedCount: records.filter(r => r.completed).length,
          totalCapsules: records.filter(r => r.completed).reduce((sum, r) => sum + r.capsules, 0)
        });
      }
      
      // Aplicar limit após ordenação local se necessário
      if (limitCount && records.length > limitCount) {
        records = records.slice(0, limitCount);
        console.log(`📊 [Firebase] Applied limit: showing ${limitCount} of ${recordCount} records`);
      }
      
      return records;
    } catch (error) {
      console.error('Error getting daily records:', error);
      console.error(`❌ [Firebase] Failed to get daily records for user ${userId}:`, error);
      // Retornar array vazio em caso de erro
      return [];
    }
  }
  
  static async getDailyRecordByDate(userId: string, date: string): Promise<DailyRecord | null> {
    try {
      console.log(`🔍 [Firebase] Searching daily record for user ${userId} on ${date}`);
      
      const q = query(
        collection(db, 'dailyRecords'),
        where('userId', '==', userId),
        where('date', '==', date)
      );
      
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        const data = doc.data();
        console.log(`✅ [Firebase] Found daily record for user ${userId} on ${date}:`, {
          id: doc.id,
          completed: data.completed,
          capsules: data.capsules,
          time: data.time
        });
        return {
          ...data,
          id: doc.id,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as DailyRecord;
      }
      
      console.log(`ℹ️ [Firebase] No daily record found for user ${userId} on ${date}`);
      return null;
    } catch (error) {
      console.error('Error getting daily record by date:', error);
      console.error(`❌ [Firebase] Failed to get daily record for user ${userId} on ${date}:`, error);
      throw error;
    }
  }
  
  static async updateDailyRecord(recordId: string, updates: Partial<DailyRecord>): Promise<void> {
    try {
      console.log(`🔄 [Firebase] Updating daily record ${recordId}:`, {
        recordId,
        updates
      });
      
      const docRef = doc(db, 'dailyRecords', recordId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
      
      console.log(`✅ [Firebase] Daily record ${recordId} updated successfully`);
    } catch (error) {
      console.error('Error updating daily record:', error);
      console.error(`❌ [Firebase] Failed to update daily record ${recordId}:`, error);
      throw error;
    }
  }
  
  static async deleteDailyRecord(recordId: string): Promise<void> {
    try {
      console.log(`🔄 [Firebase] Deleting daily record ${recordId}`);
      await deleteDoc(doc(db, 'dailyRecords', recordId));
      console.log(`✅ [Firebase] Daily record ${recordId} deleted successfully`);
    } catch (error) {
      console.error('Error deleting daily record:', error);
      console.error(`❌ [Firebase] Failed to delete daily record ${recordId}:`, error);
      throw error;
    }
  }
  
  // User Settings Methods
  static async createUserSettings(userId: string, settings: Omit<UserSettings, 'userId'>): Promise<void> {
    try {
      await setDoc(doc(db, 'userSettings', userId), {
        ...settings,
        userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error creating user settings:', error);
      throw error;
    }
  }
  
  static async getUserSettings(userId: string): Promise<UserSettings | null> {
    try {
      const docRef = doc(db, 'userSettings', userId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as UserSettings;
      } else {
        // Create default settings if they don't exist
        const defaultSettings: UserSettings = {
          userId,
          notifications: true,
          reminderTime: '09:00',
          dailyGoal: 2,
          weeklyGoal: 14,
          theme: 'light',
          language: 'en',
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        await this.createUserSettings(userId, defaultSettings);
        return defaultSettings;
      }
    } catch (error) {
      console.error('Error getting user settings:', error);
      throw error;
    }
  }
  
  static async updateUserSettings(userId: string, updates: Partial<UserSettings>): Promise<void> {
    try {
      const docRef = doc(db, 'userSettings', userId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating user settings:', error);
      throw error;
    }
  }
  
  // File Upload Methods
  static async uploadProfileImage(userId: string, imageUri: string): Promise<string> {
    try {
      console.log(`📸 [Firebase] Starting profile image upload for user ${userId}`);
      
      const response = await fetch(imageUri);
      const blob = await response.blob();
      
      // Create unique filename with timestamp
      const timestamp = Date.now();
      const imageRef = ref(storage, `profileImages/${userId}/profile_${timestamp}.jpg`);
      
      console.log(`📤 [Firebase] Uploading image to: profileImages/${userId}/profile_${timestamp}.jpg`);
      await uploadBytes(imageRef, blob);
      
      const downloadURL = await getDownloadURL(imageRef);
      console.log(`✅ [Firebase] Profile image uploaded successfully: ${downloadURL}`);
      return downloadURL;
    } catch (error) {
      console.error('Error uploading profile image:', error);
      console.error(`❌ [Firebase] Failed to upload profile image for user ${userId}:`, error);
      throw error;
    }
  }
  
  static async deleteProfileImage(imageUrl: string): Promise<void> {
    try {
      console.log(`🗑️ [Firebase] Deleting profile image: ${imageUrl}`);
      const imageRef = ref(storage, imageUrl);
      await deleteObject(imageRef);
      console.log(`✅ [Firebase] Profile image deleted successfully`);
    } catch (error) {
      console.error('Error deleting profile image:', error);
      console.error(`❌ [Firebase] Failed to delete profile image:`, error);
      throw error;
    }
  }
  
  // Real-time Listeners
  static subscribeToUserProfile(userId: string, callback: (profile: UserProfile | null) => void) {
    const docRef = doc(db, 'userProfiles', userId);
    return onSnapshot(docRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        callback({
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as UserProfile);
      } else {
        callback(null);
      }
    });
  }
  
  static subscribeToDailyRecords(userId: string, callback: (records: DailyRecord[]) => void) {
    console.log(`🔥 [Firebase] Setting up real-time listener for user ${userId}`);
    
    // Usar query simples sem orderBy para evitar erro de índice
    const q = query(
      collection(db, 'dailyRecords'),
      where('userId', '==', userId)
    );
    
    return onSnapshot(q, (querySnapshot) => {
      console.log(`🔥 [Firebase] Real-time update for user ${userId}: ${querySnapshot.docs.length} records`);
      
      let records = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as DailyRecord;
      });
      
      // Ordenar localmente por data (mais recente primeiro)
      records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      // Enhanced logging for real-time updates
      if (records.length > 0) {
        const monthlyBreakdown = records.reduce((acc, record) => {
          const monthKey = record.date.substring(0, 7); // YYYY-MM
          if (!acc[monthKey]) {
            acc[monthKey] = { total: 0, completed: 0 };
          }
          acc[monthKey].total++;
          if (record.completed) {
            acc[monthKey].completed++;
          }
          return acc;
        }, {} as Record<string, { total: number; completed: number }>);
        
        console.log(`📊 [Firebase] Monthly breakdown:`, monthlyBreakdown);
      }
      
      console.log(`✅ [Firebase] Processed records for callback:`, {
        userId,
        recordCount: records.length,
        completedCount: records.filter(r => r.completed).length,
        dateRange: records.length > 0 ? `${records[records.length - 1].date} to ${records[0].date}` : 'none'
      });
      
      callback(records);
    }, (error) => {
      console.error('❌ [Firebase] Error in real-time listener:', error);
      // Em caso de erro, retornar array vazio
      callback([]);
    });
  }
  
  // Batch Operations
  static async clearAllUserData(userId: string): Promise<void> {
    try {
      const batch = writeBatch(db);
      
      // Delete user profile
      batch.delete(doc(db, 'userProfiles', userId));
      
      // Delete user settings
      batch.delete(doc(db, 'userSettings', userId));
      
      // Delete all daily records
      const recordsQuery = query(
        collection(db, 'dailyRecords'),
        where('userId', '==', userId)
      );
      const recordsSnapshot = await getDocs(recordsQuery);
      recordsSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      await batch.commit();
    } catch (error) {
      console.error('Error clearing user data:', error);
      throw error;
    }
  }
  
  // Migration Methods
  static async migrateFromAsyncStorage(userId: string, localData: any): Promise<void> {
    try {
      const batch = writeBatch(db);
      
      // Migrate daily records
      if (localData.dailyRecords) {
        const records = JSON.parse(localData.dailyRecords);
        records.forEach((record: any) => {
          const docRef = doc(collection(db, 'dailyRecords'));
          batch.set(docRef, {
            ...record,
            userId,
            id: docRef.id,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
        });
      }
      
      // Migrate user profile
      if (localData.userProfile) {
        const profile = JSON.parse(localData.userProfile);
        batch.set(doc(db, 'userProfiles', userId), {
          ...profile,
          userId,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
      
      // Migrate settings
      if (localData.appSettings) {
        const settings = JSON.parse(localData.appSettings);
        batch.set(doc(db, 'userSettings', userId), {
          ...settings,
          userId,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
      
      await batch.commit();
    } catch (error) {
      console.error('Error migrating from AsyncStorage:', error);
      throw error;
    }
  }
}