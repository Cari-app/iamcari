import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
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

    // Get user from JWT
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Não autorizado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { imageBlob, fileName, isEmotional } = await req.json();

    // 1. Check if user is admin
    const { data: userRole, error: roleError } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();

    const isAdmin = !!userRole;

    // 2. Check FitCoin balance (skip for admins)
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('token_balance')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      return new Response(
        JSON.stringify({ error: 'Erro ao verificar saldo' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const FITCOIN_COST = 1;
    
    // Admins have unlimited FitCoins
    if (!isAdmin && (!profile || profile.token_balance < FITCOIN_COST)) {
      return new Response(
        JSON.stringify({ 
          error: 'insufficient_balance',
          message: 'Saldo insuficiente de FitCoins',
          currentBalance: profile?.token_balance || 0,
          required: FITCOIN_COST
        }),
        { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2. Upload image to storage
    const imageBuffer = Uint8Array.from(atob(imageBlob), c => c.charCodeAt(0));
    
    const { data: uploadData, error: uploadError } = await supabaseClient.storage
      .from('meal_photos')
      .upload(fileName, imageBuffer, {
        contentType: 'image/jpeg',
        cacheControl: '3600',
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      return new Response(
        JSON.stringify({ error: 'Erro ao enviar imagem' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 3. Get public URL
    const { data: { publicUrl } } = supabaseClient.storage
      .from('meal_photos')
      .getPublicUrl(fileName);

    // 4. Deduct FitCoin and record transaction (only for non-admins)
    let newBalance = profile.token_balance;
    
    if (!isAdmin) {
      const { error: updateError } = await supabaseClient
        .from('profiles')
        .update({ token_balance: profile.token_balance - FITCOIN_COST })
        .eq('id', user.id);

      if (updateError) {
        console.error('Error updating balance:', updateError);
        // Rollback: delete uploaded image
        await supabaseClient.storage.from('meal_photos').remove([fileName]);
        return new Response(
          JSON.stringify({ error: 'Erro ao processar pagamento' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      newBalance = profile.token_balance - FITCOIN_COST;

      // 5. Record transaction
      const { error: transactionError } = await supabaseClient
        .from('token_transactions')
        .insert({
          user_id: user.id,
          amount: -FITCOIN_COST,
          description: 'Análise de refeição com IA',
        });

      if (transactionError) {
        console.error('Error recording transaction:', transactionError);
        // Continue anyway - the deduction was successful
      }
    }

    // 6. Insert meal log
    const { error: insertError } = await supabaseClient
      .from('meal_logs')
      .insert({
        user_id: user.id,
        entry_type: 'meal',
        image_url: publicUrl,
        status: 'pending',
        food_name: 'Aguardando análise de imagem...',
        is_emotional: isEmotional || false,
      });

    if (insertError) {
      console.error('Database insert error:', insertError);
      return new Response(
        JSON.stringify({ error: 'Erro ao registrar refeição' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        newBalance: newBalance,
        imageUrl: publicUrl,
        isAdmin: isAdmin
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Function error:', error);
    return new Response(
      JSON.stringify({ error: (error as Error).message || 'Erro interno' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
