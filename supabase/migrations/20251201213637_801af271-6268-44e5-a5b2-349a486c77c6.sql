-- Create assessments table (metabolic assessment)
CREATE TABLE IF NOT EXISTS assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  gender TEXT NOT NULL,
  age INTEGER NOT NULL,
  height DECIMAL NOT NULL,
  weight DECIMAL NOT NULL,
  activity_level TEXT NOT NULL,
  goal_type TEXT NOT NULL,
  goal_speed TEXT,
  target_weight DECIMAL,
  bmr DECIMAL,
  tdee DECIMAL,
  target_calories DECIMAL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "assessments_user_read" ON assessments FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "assessments_user_insert" ON assessments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Create user_stats table (gamification)
CREATE TABLE IF NOT EXISTS user_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  current_level INTEGER DEFAULT 1,
  current_cycle_xp INTEGER DEFAULT 0,
  total_xp INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  game_coins INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_stats_read" ON user_stats FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "user_stats_update" ON user_stats FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Create fasting_sessions table
CREATE TABLE IF NOT EXISTS fasting_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  target_hours INTEGER NOT NULL,
  protocol_type TEXT DEFAULT 'standard',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE fasting_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fasting_sessions_user_read" ON fasting_sessions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "fasting_sessions_user_insert" ON fasting_sessions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "fasting_sessions_user_update" ON fasting_sessions FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Create meal_logs table
CREATE TABLE IF NOT EXISTS meal_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  description TEXT,
  calories INTEGER,
  image_url TEXT,
  is_emotional BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE meal_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "meal_logs_user_read" ON meal_logs FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "meal_logs_user_insert" ON meal_logs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "meal_logs_user_update" ON meal_logs FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "meal_logs_user_delete" ON meal_logs FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Create nutrition_assessments table
CREATE TABLE IF NOT EXISTS nutrition_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  eating_habit TEXT,
  night_hunger TEXT,
  discipline_level TEXT,
  cooking_time TEXT,
  carb_preference TEXT,
  meat_consumption TEXT,
  fasting_history TEXT,
  eating_trigger TEXT,
  main_goal TEXT,
  structure_preference TEXT,
  meals_per_day TEXT,
  dietary_restrictions TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE nutrition_assessments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "nutrition_assessments_user_read" ON nutrition_assessments FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "nutrition_assessments_user_insert" ON nutrition_assessments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Trigger to create user_stats when profile is created
CREATE OR REPLACE FUNCTION create_user_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_stats (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_profile_created ON profiles;
CREATE TRIGGER on_profile_created
  AFTER INSERT ON profiles
  FOR EACH ROW EXECUTE FUNCTION create_user_stats();