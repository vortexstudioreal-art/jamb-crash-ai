import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const PAYSTACK_SECRET_KEY = Deno.env.get("PAYSTACK_SECRET_KEY")!;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get auth user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const body = await req.json();
    const { plan_type, quantity, notes } = body;

    if (!plan_type || !quantity || quantity < 1) {
      return new Response(JSON.stringify({ error: "plan_type and quantity (min 1) are required" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    if (!["ace_30", "ace_90", "scholar_365"].includes(plan_type)) {
      return new Response(JSON.stringify({ error: "Invalid plan_type" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Get buyer profile
    const { data: buyer, error: buyerError } = await supabase
      .from("b2b_buyers")
      .select("id")
      .eq("email", user.email!.toLowerCase())
      .single();

    if (buyerError || !buyer) {
      return new Response(JSON.stringify({ error: "Please register as a B2B buyer first" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Calculate price server-side
    const { data: pricing, error: pricingError } = await supabase
      .rpc("calculate_bulk_discount", { p_plan_type: plan_type, p_quantity: quantity })
      .single();

    if (pricingError || !pricing) {
      return new Response(JSON.stringify({ error: "Failed to calculate pricing" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    // Generate reference
    const reference = `JAMB_B2B_${Date.now()}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // Create order
    const { data: order, error: orderError } = await supabase
      .from("b2b_bulk_orders")
      .insert({
        buyer_id: buyer.id,
        plan_type,
        quantity,
        unit_price: pricing.unit_price,
        discount_percent: pricing.discount_percent,
        total_amount: pricing.total_amount,
        status: "pending_payment",
        paystack_reference: reference,
        notes: notes || null,
      })
      .select()
      .single();

    if (orderError) {
      console.error("Order error:", orderError);
      return new Response(JSON.stringify({ error: orderError.message }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    // Initialize Paystack
    const paystackResponse = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: user.email,
        amount: pricing.total_amount * 100, // kobo
        currency: "NGN",
        reference,
        metadata: {
          order_id: order.id,
          plan_type,
          quantity,
          buyer_id: buyer.id,
          type: "b2b_bulk_purchase",
        },
      }),
    });

    const paystackData = await paystackResponse.json();

    if (!paystackData.status) {
      console.error("Paystack error:", paystackData);
      return new Response(JSON.stringify({ error: "Payment initialization failed" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    return new Response(JSON.stringify({
      success: true,
      order_id: order.id,
      reference,
      authorization_url: paystackData.data.authorization_url,
      access_code: paystackData.data.access_code,
      total_amount: pricing.total_amount,
      unit_price: pricing.unit_price,
      discount_percent: pricing.discount_percent,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err) {
    console.error("Error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
