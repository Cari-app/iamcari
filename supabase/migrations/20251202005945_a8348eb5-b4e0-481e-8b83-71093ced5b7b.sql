-- Create function to calculate fasting protocol recommendation
CREATE OR REPLACE FUNCTION public.calculate_fasting_protocol()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
    score_not_ready INTEGER := 0;
    score_preparation INTEGER := 0;
    score_12_12 INTEGER := 0;
    score_14_10 INTEGER := 0;
    score_16_8 INTEGER := 0;
    score_18_6 INTEGER := 0;
    
    winner_score INTEGER := -999;
    winner_protocol TEXT := 'preparation';
    readiness INTEGER := 50;
BEGIN
    -- ========== BLOQUEADORES (NÃO RECOMENDADO) ==========
    -- Alta ansiedade + fome noturna intensa + experiência ruim = NÃO RECOMENDADO
    IF NEW.anxiety_level = 'Alto' AND NEW.night_hunger = 'Muito intensa' AND NEW.fasting_experience = 'Sim, foi horrível' THEN
        score_not_ready := 1000;
    END IF;
    
    -- Problemas graves com fome
    IF NEW.hunger_tolerance = 'Me irrito facilmente' AND NEW.night_hunger = 'Muito intensa' THEN
        score_not_ready := score_not_ready + 100;
    END IF;
    
    -- ========== PREPARAÇÃO (7 DIAS) ==========
    IF NEW.anxiety_level = 'Moderado' OR NEW.anxiety_level = 'Alto' THEN 
        score_preparation := score_preparation + 30; 
    END IF;
    
    IF NEW.emotional_eating IN ('Como por estresse', 'Como por tédio') THEN 
        score_preparation := score_preparation + 25; 
    END IF;
    
    IF NEW.work_schedule = 'Caóticos' THEN 
        score_preparation := score_preparation + 20; 
    END IF;
    
    IF NEW.snacking_habit = 'Sim, o tempo todo' THEN 
        score_preparation := score_preparation + 20; 
    END IF;
    
    IF NEW.sweet_relationship = 'Como todos os dias' THEN 
        score_preparation := score_preparation + 15; 
    END IF;
    
    -- ========== JEJUM 12/12 ==========
    IF NEW.morning_routine = 'Geralmente não sinto fome cedo' THEN 
        score_12_12 := score_12_12 + 30; 
    END IF;
    
    IF NEW.rules_tolerance IN ('Consigo seguir algumas regras simples', 'Gosto de flexibilidade') THEN 
        score_12_12 := score_12_12 + 25; 
    END IF;
    
    IF NEW.fasting_experience = 'Nunca tentei' THEN 
        score_12_12 := score_12_12 + 20; 
    END IF;
    
    IF NEW.anxiety_level = 'Baixo' THEN 
        score_12_12 := score_12_12 + 15; 
    END IF;
    
    -- ========== JEJUM 14/10 ==========
    IF NEW.hunger_tolerance IN ('Consigo segurar um pouco', 'Lido bem com fome leve') THEN 
        score_14_10 := score_14_10 + 30; 
    END IF;
    
    IF NEW.morning_routine IN ('Corrida, sem tempo pra nada', 'Geralmente não sinto fome cedo') THEN 
        score_14_10 := score_14_10 + 25; 
    END IF;
    
    IF NEW.meals_per_day = '3 a 4' THEN 
        score_14_10 := score_14_10 + 20; 
    END IF;
    
    IF NEW.night_hunger IN ('Pouca', 'Média') THEN 
        score_14_10 := score_14_10 + 20; 
    END IF;
    
    IF NEW.work_schedule IN ('Previsíveis', 'Muito fixos') THEN 
        score_14_10 := score_14_10 + 15; 
    END IF;
    
    -- ========== JEJUM 16/8 ==========
    IF NEW.eating_pattern = 'Pulo refeições sem perceber' OR NEW.eating_pattern = 'Sou disciplinado na maior parte do tempo' THEN 
        score_16_8 := score_16_8 + 35; 
    END IF;
    
    IF NEW.fasting_experience IN ('Sim, foi tranquilo', 'Sim, foi difícil mas deu certo') THEN 
        score_16_8 := score_16_8 + 30; 
    END IF;
    
    IF NEW.hunger_tolerance IN ('Lido bem com fome leve', 'Fome raramente aparece') THEN 
        score_16_8 := score_16_8 + 25; 
    END IF;
    
    IF NEW.morning_energy IN ('Boa', 'Muito boa') THEN 
        score_16_8 := score_16_8 + 20; 
    END IF;
    
    IF NEW.meals_per_day = '1 a 2' THEN 
        score_16_8 := score_16_8 + 20; 
    END IF;
    
    IF NEW.night_hunger = 'Quase nenhuma' THEN 
        score_16_8 := score_16_8 + 15; 
    END IF;
    
    -- ========== JEJUM 18/6 ou OMAD ==========
    IF NEW.eating_pattern = 'Sou disciplinado na maior parte do tempo' THEN 
        score_18_6 := score_18_6 + 40; 
    END IF;
    
    IF NEW.rules_tolerance = 'Sigo regras com facilidade' THEN 
        score_18_6 := score_18_6 + 35; 
    END IF;
    
    IF NEW.work_schedule = 'Muito fixos' THEN 
        score_18_6 := score_18_6 + 30; 
    END IF;
    
    IF NEW.main_goals = 'Emagrecer' THEN 
        score_18_6 := score_18_6 + 25; 
    END IF;
    
    IF NEW.meals_per_day = '1 a 2' THEN 
        score_18_6 := score_18_6 + 25; 
    END IF;
    
    IF NEW.hunger_tolerance = 'Fome raramente aparece' THEN 
        score_18_6 := score_18_6 + 20; 
    END IF;
    
    IF NEW.morning_energy = 'Muito boa' THEN 
        score_18_6 := score_18_6 + 15; 
    END IF;
    
    -- ========== ELEIÇÃO DO VENCEDOR ==========
    -- Não Recomendado tem prioridade máxima
    IF score_not_ready >= 100 THEN
        winner_protocol := 'not_ready';
        readiness := 20;
    ELSE
        -- Comparar outros protocolos
        winner_score := score_preparation;
        winner_protocol := 'preparation';
        readiness := 40;
        
        IF score_12_12 > winner_score THEN
            winner_score := score_12_12;
            winner_protocol := '12_12';
            readiness := 60;
        END IF;
        
        IF score_14_10 > winner_score THEN
            winner_score := score_14_10;
            winner_protocol := '14_10';
            readiness := 70;
        END IF;
        
        IF score_16_8 > winner_score THEN
            winner_score := score_16_8;
            winner_protocol := '16_8';
            readiness := 85;
        END IF;
        
        IF score_18_6 > winner_score THEN
            winner_score := score_18_6;
            winner_protocol := '18_6';
            readiness := 95;
        END IF;
    END IF;
    
    -- Salvar resultado
    NEW.suggested_protocol := winner_protocol;
    NEW.readiness_score := readiness;
    NEW.scores := json_build_object(
        'not_ready', score_not_ready,
        'preparation', score_preparation,
        '12_12', score_12_12,
        '14_10', score_14_10,
        '16_8', score_16_8,
        '18_6', score_18_6
    );
    
    RETURN NEW;
END;
$function$;

-- Create trigger
DROP TRIGGER IF EXISTS calculate_fasting_protocol_trigger ON public.fasting_assessments;
CREATE TRIGGER calculate_fasting_protocol_trigger
BEFORE INSERT ON public.fasting_assessments
FOR EACH ROW
EXECUTE FUNCTION public.calculate_fasting_protocol();