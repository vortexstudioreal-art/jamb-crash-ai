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

    // Auth check
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
    const { reference } = body;

    if (!reference) {
      return new Response(JSON.stringify({ error: "reference is required" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Verify with Paystack
    const paystackResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const paystackData = await paystackResponse.json();

    if (!paystackData.status || paystackData.data.status !== "success") {
      return new Response(JSON.stringify({
        success: false,
        message: "Payment not successful",
        status: paystackData.data?.status || "unknown",
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Find the order (with amount + owner for verification below)
    const { data: order, error: orderError } = await supabase
      .from("b2b_bulk_orders")
      .select("id, status, plan_type, quantity, total_amount, buyer_id")
      .eq("paystack_reference", reference)
      .single();

    if (orderError || !order) {
      return new Response(JSON.stringify({ error: "Order not found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 404,
      });
    }

    // Ownership: only the buyer who placed the order may verify it.
    const { data: buyer } = await supabase
      .from("b2b_buyers")
      .select("id")
      .eq("email", user.email!.toLowerCase())
      .single();

    if (!buyer || buyer.id !== order.buyer_id) {
      return new Response(JSON.stringify({ error: "Order not found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 404,
      });
    }

    // Amount: Paystack must have collected at least the order total.
    const paidNaira = (paystackData.data.amount || 0) / 100;
    if (paidNaira + 1 < order.total_amount) {
      console.error("B2B underpaid:", { reference, paid: paidNaira, due: order.total_amount });
      return new Response(JSON.stringify({
        success: false,
        message: "Amount paid does not match the order total",
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // If already processed, return existing PINs
    if (order.status === "ready" || order.status === "partially_redeemed" || order.status === "completed") {
      const { data: existingPins } = await supabase
        .from("b2b_activation_pins")
        .select("pin_code, plan_type, status")
        .eq("order_id", order.id);

      return new Response(JSON.stringify({
        success: true,
        message: "Order already processed",
        pins: existingPins || [],
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Update order status to paid
    const { error: updateError } = await supabase
      .from("b2b_bulk_orders")
      .update({ status: "paid", updated_at: new Date().toISOString() })
      .eq("id", order.id);

    if (updateError) {
      console.error("Update error:", updateError);
      return new Response(JSON.stringify({ error: "Failed to update order" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    // Generate PINs
    const { data: pins, error: pinError } = await supabase
      .rpc("generate_activation_pins", { p_order_id: order.id });

    if (pinError) {
      console.error("PIN generation error:", pinError);
      return new Response(JSON.stringify({ error: "Failed to generate PINs" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    // Update buyer stats using SQL increment
    const { data: orderFull } = await supabase
      .from("b2b_bulk_orders")
      .select("buyer_id")
      .eq("id", order.id)
      .single();

    if (orderFull) {
      await supabase.rpc("increment_buyer_purchased", {
        p_buyer_id: orderFull.buyer_id,
        p_quantity: order.quantity,
      }).catch(() => {
        // Fallback: direct update if RPC doesn't exist yet
        return supabase
          .from("b2b_buyers")
          .select("total_purchased")
          .eq("id", orderFull.buyer_id)
          .single()
          .then(async ({ data }) => {
            if (data) {
              await supabase
                .from("b2b_buyers")
                .update({
                  total_purchased: (data.total_purchased || 0) + order.quantity,
                  updated_at: new Date().toISOString(),
                })
                .eq("id", orderFull.buyer_id);
            }
          });
      });
    }

    return new Response(JSON.stringify({
      success: true,
      message: `Successfully generated ${pins?.length || order.quantity} PINs`,
      pins: pins || [],
      order_id: order.id,
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
