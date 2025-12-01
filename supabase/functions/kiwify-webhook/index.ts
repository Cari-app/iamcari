import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // 1. Validação de Método
    if (req.method !== 'POST') {
      return new Response('Method not allowed', { 
        status: 405,
        headers: corsHeaders 
      })
    }

    // 2. Pegar dados da Kiwify
    const payload = await req.json()
    console.log('📦 Webhook recebido:', JSON.stringify(payload, null, 2))
    
    const { order_id, order_status, Customer, Product } = payload
    
    // Verifica se o pagamento foi aprovado
    if (order_status !== 'paid') {
      console.log('⏳ Pedido não pago ainda:', order_status)
      return new Response(JSON.stringify({ message: 'Order not paid yet' }), { 
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      })
    }

    const userEmail = Customer?.email || payload.customer?.email
    
    if (!userEmail) {
      console.error('❌ Email não encontrado no webhook')
      return new Response('Email not found', { status: 400, headers: corsHeaders })
    }

    console.log('🔍 Buscando usuário:', userEmail)

    // 3. Encontrar o Usuário no Supabase pelo Email
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, token_balance')
      .eq('email', userEmail)
      .single()

    if (profileError || !profile) {
      console.error('❌ Usuário não encontrado:', userEmail, profileError)
      return new Response(JSON.stringify({ error: 'User not found' }), { 
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      })
    }

    const userId = profile.id
    console.log('✅ Usuário encontrado:', userId)

    // 4. Lógica de Entrega (Assinatura vs Tokens)
    
    const productId = Product?.product_id || payload.product_id
    console.log('📦 Product ID:', productId)

    // CASO A: Assinatura Premium
    // Substitua 'SEU_PRODUCT_ID_PREMIUM' pelo ID real do produto na Kiwify
    if (productId === 'd426cbe0-ce60-11f0-9119-9fe5587bc657') {
      console.log('💎 Ativando assinatura premium...')
      
      // Calcula expiração (30 dias)
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + 30)

      // Insere/Atualiza Assinatura
      const { error: subError } = await supabase
        .from('subscriptions')
        .upsert({
          user_id: userId,
          status: 'active',
          plan_id: 'premium',
          kiwify_order_id: order_id,
          current_period_end: expiresAt.toISOString()
        }, { onConflict: 'user_id' })

      if (subError) {
        console.error('❌ Erro ao criar assinatura:', subError)
        throw subError
      }

      console.log('✅ Assinatura premium ativada até:', expiresAt)
    }

    // CASO B: Pacote de Tokens (Compra Avulsa)
    // Substitua 'SEU_PRODUCT_ID_TOKENS' pelo ID real do produto na Kiwify
    if (productId === 'd426cbe0-ce60-11f0-9119-9fe5587bc657') {
      console.log('🪙 Adicionando tokens...')
      
      const tokensToAdd = 20 // Quantidade de tokens a adicionar
      const newBalance = (profile.token_balance || 0) + tokensToAdd
      
      // Atualiza saldo
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ token_balance: newBalance })
        .eq('id', userId)

      if (updateError) {
        console.error('❌ Erro ao atualizar tokens:', updateError)
        throw updateError
      }
      
      // Registra transação
      const { error: txError } = await supabase
        .from('token_transactions')
        .insert({
          user_id: userId,
          amount: tokensToAdd,
          description: `Compra Kiwify: ${Product?.name || 'Pacote de Tokens'}`
        })

      if (txError) {
        console.error('⚠️ Erro ao registrar transação:', txError)
        // Não falha o webhook por causa disso
      }

      console.log(`✅ ${tokensToAdd} tokens adicionados. Novo saldo: ${newBalance}`)
    }

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Webhook processed successfully',
      order_id 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    })

  } catch (error) {
    console.error('❌ Erro ao processar webhook:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(JSON.stringify({ 
      error: errorMessage,
      details: 'Check edge function logs for more details'
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    })
  }
})
