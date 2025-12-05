-- Drop gamification functions with CASCADE (will drop dependent triggers)
DROP FUNCTION IF EXISTS public.process_gamification() CASCADE;
DROP FUNCTION IF EXISTS public.check_and_award_achievements() CASCADE;
DROP FUNCTION IF EXISTS public.check_streak_achievements() CASCADE;
DROP FUNCTION IF EXISTS public.initialize_user_stats() CASCADE;

-- Update handle_new_like to remove XP logic (keep only likes_count)
CREATE OR REPLACE FUNCTION public.handle_new_like()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    UPDATE public.feed_posts 
    SET likes_count = likes_count + 1 
    WHERE id = NEW.post_id;
    RETURN NEW;
END;
$function$;

-- Drop gamification tables
DROP TABLE IF EXISTS public.user_achievements CASCADE;
DROP TABLE IF EXISTS public.user_stats CASCADE;
DROP TABLE IF EXISTS public.achievements CASCADE;