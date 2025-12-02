import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Não autorizado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const newAchievements: string[] = [];

    // Get user stats
    const { data: stats } = await supabaseClient
      .from('user_stats')
      .select('*')
      .eq('user_id', user.id)
      .single();

    // Get fasting sessions
    const { data: fastingSessions } = await supabaseClient
      .from('fasting_sessions')
      .select('*')
      .eq('user_id', user.id)
      .not('end_time', 'is', null);

    if (!fastingSessions || !stats) {
      return new Response(
        JSON.stringify({ newAchievements: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Count completed fasts
    const completedFasts = fastingSessions.filter(f => {
      const hours = (new Date(f.end_time).getTime() - new Date(f.start_time).getTime()) / (1000 * 60 * 60);
      return hours >= f.target_hours;
    });

    // Get longest fast
    const longestFastHours = Math.max(...fastingSessions.map(f => 
      (new Date(f.end_time).getTime() - new Date(f.start_time).getTime()) / (1000 * 60 * 60)
    ));

    // Check each achievement
    const achievementsToGrant = [];

    if (completedFasts.length >= 1) achievementsToGrant.push('primeiro_passo');
    if (completedFasts.length >= 10) achievementsToGrant.push('disciplinado');
    if (completedFasts.length >= 100) achievementsToGrant.push('centenario');
    if (longestFastHours >= 24) achievementsToGrant.push('mestre_do_jejum');
    if (stats.current_streak >= 7) achievementsToGrant.push('semana_de_fogo');
    if (stats.current_streak >= 30) achievementsToGrant.push('dedicado');
    if (stats.current_level >= 50) achievementsToGrant.push('guerreiro');

    // Insert achievements
    for (const code of achievementsToGrant) {
      const { error } = await supabaseClient
        .from('user_achievements')
        .insert({ user_id: user.id, achievement_code: code });
      
      if (!error) {
        const { data: achievement } = await supabaseClient
          .from('achievements')
          .select('name')
          .eq('code', code)
          .single();
        
        if (achievement) {
          newAchievements.push(achievement.name);
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        newAchievements,
        totalChecked: achievementsToGrant.length 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error checking achievements:', error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
