-- Add missing columns to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS fasting_protocol TEXT,
ADD COLUMN IF NOT EXISTS weight DECIMAL,
ADD COLUMN IF NOT EXISTS height DECIMAL,
ADD COLUMN IF NOT EXISTS age INTEGER,
ADD COLUMN IF NOT EXISTS gender TEXT,
ADD COLUMN IF NOT EXISTS activity_level TEXT;

-- Create diet_types table
CREATE TABLE IF NOT EXISTS diet_types (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  full_description TEXT NOT NULL,
  color_theme TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE diet_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "diet_types_read_all" ON diet_types FOR SELECT TO authenticated USING (true);

-- Create achievements table
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_key TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, achievement_key)
);

ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "achievements_user_read" ON achievements FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "achievements_user_insert" ON achievements FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);