-- Criar user_stats para todos os usuários existentes que não têm
INSERT INTO public.user_stats (user_id, current_level, current_cycle_xp, total_xp, current_streak, longest_streak, game_coins)
SELECT 
  p.id,
  1 as current_level,
  0 as current_cycle_xp,
  0 as total_xp,
  0 as current_streak,
  0 as longest_streak,
  0 as game_coins
FROM public.profiles p
LEFT JOIN public.user_stats us ON p.id = us.user_id
WHERE us.user_id IS NULL;

-- Criar função para inicializar user_stats automaticamente
CREATE OR REPLACE FUNCTION public.initialize_user_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Criar registro em user_stats
  INSERT INTO public.user_stats (
    user_id,
    current_level,
    current_cycle_xp,
    total_xp,
    current_streak,
    longest_streak,
    game_coins
  ) VALUES (
    NEW.id,
    1,
    0,
    0,
    0,
    0,
    0
  );
  
  RETURN NEW;
END;
$$;

-- Criar trigger para executar após criação de profile
DROP TRIGGER IF EXISTS on_profile_created_init_stats ON public.profiles;
CREATE TRIGGER on_profile_created_init_stats
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.initialize_user_stats();