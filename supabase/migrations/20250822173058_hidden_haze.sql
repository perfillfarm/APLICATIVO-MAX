/*
  # Initial Schema for MaxTestorin Tracker

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `name` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `user_profiles`
      - `user_id` (uuid, foreign key to users.id)
      - `name` (text)
      - `date_of_birth` (text, optional)
      - `gender` (text, optional)
      - `email` (text)
      - `phone` (text, optional)
      - `profile_image_url` (text, optional)
      - `treatment_start_date` (text, optional)
      - `has_seen_tutorial` (boolean, default false)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `daily_records`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users.id)
      - `date` (text)
      - `capsules` (integer)
      - `time` (text)
      - `notes` (text, optional)
      - `completed` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `user_settings`
      - `user_id` (uuid, foreign key to users.id)
      - `notifications` (boolean, default true)
      - `reminder_time` (text, default '09:00')
      - `daily_goal` (integer, default 2)
      - `weekly_goal` (integer, default 14)
      - `theme` (text, default 'light')
      - `language` (text, default 'en')
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Add policies for users to read/write their own records

  3. Storage
    - Create profile-images bucket for user profile photos
    - Set up RLS policies for profile images
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  date_of_birth text,
  gender text CHECK (gender IN ('male', 'female', 'other')),
  email text NOT NULL,
  phone text,
  profile_image_url text,
  treatment_start_date text,
  has_seen_tutorial boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create daily_records table
CREATE TABLE IF NOT EXISTS daily_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date text NOT NULL,
  capsules integer NOT NULL DEFAULT 2,
  time text NOT NULL,
  notes text DEFAULT '',
  completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Create user_settings table
CREATE TABLE IF NOT EXISTS user_settings (
  user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  notifications boolean DEFAULT true,
  reminder_time text DEFAULT '09:00',
  daily_goal integer DEFAULT 2,
  weekly_goal integer DEFAULT 14,
  theme text DEFAULT 'light' CHECK (theme IN ('light', 'dark')),
  language text DEFAULT 'en' CHECK (language IN ('en', 'pt')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Create policies for user_profiles table
CREATE POLICY "Users can read own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own profile"
  ON user_profiles
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for daily_records table
CREATE POLICY "Users can read own records"
  ON daily_records
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own records"
  ON daily_records
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own records"
  ON daily_records
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own records"
  ON daily_records
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for user_settings table
CREATE POLICY "Users can read own settings"
  ON user_settings
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings"
  ON user_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings"
  ON user_settings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own settings"
  ON user_settings
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_daily_records_user_date ON daily_records(user_id, date);
CREATE INDEX IF NOT EXISTS idx_daily_records_date ON daily_records(date);
CREATE INDEX IF NOT EXISTS idx_daily_records_completed ON daily_records(completed);

-- Create storage bucket for profile images
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-images', 'profile-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies
CREATE POLICY "Users can upload own profile images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'profile-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view own profile images"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'profile-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update own profile images"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'profile-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own profile images"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'profile-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_records_updated_at
  BEFORE UPDATE ON daily_records
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();