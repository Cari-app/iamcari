-- Fix gamification trigger to only give GameCoins, not FitCoins
CREATE OR REPLACE FUNCTION public.process_gamification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    hours_done NUMERIC;
    xp_gain INTEGER;
    stats_record RECORD;
    new_cycle_total INTEGER;
    levels_gained INTEGER;
    gamecoins_reward INTEGER;
BEGIN
    -- Só roda se o jejum foi concluído
    IF NEW.end_time IS NOT NULL AND OLD.end_time IS NULL THEN
        
        -- Calcula horas e XP
        hours_done := EXTRACT(EPOCH FROM (NEW.end_time - NEW.start_time)) / 3600;
        xp_gain := ROUND(hours_done * 10);
        
        IF hours_done >= NEW.target_hours THEN
            xp_gain := xp_gain + 50;
        END IF;

        SELECT * INTO stats_record FROM public.user_stats WHERE user_id = NEW.user_id;

        IF stats_record IS NULL THEN
            -- Novo usuário: inicializa stats
            INSERT INTO public.user_stats (user_id, total_xp, current_cycle_xp, current_level, game_coins)
            VALUES (NEW.user_id, xp_gain, (xp_gain % 1000), 1 + floor(xp_gain / 1000), 10 * (1 + floor(xp_gain / 1000)));
        ELSE
            -- Usuário existente: atualiza XP e calcula níveis ganhos
            new_cycle_total := stats_record.current_cycle_xp + xp_gain;
            levels_gained := floor(new_cycle_total / 1000);
            
            -- GameCoins reward: 10 GameCoins por nível ganho
            gamecoins_reward := 10 * levels_gained;
            
            -- Se não subiu de nível, ganha 1 GameCoin pelo jejum completado
            IF levels_gained = 0 THEN
                gamecoins_reward := 1;
            END IF;

            UPDATE public.user_stats
            SET 
                total_xp = total_xp + xp_gain,
                current_level = current_level + levels_gained,
                current_cycle_xp = (new_cycle_total % 1000),
                game_coins = game_coins + gamecoins_reward,
                updated_at = now()
            WHERE user_id = NEW.user_id;
        END IF;
    END IF;
    RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.process_gamification() IS 'Distribui XP e GameCoins ao completar jejum. FitCoins são apenas comprados via planos.';