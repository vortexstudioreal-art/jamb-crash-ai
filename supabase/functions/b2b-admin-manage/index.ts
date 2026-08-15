import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
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

    // Check admin role
    const { data: adminCheck } = await supabase
      .from("admin_users")
      .select("role")
      .eq("email", user.email!)
      .single();

    if (!adminCheck || adminCheck.role !== "owner") {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 403,
      });
    }

    const body = await req.json();
    const { action } = body;

    switch (action) {
      case "get_overview": {
        const { data, error } = await supabase.rpc("get_admin_b2b_overview").single();
        if (error) throw error;
        return new Response(JSON.stringify({ success: true, overview: data }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      case "get_all_buyers": {
        const { data, error } = await supabase
          .from("b2b_buyers")
          .select("*")
          .order("created_at", { ascending: false });
        if (error) throw error;
        return new Response(JSON.stringify({ success: true, buyers: data }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      case "get_all_orders": {
        const { data, error } = await supabase
          .from("b2b_bulk_orders")
          .select("*, b2b_buyers(full_name, email, organization, buyer_type)")
          .order("created_at", { ascending: false });
        if (error) throw error;
        return new Response(JSON.stringify({ success: true, orders: data }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      case "get_all_pins": {
        const url = new URL(req.url);
        const orderId = url.searchParams.get("order_id");
        let query = supabase
          .from("b2b_activation_pins")
          .select("*, b2b_buyers(full_name, email, organization)")
          .order("created_at", { ascending: false });

        if (orderId) {
          query = query.eq("order_id", orderId);
        }

        const { data, error } = await query;
        if (error) throw error;
        return new Response(JSON.stringify({ success: true, pins: data }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      case "revoke_pin": {
        const { pin_id } = body;
        if (!pin_id) {
          return new Response(JSON.stringify({ error: "pin_id is required" }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
          });
        }

        const { error } = await supabase
          .from("b2b_activation_pins")
          .update({ status: "revoked", updated_at: new Date().toISOString() })
          .eq("id", pin_id)
          .eq("status", "available");

        if (error) throw error;
        return new Response(JSON.stringify({ success: true, message: "PIN revoked" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      case "toggle_buyer": {
        const { buyer_id, is_active } = body;
        if (!buyer_id) {
          return new Response(JSON.stringify({ error: "buyer_id is required" }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
          });
        }

        const { error } = await supabase
          .from("b2b_buyers")
          .update({ is_active, updated_at: new Date().toISOString() })
          .eq("id", buyer_id);

        if (error) throw error;
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      case "update_prices": {
        const { prices } = body;
        if (!prices || !Array.isArray(prices)) {
          return new Response(JSON.stringify({ error: "prices array is required" }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
          });
        }

        for (const price of prices) {
          await supabase
            .from("b2b_pin_bulk_prices")
            .update({
              unit_price: price.unit_price,
              discount_percent: price.discount_percent,
              updated_at: new Date().toISOString(),
            })
            .eq("plan_type", price.plan_type)
            .eq("min_quantity", price.min_quantity);
        }

        return new Response(JSON.stringify({ success: true, message: "Prices updated" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      case "get_prices": {
        const { data, error } = await supabase
          .from("b2b_pin_bulk_prices")
          .select("*")
          .order("plan_type")
          .order("min_quantity");

        if (error) throw error;
        return new Response(JSON.stringify({ success: true, prices: data }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      default:
        return new Response(JSON.stringify({ error: "Invalid action" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        });
    }
  } catch (err) {
    console.error("Error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
