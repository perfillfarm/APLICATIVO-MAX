export interface User {
  id: string;
  email: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  user_id: string;
  name: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other';
  email: string;
  phone?: string;
  profile_image_url?: string;
  treatment_start_date?: string;
  has_seen_tutorial?: boolean;
  created_at: string;
  updated_at: string;
}

export interface DailyRecord {
  id?: string;
  user_id: string;
  date: string;
  capsules: number;
  time: string;
  notes?: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserSettings {
  user_id: string;
  notifications: boolean;
  reminder_time: string;
  daily_goal: number;
  weekly_goal: number;
  theme: 'light' | 'dark';
  language: 'en' | 'pt';
  created_at: string;
  updated_at: string;
}

export type Database = {
  public: {
    Tables: {
      users: {
        Row: User;
        Insert: Omit<User, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<User, 'id' | 'created_at'>>;
      };
      user_profiles: {
        Row: UserProfile;
        Insert: Omit<UserProfile, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<UserProfile, 'user_id' | 'created_at'>>;
      };
      daily_records: {
        Row: DailyRecord;
        Insert: Omit<DailyRecord, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<DailyRecord, 'id' | 'user_id' | 'created_at'>>;
      };
      user_settings: {
        Row: UserSettings;
        Insert: Omit<UserSettings, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<UserSettings, 'user_id' | 'created_at'>>;
      };
    };
  };
};