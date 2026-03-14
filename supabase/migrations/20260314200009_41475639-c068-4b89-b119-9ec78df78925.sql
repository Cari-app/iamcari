
-- =============================================
-- FIX ALL RLS POLICIES: RESTRICTIVE → PERMISSIVE
-- =============================================

-- 1. ASSESSMENTS - Drop all and recreate
DROP POLICY IF EXISTS "Users can delete their own assessments" ON public.assessments;
DROP POLICY IF EXISTS "Users can insert their own assessments" ON public.assessments;
DROP POLICY IF EXISTS "Users can update their own assessments" ON public.assessments;
DROP POLICY IF EXISTS "Users can view their own assessments" ON public.assessments;

CREATE POLICY "Users can view their own assessments" ON public.assessments FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own assessments" ON public.assessments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own assessments" ON public.assessments FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own assessments" ON public.assessments FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- 2. DIET_TYPES - Drop and recreate
DROP POLICY IF EXISTS "Anyone can view diet types" ON public.diet_types;
CREATE POLICY "Anyone can view diet types" ON public.diet_types FOR SELECT USING (true);

-- 3. FASTING_ASSESSMENTS - Drop and recreate
DROP POLICY IF EXISTS "Users can insert their own fasting assessments" ON public.fasting_assessments;
DROP POLICY IF EXISTS "Users can view their own fasting assessments" ON public.fasting_assessments;

CREATE POLICY "Users can view their own fasting assessments" ON public.fasting_assessments FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own fasting assessments" ON public.fasting_assessments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- 4. FASTING_LOGS - Drop and recreate
DROP POLICY IF EXISTS "Users can delete their own fasting logs" ON public.fasting_logs;
DROP POLICY IF EXISTS "Users can insert their own fasting logs" ON public.fasting_logs;
DROP POLICY IF EXISTS "Users can update their own fasting logs" ON public.fasting_logs;
DROP POLICY IF EXISTS "Users can view their own fasting logs" ON public.fasting_logs;

CREATE POLICY "Users can view their own fasting logs" ON public.fasting_logs FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own fasting logs" ON public.fasting_logs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own fasting logs" ON public.fasting_logs FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own fasting logs" ON public.fasting_logs FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- 5. FASTING_SESSIONS - Drop and recreate
DROP POLICY IF EXISTS "Users can delete their own fasting sessions" ON public.fasting_sessions;
DROP POLICY IF EXISTS "Users can insert their own fasting sessions" ON public.fasting_sessions;
DROP POLICY IF EXISTS "Users can update their own fasting sessions" ON public.fasting_sessions;
DROP POLICY IF EXISTS "Users can view their own fasting sessions" ON public.fasting_sessions;

CREATE POLICY "Users can view their own fasting sessions" ON public.fasting_sessions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own fasting sessions" ON public.fasting_sessions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own fasting sessions" ON public.fasting_sessions FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own fasting sessions" ON public.fasting_sessions FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- 6. MEAL_LOGS - Drop and recreate
DROP POLICY IF EXISTS "Users can delete their own meal logs" ON public.meal_logs;
DROP POLICY IF EXISTS "Users can insert their own meal logs" ON public.meal_logs;
DROP POLICY IF EXISTS "Users can update their own meal logs" ON public.meal_logs;
DROP POLICY IF EXISTS "Users can view their own meal logs" ON public.meal_logs;

CREATE POLICY "Users can view their own meal logs" ON public.meal_logs FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own meal logs" ON public.meal_logs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own meal logs" ON public.meal_logs FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own meal logs" ON public.meal_logs FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- 7. MOOD_LOGS - Drop and recreate
DROP POLICY IF EXISTS "Users can delete their own mood logs" ON public.mood_logs;
DROP POLICY IF EXISTS "Users can insert their own mood logs" ON public.mood_logs;
DROP POLICY IF EXISTS "Users can update their own mood logs" ON public.mood_logs;
DROP POLICY IF EXISTS "Users can view their own mood logs" ON public.mood_logs;

CREATE POLICY "Users can view their own mood logs" ON public.mood_logs FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own mood logs" ON public.mood_logs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own mood logs" ON public.mood_logs FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own mood logs" ON public.mood_logs FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- 8. NUTRITION_ASSESSMENTS - Drop and recreate
DROP POLICY IF EXISTS "Users can insert their own nutrition assessments" ON public.nutrition_assessments;
DROP POLICY IF EXISTS "Users can view their own nutrition assessments" ON public.nutrition_assessments;

CREATE POLICY "Users can view their own nutrition assessments" ON public.nutrition_assessments FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own nutrition assessments" ON public.nutrition_assessments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- 9. PROFILES - Drop and recreate
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- 10. USER_ACHIEVEMENTS - Drop and recreate
DROP POLICY IF EXISTS "Users can insert their own achievements" ON public.user_achievements;
DROP POLICY IF EXISTS "Users can view their own achievements" ON public.user_achievements;

CREATE POLICY "Users can view their own achievements" ON public.user_achievements FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own achievements" ON public.user_achievements FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- 11. USER_ROLES - Drop and recreate SELECT + BLOCK all writes
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;

CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
-- No INSERT/UPDATE/DELETE policies = writes blocked for all users (only service_role can manage roles)

-- 12. WATER_LOGS - Drop and recreate
DROP POLICY IF EXISTS "Users can delete their own water logs" ON public.water_logs;
DROP POLICY IF EXISTS "Users can insert their own water logs" ON public.water_logs;
DROP POLICY IF EXISTS "Users can update their own water logs" ON public.water_logs;
DROP POLICY IF EXISTS "Users can view their own water logs" ON public.water_logs;

CREATE POLICY "Users can view their own water logs" ON public.water_logs FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own water logs" ON public.water_logs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own water logs" ON public.water_logs FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own water logs" ON public.water_logs FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- 13. WEIGHT_LOGS - Drop and recreate
DROP POLICY IF EXISTS "Users can delete their own weight logs" ON public.weight_logs;
DROP POLICY IF EXISTS "Users can insert their own weight logs" ON public.weight_logs;
DROP POLICY IF EXISTS "Users can update their own weight logs" ON public.weight_logs;
DROP POLICY IF EXISTS "Users can view their own weight logs" ON public.weight_logs;

CREATE POLICY "Users can view their own weight logs" ON public.weight_logs FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own weight logs" ON public.weight_logs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own weight logs" ON public.weight_logs FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own weight logs" ON public.weight_logs FOR DELETE TO authenticated USING (auth.uid() = user_id);
