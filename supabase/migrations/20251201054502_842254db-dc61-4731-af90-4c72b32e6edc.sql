-- Ensure full row data is captured for realtime updates
ALTER TABLE public.user_stats REPLICA IDENTITY FULL;