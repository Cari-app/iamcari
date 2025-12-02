-- Create fasting_assessments table
CREATE TABLE IF NOT EXISTS public.fasting_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Quiz answers
    eating_pattern TEXT,
    night_hunger TEXT,
    hunger_tolerance TEXT,
    meals_per_day TEXT,
    anxiety_level TEXT,
    sweet_relationship TEXT,
    morning_routine TEXT,
    fasting_experience TEXT,
    rules_tolerance TEXT,
    work_schedule TEXT,
    snacking_habit TEXT,
    morning_energy TEXT,
    main_goals TEXT,
    emotional_eating TEXT,
    twelve_hour_tolerance TEXT,
    
    -- Results (to be filled later)
    suggested_protocol TEXT,
    readiness_score INTEGER,
    scores JSONB
);

-- Enable RLS
ALTER TABLE public.fasting_assessments ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can manage their own assessments
CREATE POLICY "Users can CRUD own fasting assessments"
ON public.fasting_assessments
FOR ALL
USING (auth.uid() = user_id);