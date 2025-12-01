-- Fix security warning: Add search_path to function
DROP FUNCTION IF EXISTS calculate_diet_score() CASCADE;

CREATE OR REPLACE FUNCTION calculate_diet_score()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    -- Pontuações para cada dieta
    score_jejum INTEGER := 0;
    score_lowcarb INTEGER := 0;
    score_keto INTEGER := 0;
    score_mediterranea INTEGER := 0;
    score_flexivel INTEGER := 0;
    score_plantbased INTEGER := 0;
    
    winner_score INTEGER := -999;
    winner_id TEXT := 'flexivel';
BEGIN
    -- ========== JEJUM INTERMITENTE ==========
    IF NEW.eating_habit = 'Esqueço de comer' THEN score_jejum := score_jejum + 30; END IF;
    IF NEW.night_hunger = 'Quase nunca' THEN score_jejum := score_jejum + 20; END IF;
    IF NEW.discipline_level = 'Alto' THEN score_jejum := score_jejum + 20; END IF;
    IF NEW.cooking_time IN ('Zero', 'Pouco') THEN score_jejum := score_jejum + 15; END IF;
    IF NEW.meals_per_day = '1-2' THEN score_jejum := score_jejum + 25; END IF;
    IF NEW.eating_trigger = 'Ansiedade' AND NEW.night_hunger = 'Sempre' AND NEW.fasting_history = 'Horrível' THEN 
        score_jejum := -999; 
    END IF;

    -- ========== LOW CARB ==========
    IF NEW.discipline_level IN ('Médio', 'Alto') THEN score_lowcarb := score_lowcarb + 20; END IF;
    IF NEW.carb_preference IN ('Tanto faz', 'Evito') THEN score_lowcarb := score_lowcarb + 25; END IF;
    IF NEW.eating_trigger = 'Fome' THEN score_lowcarb := score_lowcarb + 15; END IF;
    IF NEW.cooking_time IN ('Médio', 'Bastante') THEN score_lowcarb := score_lowcarb + 10; END IF;

    -- ========== KETO ==========
    IF NEW.carb_preference = 'Evito' THEN score_keto := score_keto + 30; END IF;
    IF NEW.meat_consumption = 'Muito' THEN score_keto := score_keto + 25; END IF;
    IF NEW.discipline_level = 'Alto' THEN score_keto := score_keto + 20; END IF;
    IF NEW.main_goal = 'Emagrecer Rápido' THEN score_keto := score_keto + 20; END IF;
    IF NEW.dietary_restrictions = 'Vegetariano' THEN score_keto := -999; END IF;

    -- ========== MEDITERRÂNEA ==========
    IF NEW.eating_trigger = 'Ansiedade' THEN score_mediterranea := score_mediterranea + 20; END IF;
    IF NEW.night_hunger = 'Sempre' THEN score_mediterranea := score_mediterranea + 15; END IF;
    IF NEW.main_goal = 'Saúde' THEN score_mediterranea := score_mediterranea + 25; END IF;
    IF NEW.discipline_level = 'Médio' THEN score_mediterranea := score_mediterranea + 15; END IF;
    IF NEW.cooking_time IN ('Médio', 'Bastante') THEN score_mediterranea := score_mediterranea + 15; END IF;
    IF NEW.meat_consumption IN ('Pouco', 'Normal') THEN score_mediterranea := score_mediterranea + 10; END IF;

    -- ========== FLEXÍVEL (IIFYM) ==========
    IF NEW.discipline_level = 'Baixo' THEN score_flexivel := score_flexivel + 25; END IF;
    IF NEW.carb_preference = 'Amo' THEN score_flexivel := score_flexivel + 30; END IF;
    IF NEW.eating_trigger = 'Tédio' THEN score_flexivel := score_flexivel + 20; END IF;
    IF NEW.structure_preference = 'Liberdade' THEN score_flexivel := score_flexivel + 20; END IF;
    IF NEW.main_goal = 'Energia' THEN score_flexivel := score_flexivel + 15; END IF;

    -- ========== PLANT-BASED ==========
    IF NEW.meat_consumption = 'Não como' THEN score_plantbased := score_plantbased + 50; END IF;
    IF NEW.dietary_restrictions = 'Vegetariano' THEN score_plantbased := score_plantbased + 50; END IF;
    IF NEW.carb_preference IN ('Amo', 'Gosto') THEN score_plantbased := score_plantbased + 15; END IF;

    -- ========== ELEIÇÃO DO VENCEDOR ==========
    winner_score := score_flexivel;
    winner_id := 'flexivel';
    
    IF score_jejum > winner_score THEN 
        winner_score := score_jejum; 
        winner_id := 'jejum'; 
    END IF;
    
    IF score_lowcarb > winner_score THEN 
        winner_score := score_lowcarb; 
        winner_id := 'low_carb'; 
    END IF;
    
    IF score_keto > winner_score THEN 
        winner_score := score_keto; 
        winner_id := 'keto'; 
    END IF;
    
    IF score_mediterranea > winner_score THEN 
        winner_score := score_mediterranea; 
        winner_id := 'mediterranea'; 
    END IF;
    
    IF score_plantbased > winner_score THEN 
        winner_score := score_plantbased; 
        winner_id := 'plant_based'; 
    END IF;

    NEW.suggested_diet := winner_id;
    NEW.scores := json_build_object(
        'jejum', score_jejum,
        'low_carb', score_lowcarb,
        'keto', score_keto,
        'mediterranea', score_mediterranea,
        'flexivel', score_flexivel,
        'plant_based', score_plantbased
    );

    UPDATE profiles 
    SET active_diet = winner_id 
    WHERE id = NEW.user_id;

    RETURN NEW;
END;
$$;

CREATE TRIGGER on_nutrition_assessment
BEFORE INSERT ON nutrition_assessments
FOR EACH ROW
EXECUTE FUNCTION calculate_diet_score();