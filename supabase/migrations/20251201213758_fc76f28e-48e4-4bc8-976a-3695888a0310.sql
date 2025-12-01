-- Add missing columns to meal_logs
ALTER TABLE meal_logs
ADD COLUMN IF NOT EXISTS food_name TEXT,
ADD COLUMN IF NOT EXISTS hunger_level TEXT,
ADD COLUMN IF NOT EXISTS ai_analysis TEXT,
ADD COLUMN IF NOT EXISTS entry_type TEXT DEFAULT 'meal',
ADD COLUMN IF NOT EXISTS metric_value DECIMAL,
ADD COLUMN IF NOT EXISTS mood_tag TEXT;

-- Create user_achievements table (for tracking unlocked achievements)
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_code TEXT NOT NULL,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, achievement_code)
);

ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_achievements_read" ON user_achievements FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "user_achievements_insert" ON user_achievements FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Add target_weight_kg alias column to assessments for compatibility
ALTER TABLE assessments
ADD COLUMN IF NOT EXISTS target_weight_kg DECIMAL GENERATED ALWAYS AS (target_weight) STORED;