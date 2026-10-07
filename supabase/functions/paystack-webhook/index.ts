import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-paystack-signature",
};

// Helper function to compute HMAC-SHA512
async function computeHmacSha512(key: string, data: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(key);
  const dataData = encoder.encode(data);
  
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-512" },
    false,
    ["sign"]
  );
  
  const signature = await crypto.subtle.sign("HMAC", cryptoKey, dataData);
  const hashArray = Array.from(new Uint8Array(signature));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

serve(async (req) => {
  console.log("[paystack-webhook] Webhook called, method:", req.method);
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const paystackSecretKey = Deno.env.get("PAYSTACK_SECRET_KEY");
    if (!paystackSecretKey) {
      console.error("PAYSTACK_SECRET_KEY not configured");
      return new Response("Server error", { status: 500 });
    }

    // Get the raw body for signature verification
    const body = await req.text();
    const signature = req.headers.get("x-paystack-signature");

    // Verify webhook signature - ALWAYS require signature
    if (!signature) {
      console.error("Missing webhook signature");
      return new Response("Missing signature", { status: 401 });
    }

    const expectedSignature = await computeHmacSha512(paystackSecretKey, body);

    if (signature !== expectedSignature) {
      console.error("Invalid webhook signature");
      return new Response("Invalid signature", { status: 401 });
    }

    const event = JSON.parse(body);
    console.log("[paystack-webhook] Event received:", event.event);
    console.log("[paystack-webhook] Event data:", JSON.stringify(event.data));

    if (event.event === "charge.success") {
      const { reference, id, customer, amount, metadata } = event.data;

      console.log("[paystack-webhook] Payment successful:", { reference, id, amount });

      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      // Determine access duration based on package
      // NOTE: Must match paystack-verify/index.ts durations
      // All plans grant ~1 year; no duration is shown in the UI.
      const packageName = metadata?.package || "basic";
      const accessDays = 365; // 1 year for every plan
      const accessExpiresAt = new Date();
      accessExpiresAt.setDate(accessExpiresAt.getDate() + accessDays);

      // Update payment record
      const { error: updateError } = await supabase
        .from("payments")
        .update({
          status: "success",
          paystack_transaction_id: id.toString(),
          access_expires_at: accessExpiresAt.toISOString(),
        })
        .eq("paystack_reference", reference);

      if (updateError) {
        console.error("[paystack-webhook] Error updating payment:", updateError);
      } else {
        console.log("[paystack-webhook] Payment record updated successfully for reference:", reference);
      }

      // Backup referral credit for payments verified only via webhook.
      const referralCode = metadata?.referralCode;
      const customerEmail = customer?.email;
      if (typeof referralCode === "string" && referralCode && customerEmail) {
        const { error: redeemError } = await supabase.rpc("redeem_referral_code", {
          p_code: referralCode,
          p_email: customerEmail,
        });
        if (redeemError) console.error("[paystack-webhook] referral redeem error:", redeemError.message);
      }
    } else {
      console.log("[paystack-webhook] Unhandled event type:", event.event);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[paystack-webhook] Unexpected error:", error);
    return new Response("Webhook error", { status: 500 });
  }
});
