import { createClient } from "https://esm.sh/@supabase/supabase-js@2.86.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const TICTO_WEBHOOK_TOKEN = Deno.env.get("TICTO_WEBHOOK_TOKEN");

    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const body = await req.json();

    // Validate Ticto webhook v2
    if (body.version !== "2.0") {
      console.warn("Received non-v2 webhook, processing anyway");
    }

    // Validate token if configured
    if (TICTO_WEBHOOK_TOKEN && body.token !== TICTO_WEBHOOK_TOKEN) {
      console.error("Invalid webhook token");
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const email = body.customer?.email;
    const customerName = body.customer?.name || "";
    const status = body.status || "unknown";
    const orderId = body.order?.id?.toString() || null;
    const orderHash = body.order?.hash || null;
    const productName = body.item?.product_name || null;
    const productId = body.item?.product_id?.toString() || null;
    const paymentMethod = body.payment_method || null;
    const paidAmount = body.order?.paid_amount || null;

    if (!email) {
      console.error("No customer email in webhook payload");
      return new Response(
        JSON.stringify({ error: "Customer email is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Ticto webhook received: status=${status}, email=${email}, order=${orderHash}`);

    // Check if purchase already exists for this order
    const { data: existing } = await supabaseAdmin
      .from("purchases")
      .select("id")
      .eq("ticto_order_hash", orderHash)
      .maybeSingle();

    if (existing) {
      // Update existing purchase status
      const { error: updateError } = await supabaseAdmin
        .from("purchases")
        .update({
          status,
          updated_at: new Date().toISOString(),
          raw_payload: body,
        })
        .eq("id", existing.id);

      if (updateError) {
        console.error("Error updating purchase:", updateError);
        return new Response(
          JSON.stringify({ error: updateError.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log(`Purchase updated: ${orderHash} -> ${status}`);
    } else {
      // Insert new purchase
      const { error: insertError } = await supabaseAdmin
        .from("purchases")
        .insert({
          email: email.toLowerCase().trim(),
          customer_name: customerName,
          status,
          ticto_order_id: orderId,
          ticto_order_hash: orderHash,
          product_name: productName,
          product_id: productId,
          payment_method: paymentMethod,
          paid_amount: paidAmount,
          ticto_token: body.token || null,
          raw_payload: body,
        });

      if (insertError) {
        console.error("Error inserting purchase:", insertError);
        return new Response(
          JSON.stringify({ error: insertError.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log(`Purchase created: ${email} - ${productName}`);
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
