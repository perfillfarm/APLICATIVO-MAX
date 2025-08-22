import { supabase } from '@/config/supabase';
import { User, UserProfile, DailyRecord, UserSettings } from '@/types/database';

export class SupabaseService {
  // Authentication Methods
  static async registerUser(email: string, password: string, name: string): Promise<User> {
    try {
      console.log(`🔐 [Supabase] Registering user: ${email}`);
      
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('No user returned from signup');

      // Create user record
      const userData: Omit<User, 'id' | 'created_at' | 'updated_at'> = {
        email: authData.user.email!,
        name,
      };

      const { data: userRecord, error: userError } = await supabase
        .from('users')
        .insert(userData)
        .select()
        .single();

      if (userError) throw userError;

      // Create default profile
      await this.createUserProfile(authData.user.id, {
        user_id: authData.user.id,
        name,
        email: authData.user.email!,
      });

      // Create default settings
      await this.createUserSettings(authData.user.id, {
        user_id: authData.user.id,
        notifications: true,
        reminder_time: '09:00',
        daily_goal: 2,
        weekly_goal: 14,
        theme: 'light',
        language: 'en',
      });

      console.log(`✅ [Supabase] User registered successfully: ${authData.user.id}`);
      return userRecord;
    } catch (error) {
      console.error('❌ [Supabase] Error registering user:', error);
      throw error;
    }
  }

  static async loginUser(email: string, password: string): Promise<any> {
    try {
      console.log(`🔐 [Supabase] Logging in user: ${email}`);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      if (!data.user) throw new Error('No user returned from login');

      console.log(`✅ [Supabase] User logged in successfully: ${data.user.id}`);
      return data.user;
    } catch (error) {
      console.error('❌ [Supabase] Error logging in:', error);
      throw error;
    }
  }

  static async logoutUser(): Promise<void> {
    try {
      console.log('🚪 [Supabase] Starting logout process...');
      
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      // Clear any cached data
      if (typeof window !== 'undefined') {
        localStorage.removeItem('supabase.auth.token');
        sessionStorage.clear();
      }

      console.log('✅ [Supabase] Logout completed successfully');
    } catch (error) {
      console.error('❌ [Supabase] Error during logout:', error);
      throw error;
    }
  }

  // User Profile Methods
  static async createUserProfile(userId: string, profileData: Omit<UserProfile, 'created_at' | 'updated_at'>): Promise<void> {
    try {
      console.log(`👤 [Supabase] Creating user profile for: ${userId}`);
      
      const { error } = await supabase
        .from('user_profiles')
        .insert(profileData);

      if (error) throw error;
      console.log(`✅ [Supabase] User profile created successfully`);
    } catch (error) {
      console.error('❌ [Supabase] Error creating user profile:', error);
      throw error;
    }
  }

  static async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      console.log(`👤 [Supabase] Getting user profile for: ${userId}`);
      
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
      
      console.log(`✅ [Supabase] User profile retrieved:`, data ? 'Found' : 'Not found');
      return data;
    } catch (error) {
      console.error('❌ [Supabase] Error getting user profile:', error);
      throw error;
    }
  }

  static async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<void> {
    try {
      console.log(`👤 [Supabase] Updating user profile for: ${userId}`);
      
      const { error } = await supabase
        .from('user_profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

      if (error) throw error;
      console.log(`✅ [Supabase] User profile updated successfully`);
    } catch (error) {
      console.error('❌ [Supabase] Error updating user profile:', error);
      throw error;
    }
  }

  // Tutorial Methods
  static async markTutorialAsSeen(userId: string): Promise<void> {
    try {
      console.log(`🎓 [Supabase] Marking tutorial as seen for user: ${userId}`);
      
      const { error } = await supabase
        .from('user_profiles')
        .update({
          has_seen_tutorial: true,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

      if (error) throw error;
      console.log(`✅ [Supabase] Tutorial marked as seen`);
    } catch (error) {
      console.error('❌ [Supabase] Error marking tutorial as seen:', error);
      throw error;
    }
  }

  static async hasUserSeenTutorial(userId: string): Promise<boolean> {
    try {
      console.log(`🎓 [Supabase] Checking tutorial status for user: ${userId}`);
      
      const { data, error } = await supabase
        .from('user_profiles')
        .select('has_seen_tutorial')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      const hasSeenTutorial = data?.has_seen_tutorial || false;
      console.log(`✅ [Supabase] Tutorial status: ${hasSeenTutorial}`);
      return hasSeenTutorial;
    } catch (error) {
      console.error('❌ [Supabase] Error checking tutorial status:', error);
      return true; // Default to true to avoid showing tutorial on error
    }
  }

  static async resetTutorialStatus(userId: string): Promise<void> {
    try {
      console.log(`🔄 [Supabase] Resetting tutorial status for user: ${userId}`);
      
      const { error } = await supabase
        .from('user_profiles')
        .update({
          has_seen_tutorial: false,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

      if (error) throw error;
      console.log(`✅ [Supabase] Tutorial status reset`);
    } catch (error) {
      console.error('❌ [Supabase] Error resetting tutorial status:', error);
      throw error;
    }
  }

  // Daily Records Methods
  static async createDailyRecord(record: Omit<DailyRecord, 'id' | 'created_at' | 'updated_at'>): Promise<string> {
    try {
      console.log(`💊 [Supabase] Creating daily record for user ${record.user_id} on ${record.date}`);
      
      const { data, error } = await supabase
        .from('daily_records')
        .insert(record)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('No data returned from insert');

      console.log(`✅ [Supabase] Daily record created with ID: ${data.id}`);
      return data.id;
    } catch (error) {
      console.error('❌ [Supabase] Error creating daily record:', error);
      throw error;
    }
  }

  static async getDailyRecords(userId: string, limitCount?: number): Promise<DailyRecord[]> {
    try {
      console.log(`🔍 [Supabase] Getting daily records for user ${userId}${limitCount ? ` (limit: ${limitCount})` : ''}`);
      
      let query = supabase
        .from('daily_records')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (limitCount) {
        query = query.limit(limitCount);
      }

      const { data, error } = await query;

      if (error) throw error;

      console.log(`✅ [Supabase] Retrieved ${data?.length || 0} daily records`);
      return data || [];
    } catch (error) {
      console.error('❌ [Supabase] Error getting daily records:', error);
      return [];
    }
  }

  static async getDailyRecordByDate(userId: string, date: string): Promise<DailyRecord | null> {
    try {
      console.log(`🔍 [Supabase] Searching daily record for user ${userId} on ${date}`);
      
      const { data, error } = await supabase
        .from('daily_records')
        .select('*')
        .eq('user_id', userId)
        .eq('date', date)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      console.log(`✅ [Supabase] Daily record for ${date}:`, data ? 'Found' : 'Not found');
      return data;
    } catch (error) {
      console.error('❌ [Supabase] Error getting daily record by date:', error);
      throw error;
    }
  }

  static async updateDailyRecord(recordId: string, updates: Partial<DailyRecord>): Promise<void> {
    try {
      console.log(`🔄 [Supabase] Updating daily record ${recordId}`);
      
      const { error } = await supabase
        .from('daily_records')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', recordId);

      if (error) throw error;
      console.log(`✅ [Supabase] Daily record updated successfully`);
    } catch (error) {
      console.error('❌ [Supabase] Error updating daily record:', error);
      throw error;
    }
  }

  static async deleteDailyRecord(recordId: string): Promise<void> {
    try {
      console.log(`🗑️ [Supabase] Deleting daily record ${recordId}`);
      
      const { error } = await supabase
        .from('daily_records')
        .delete()
        .eq('id', recordId);

      if (error) throw error;
      console.log(`✅ [Supabase] Daily record deleted successfully`);
    } catch (error) {
      console.error('❌ [Supabase] Error deleting daily record:', error);
      throw error;
    }
  }

  // User Settings Methods
  static async createUserSettings(userId: string, settings: Omit<UserSettings, 'created_at' | 'updated_at'>): Promise<void> {
    try {
      console.log(`⚙️ [Supabase] Creating user settings for: ${userId}`);
      
      const { error } = await supabase
        .from('user_settings')
        .insert(settings);

      if (error) throw error;
      console.log(`✅ [Supabase] User settings created successfully`);
    } catch (error) {
      console.error('❌ [Supabase] Error creating user settings:', error);
      throw error;
    }
  }

  static async getUserSettings(userId: string): Promise<UserSettings | null> {
    try {
      console.log(`⚙️ [Supabase] Getting user settings for: ${userId}`);
      
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (!data) {
        // Create default settings if they don't exist
        const defaultSettings: Omit<UserSettings, 'created_at' | 'updated_at'> = {
          user_id: userId,
          notifications: true,
          reminder_time: '09:00',
          daily_goal: 2,
          weekly_goal: 14,
          theme: 'light',
          language: 'en',
        };

        await this.createUserSettings(userId, defaultSettings);
        return {
          ...defaultSettings,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      }

      console.log(`✅ [Supabase] User settings retrieved successfully`);
      return data;
    } catch (error) {
      console.error('❌ [Supabase] Error getting user settings:', error);
      throw error;
    }
  }

  static async updateUserSettings(userId: string, updates: Partial<UserSettings>): Promise<void> {
    try {
      console.log(`⚙️ [Supabase] Updating user settings for: ${userId}`);
      
      const { error } = await supabase
        .from('user_settings')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

      if (error) throw error;
      console.log(`✅ [Supabase] User settings updated successfully`);
    } catch (error) {
      console.error('❌ [Supabase] Error updating user settings:', error);
      throw error;
    }
  }

  // File Upload Methods (using Supabase Storage)
  static async uploadProfileImage(userId: string, imageUri: string): Promise<string> {
    try {
      console.log(`📸 [Supabase] Starting profile image upload for user ${userId}`);
      
      const response = await fetch(imageUri);
      const blob = await response.blob();
      
      // Create unique filename with timestamp
      const timestamp = Date.now();
      const fileName = `profile_${timestamp}.jpg`;
      const filePath = `profile-images/${userId}/${fileName}`;
      
      console.log(`📤 [Supabase] Uploading image to: ${filePath}`);
      
      const { data, error } = await supabase.storage
        .from('profile-images')
        .upload(`${userId}/${fileName}`, blob, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) throw error;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('profile-images')
        .getPublicUrl(`${userId}/${fileName}`);

      console.log(`✅ [Supabase] Profile image uploaded successfully: ${urlData.publicUrl}`);
      return urlData.publicUrl;
    } catch (error) {
      console.error('❌ [Supabase] Error uploading profile image:', error);
      throw error;
    }
  }

  static async deleteProfileImage(imageUrl: string): Promise<void> {
    try {
      console.log(`🗑️ [Supabase] Deleting profile image: ${imageUrl}`);
      
      // Extract file path from URL
      const url = new URL(imageUrl);
      const pathParts = url.pathname.split('/');
      const fileName = pathParts[pathParts.length - 1];
      const userId = pathParts[pathParts.length - 2];
      const filePath = `${userId}/${fileName}`;
      
      const { error } = await supabase.storage
        .from('profile-images')
        .remove([filePath]);

      if (error) throw error;
      console.log(`✅ [Supabase] Profile image deleted successfully`);
    } catch (error) {
      console.error('❌ [Supabase] Error deleting profile image:', error);
      throw error;
    }
  }

  // Real-time Listeners
  static subscribeToUserProfile(userId: string, callback: (profile: UserProfile | null) => void) {
    console.log(`🔔 [Supabase] Setting up profile subscription for user: ${userId}`);
    
    return supabase
      .channel(`profile_${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_profiles',
          filter: `user_id=eq.${userId}`,
        },
        async (payload) => {
          console.log('🔔 [Supabase] Profile change detected:', payload);
          
          if (payload.eventType === 'DELETE') {
            callback(null);
          } else {
            // Fetch updated profile
            const profile = await this.getUserProfile(userId);
            callback(profile);
          }
        }
      )
      .subscribe();
  }

  static subscribeToDailyRecords(userId: string, callback: (records: DailyRecord[]) => void) {
    console.log(`🔔 [Supabase] Setting up records subscription for user: ${userId}`);
    
    // Initial fetch
    this.getDailyRecords(userId).then(callback);

    // Set up real-time subscription
    return supabase
      .channel(`records_${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'daily_records',
          filter: `user_id=eq.${userId}`,
        },
        async (payload) => {
          console.log('🔔 [Supabase] Records change detected:', payload);
          
          // Fetch updated records
          const records = await this.getDailyRecords(userId);
          callback(records);
        }
      )
      .subscribe();
  }

  // Password Recovery
  static async sendPasswordResetEmail(email: string): Promise<void> {
    try {
      console.log(`🔐 [Supabase] Sending password reset email to: ${email}`);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/login`,
      });

      if (error) throw error;
      console.log(`✅ [Supabase] Password reset email sent successfully`);
    } catch (error) {
      console.error('❌ [Supabase] Error sending password reset email:', error);
      throw error;
    }
  }

  // Batch Operations
  static async clearAllUserData(userId: string): Promise<void> {
    try {
      console.log(`🧹 [Supabase] Clearing all data for user: ${userId}`);
      
      // Delete user profile
      await supabase
        .from('user_profiles')
        .delete()
        .eq('user_id', userId);

      // Delete user settings
      await supabase
        .from('user_settings')
        .delete()
        .eq('user_id', userId);

      // Delete all daily records
      await supabase
        .from('daily_records')
        .delete()
        .eq('user_id', userId);

      console.log(`✅ [Supabase] All user data cleared successfully`);
    } catch (error) {
      console.error('❌ [Supabase] Error clearing user data:', error);
      throw error;
    }
  }

  // Migration Methods
  static async migrateFromAsyncStorage(userId: string, localData: any): Promise<void> {
    try {
      console.log(`📦 [Supabase] Starting migration for user: ${userId}`);
      
      // Migrate daily records
      if (localData.dailyRecords) {
        const records = JSON.parse(localData.dailyRecords);
        const recordsToInsert = records.map((record: any) => ({
          user_id: userId,
          date: record.date,
          capsules: record.capsules || record.drops || 2,
          time: record.time,
          notes: record.notes || '',
          completed: record.completed,
        }));

        if (recordsToInsert.length > 0) {
          const { error } = await supabase
            .from('daily_records')
            .insert(recordsToInsert);
          
          if (error) throw error;
          console.log(`✅ [Supabase] Migrated ${recordsToInsert.length} daily records`);
        }
      }

      // Migrate user profile
      if (localData.userProfile) {
        const profile = JSON.parse(localData.userProfile);
        await this.createUserProfile(userId, {
          user_id: userId,
          name: profile.name,
          date_of_birth: profile.dateOfBirth,
          gender: profile.gender,
          email: profile.email,
          phone: profile.phone,
          profile_image_url: profile.profileImageUrl,
          treatment_start_date: profile.treatmentStartDate,
        });
      }

      // Migrate settings
      if (localData.appSettings) {
        const settings = JSON.parse(localData.appSettings);
        await this.createUserSettings(userId, {
          user_id: userId,
          notifications: settings.notifications ?? true,
          reminder_time: settings.reminderTime || '09:00',
          daily_goal: settings.dailyGoal || 2,
          weekly_goal: settings.weeklyGoal || 14,
          theme: settings.theme || 'light',
          language: settings.language || 'en',
        });
      }

      console.log(`✅ [Supabase] Migration completed successfully`);
    } catch (error) {
      console.error('❌ [Supabase] Error during migration:', error);
      throw error;
    }
  }
}