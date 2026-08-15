import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

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

    // Get buyer profile
    const { data: buyer, error: buyerError } = await supabase
      .from("b2b_buyers")
      .select("id")
      .eq("email", user.email!)
      .single();

    if (buyerError || !buyer) {
      return new Response(JSON.stringify({ error: "Not a registered B2B buyer" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Parse query params (from URL or POST body)
    const url = new URL(req.url);
    let orderId = url.searchParams.get("order_id");
    let status = url.searchParams.get("status");
    let format = url.searchParams.get("format") || "json";

    if (req.method === "POST") {
      try {
        const body = await req.json();
        if (body.order_id) orderId = body.order_id;
        if (body.status) status = body.status;
        if (body.format) format = body.format;
      } catch { /* ignore parse errors */ }
    }

    // Build query
    let query = supabase
      .from("b2b_activation_pins")
      .select("id, pin_code, plan_type, status, redeemed_by_email, redeemed_at, access_expires_at, created_at")
      .eq("buyer_id", buyer.id)
      .order("created_at", { ascending: false });

    if (orderId) {
      query = query.eq("order_id", orderId);
    }

    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    const { data: pins, error: pinError } = await query;

    if (pinError) {
      console.error("Pin query error:", pinError);
      return new Response(JSON.stringify({ error: "Failed to fetch PINs" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    // Also get stats
    const { data: stats } = await supabase
      .rpc("get_reseller_dashboard_stats", { p_buyer_email: user.email! })
      .single();

    // CSV export
    if (format === "csv") {
      const csvHeader = "PIN Code,Plan,Status,Redeemed By,Redeemed At,Created At\n";
      const csvRows = (pins || []).map(p =>
        `${p.pin_code},${p.plan_type},${p.status},${p.redeemed_by_email || ""},${p.redeemed_at || ""},${p.created_at}`
      ).join("\n");

      return new Response(csvHeader + csvRows, {
        headers: {
          ...corsHeaders,
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="pins-${Date.now()}.csv"`,
        },
        status: 200,
      });
    }

    return new Response(JSON.stringify({
      success: true,
      pins: pins || [],
      stats: stats || {
        total_pins_purchased: 0,
        total_pins_redeemed: 0,
        total_pins_available: 0,
        total_spent: 0,
        active_orders: 0,
        recent_redemptions: [],
      },
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
