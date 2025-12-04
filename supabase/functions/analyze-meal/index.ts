import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { meal_log_id } = await req.json();

    if (!meal_log_id) {
      return new Response(
        JSON.stringify({ error: "meal_log_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Buscar o meal_log com a imagem
    const { data: mealLog, error: fetchError } = await supabase
      .from("meal_logs")
      .select("id, image_url, user_id, description")
      .eq("id", meal_log_id)
      .single();

    if (fetchError || !mealLog) {
      console.error("Error fetching meal log:", fetchError);
      return new Response(
        JSON.stringify({ error: "Meal log not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!mealLog.image_url) {
      return new Response(
        JSON.stringify({ error: "No image URL found for this meal" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Buscar contexto do usuário (dieta ativa, meta calórica)
    const { data: profile } = await supabase
      .from("profiles")
      .select("active_diet, daily_calories_target, fasting_protocol")
      .eq("id", mealLog.user_id)
      .single();

    const dietContext = profile?.active_diet 
      ? `O usuário segue uma dieta ${profile.active_diet} com meta de ${profile.daily_calories_target || 2000} calorias diárias.`
      : "Sem dieta específica definida.";

    // 3. Chamar Lovable AI para analisar a imagem
    const systemPrompt = `Você é a Cari, uma assistente de nutrição especializada em análise de refeições.
Analise a imagem da refeição e retorne APENAS um JSON válido (sem markdown, sem código) com a seguinte estrutura:
{
  "food_name": "Nome curto da refeição (ex: Frango Grelhado com Salada)",
  "description": "Descrição detalhada dos alimentos identificados",
  "calories": número inteiro estimado de calorias,
  "macros": {
    "protein": número em gramas,
    "carbs": número em gramas,
    "fat": número em gramas
  },
  "health_score": número de 1 a 10,
  "tips": "Dica curta sobre a refeição"
}

${dietContext}

Seja preciso nas estimativas baseando-se em porções típicas brasileiras.
Retorne SOMENTE o JSON, sem explicações adicionais.`;

    console.log("Calling Lovable AI to analyze image:", mealLog.image_url);

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: mealLog.description 
                  ? `Analise esta refeição. Contexto adicional: ${mealLog.description}`
                  : "Analise esta refeição e forneça os dados nutricionais."
              },
              {
                type: "image_url",
                image_url: { url: mealLog.image_url }
              }
            ]
          }
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI Gateway error:", aiResponse.status, errorText);
      
      // Atualizar status para erro
      await supabase
        .from("meal_logs")
        .update({ status: "error" })
        .eq("id", meal_log_id);

      return new Response(
        JSON.stringify({ error: "AI analysis failed", details: errorText }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices?.[0]?.message?.content;

    console.log("AI Response:", aiContent);

    if (!aiContent) {
      await supabase
        .from("meal_logs")
        .update({ status: "error" })
        .eq("id", meal_log_id);

      return new Response(
        JSON.stringify({ error: "Empty AI response" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 4. Parse do JSON da resposta
    let analysis;
    try {
      // Limpar possíveis caracteres extras
      const cleanedContent = aiContent
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
      analysis = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error("JSON parse error:", parseError, "Content:", aiContent);
      
      await supabase
        .from("meal_logs")
        .update({ status: "error" })
        .eq("id", meal_log_id);

      return new Response(
        JSON.stringify({ error: "Failed to parse AI response", raw: aiContent }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 5. Atualizar o meal_log com os dados analisados
    const { error: updateError } = await supabase
      .from("meal_logs")
      .update({
        food_name: analysis.food_name || "Refeição",
        description: analysis.description || mealLog.description,
        calories: analysis.calories || 0,
        macros: analysis.macros || { protein: 0, carbs: 0, fat: 0 },
        ai_analysis: {
          health_score: analysis.health_score,
          tips: analysis.tips,
          analyzed_at: new Date().toISOString(),
          ...analysis.macros
        },
        status: "analyzed"
      })
      .eq("id", meal_log_id);

    if (updateError) {
      console.error("Error updating meal log:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to update meal log" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Meal analysis completed successfully for:", meal_log_id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        analysis: {
          food_name: analysis.food_name,
          calories: analysis.calories,
          macros: analysis.macros,
          health_score: analysis.health_score,
          tips: analysis.tips
        }
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Unexpected error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unexpected error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
