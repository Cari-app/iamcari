-- Adicionar search_path às funções que faltam

-- 1. Atualizar handle_unlike
CREATE OR REPLACE FUNCTION public.handle_unlike()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
    UPDATE public.feed_posts 
    SET likes_count = likes_count - 1 
    WHERE id = OLD.post_id;
    RETURN OLD;
END;
$function$;