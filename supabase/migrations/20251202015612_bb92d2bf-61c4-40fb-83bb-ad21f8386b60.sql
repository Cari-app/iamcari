-- Clear existing achievements and insert new ones
TRUNCATE TABLE achievements CASCADE;

-- Insert game-connected achievements
INSERT INTO achievements (code, name, description, icon, xp_reward) VALUES
('primeiro_passo', 'Primeiro Passo', 'Complete seu primeiro jejum', '🏁', 50),
('semana_de_fogo', 'Semana de Fogo', 'Mantenha 7 dias de streak consecutivos', '🔥', 100),
('centenario', 'Centenário', 'Complete 100 jejuns', '💯', 500),
('guerreiro', 'Guerreiro', 'Atinja o nível 50', '⚔️', 300),
('dedicado', 'Dedicado', 'Mantenha 30 dias de streak', '🎯', 200),
('mestre_do_jejum', 'Mestre do Jejum', 'Complete um jejum de 24h', '👑', 150),
('disciplinado', 'Disciplinado', 'Complete 10 jejuns consecutivos', '💪', 100),
('explorador', 'Explorador', 'Teste 3 protocolos de jejum diferentes', '🗺️', 80);

-- Create function to check and award achievements
CREATE OR REPLACE FUNCTION public.check_and_award_achievements()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_stats_record RECORD;
    completed_fasts_count INTEGER;
    longest_fast_hours NUMERIC;
BEGIN
    -- Get user stats
    SELECT * INTO user_stats_record 
    FROM user_stats 
    WHERE user_id = NEW.user_id;
    
    -- Count completed fasts
    SELECT COUNT(*) INTO completed_fasts_count
    FROM fasting_sessions
    WHERE user_id = NEW.user_id 
    AND end_time IS NOT NULL
    AND EXTRACT(EPOCH FROM (end_time - start_time)) / 3600 >= target_hours;
    
    -- Get longest fast
    SELECT MAX(EXTRACT(EPOCH FROM (end_time - start_time)) / 3600) INTO longest_fast_hours
    FROM fasting_sessions
    WHERE user_id = NEW.user_id 
    AND end_time IS NOT NULL;
    
    -- Achievement: Primeiro Passo (Complete first fast)
    IF completed_fasts_count >= 1 THEN
        INSERT INTO user_achievements (user_id, achievement_code)
        VALUES (NEW.user_id, 'primeiro_passo')
        ON CONFLICT (user_id, achievement_code) DO NOTHING;
    END IF;
    
    -- Achievement: Disciplinado (10 completed fasts)
    IF completed_fasts_count >= 10 THEN
        INSERT INTO user_achievements (user_id, achievement_code)
        VALUES (NEW.user_id, 'disciplinado')
        ON CONFLICT (user_id, achievement_code) DO NOTHING;
    END IF;
    
    -- Achievement: Centenário (100 completed fasts)
    IF completed_fasts_count >= 100 THEN
        INSERT INTO user_achievements (user_id, achievement_code)
        VALUES (NEW.user_id, 'centenario')
        ON CONFLICT (user_id, achievement_code) DO NOTHING;
    END IF;
    
    -- Achievement: Mestre do Jejum (24h fast)
    IF longest_fast_hours >= 24 THEN
        INSERT INTO user_achievements (user_id, achievement_code)
        VALUES (NEW.user_id, 'mestre_do_jejum')
        ON CONFLICT (user_id, achievement_code) DO NOTHING;
    END IF;
    
    RETURN NEW;
END;
$$;

-- Create function to check streak achievements
CREATE OR REPLACE FUNCTION public.check_streak_achievements()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Achievement: Semana de Fogo (7 day streak)
    IF NEW.current_streak >= 7 THEN
        INSERT INTO user_achievements (user_id, achievement_code)
        VALUES (NEW.user_id, 'semana_de_fogo')
        ON CONFLICT (user_id, achievement_code) DO NOTHING;
    END IF;
    
    -- Achievement: Dedicado (30 day streak)
    IF NEW.current_streak >= 30 THEN
        INSERT INTO user_achievements (user_id, achievement_code)
        VALUES (NEW.user_id, 'dedicado')
        ON CONFLICT (user_id, achievement_code) DO NOTHING;
    END IF;
    
    -- Achievement: Guerreiro (Level 50)
    IF NEW.current_level >= 50 THEN
        INSERT INTO user_achievements (user_id, achievement_code)
        VALUES (NEW.user_id, 'guerreiro')
        ON CONFLICT (user_id, achievement_code) DO NOTHING;
    END IF;
    
    RETURN NEW;
END;
$$;

-- Add unique constraint to user_achievements
ALTER TABLE user_achievements 
ADD CONSTRAINT user_achievements_unique 
UNIQUE (user_id, achievement_code);

-- Create triggers
DROP TRIGGER IF EXISTS trigger_check_achievements ON fasting_sessions;
CREATE TRIGGER trigger_check_achievements
    AFTER INSERT OR UPDATE ON fasting_sessions
    FOR EACH ROW
    EXECUTE FUNCTION check_and_award_achievements();

DROP TRIGGER IF EXISTS trigger_check_streak_achievements ON user_stats;
CREATE TRIGGER trigger_check_streak_achievements
    AFTER UPDATE ON user_stats
    FOR EACH ROW
    EXECUTE FUNCTION check_streak_achievements();