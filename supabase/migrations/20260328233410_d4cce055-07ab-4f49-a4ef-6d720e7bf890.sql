
-- Table: fasting_onboarding_answers
CREATE TABLE public.fasting_onboarding_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  primary_goal text NOT NULL,
  goal_range text NOT NULL,
  fasting_experience text NOT NULL,
  routine_type text NOT NULL,
  hardest_period text NOT NULL,
  easiest_fasting_period text NOT NULL,
  hunger_tolerance text NOT NULL,
  snacking_frequency text NOT NULL,
  routine_break_response text NOT NULL,
  main_food_barrier text NOT NULL,
  preferred_plan_style text NOT NULL,
  fasting_response text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.fasting_onboarding_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own onboarding answers"
  ON public.fasting_onboarding_answers FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own onboarding answers"
  ON public.fasting_onboarding_answers FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Table: fasting_plan_results
CREATE TABLE public.fasting_plan_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  profile_type text NOT NULL,
  profile_label text NOT NULL,
  plan_focus text NOT NULL,
  recommended_protocol_hours integer NOT NULL,
  schedule_start text NOT NULL,
  schedule_end text NOT NULL,
  schedule_label text NOT NULL,
  weekly_goal_days integer NOT NULL,
  progression_next_step text NOT NULL,
  behavior_alerts jsonb NOT NULL DEFAULT '[]'::jsonb,
  reason_summary text NOT NULL,
  support_style text NOT NULL,
  plan_style text NOT NULL,
  dynamic_tags jsonb NOT NULL DEFAULT '[]'::jsonb,
  active_plan boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.fasting_plan_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own plan results"
  ON public.fasting_plan_results FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own plan results"
  ON public.fasting_plan_results FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own plan results"
  ON public.fasting_plan_results FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);
