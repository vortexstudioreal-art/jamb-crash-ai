import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  console.log("[paystack-verify] Function called, method:", req.method);
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestBody = await req.text();
    console.log("[paystack-verify] Request body:", requestBody);
    
    const { reference } = JSON.parse(requestBody);

    if (!reference) {
      console.error("[paystack-verify] Missing reference");
      return new Response(
        JSON.stringify({ error: "Reference is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("[paystack-verify] Verifying payment:", reference);

    const paystackSecretKey = Deno.env.get("PAYSTACK_SECRET_KEY");
    if (!paystackSecretKey) {
      console.error("[paystack-verify] PAYSTACK_SECRET_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Payment service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify with Paystack
    console.log("[paystack-verify] Calling Paystack API...");
    const paystackResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${paystackSecretKey}`,
        },
      }
    );

    const paystackData = await paystackResponse.json();
    console.log("[paystack-verify] Paystack response:", JSON.stringify(paystackData));

    if (!paystackData.status) {
      console.error("[paystack-verify] Paystack API error:", paystackData.message);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: paystackData.message || "Payment verification failed" 
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const paymentStatus = paystackData.data.status;
    console.log("[paystack-verify] Payment status from Paystack:", paymentStatus);

    if (paymentStatus !== "success") {
      console.log("[paystack-verify] Payment not successful, status:", paymentStatus);
      return new Response(
        JSON.stringify({ 
          success: false, 
          status: paymentStatus,
          message: paystackData.data.gateway_response || "Payment was not successful"
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update database
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const packageName = paystackData.data.metadata?.package || "basic";
    // Server-side price check: the amount Paystack actually collected must
    // cover list price minus any coupon/referral discount the client claimed.
    // Without this, any ₦1 payment would grant full access.
    const PACKAGE_PRICES: Record<string, number> = {
      basic: 1500,
      pro: 3500,
      standard: 3500,
      premium: 7500,
      ultimate: 7500,
    };
    const expectedPrice = PACKAGE_PRICES[String(packageName).toLowerCase()] ?? 1500;
    const claimedDiscount = Number(paystackData.data.metadata?.discountApplied) || 0;
    const paidNaira = (paystackData.data.amount || 0) / 100;
    if (paidNaira + 1 < expectedPrice - Math.min(claimedDiscount, expectedPrice)) {
      console.error(
        "[paystack-verify] Underpaid:",
        { paid: paidNaira, expected: expectedPrice, claimedDiscount, package: packageName }
      );
      return new Response(
        JSON.stringify({ success: false, error: "Amount paid does not match the plan price" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    // Access duration: every plan grants ~1 year.
    // NOTE: Must match paystack-webhook/index.ts durations
    const accessDays = 365;
    const accessExpiresAt = new Date();
    accessExpiresAt.setDate(accessExpiresAt.getDate() + accessDays);
    
    console.log("[paystack-verify] Package:", packageName, "Access days:", accessDays, "Expires:", accessExpiresAt.toISOString());

    console.log("[paystack-verify] Updating payment record...");
    const { error: updateError, data: updateData } = await supabase
      .from("payments")
      .update({
        status: "success",
        paystack_transaction_id: paystackData.data.id.toString(),
        access_expires_at: accessExpiresAt.toISOString(),
      })
      .eq("paystack_reference", reference)
      .select();

    if (updateError) {
      console.error("[paystack-verify] Database update error:", updateError);
    } else {
      console.log("[paystack-verify] Payment record updated:", updateData);
    }

    // Backup referral credit: the client also redeems on success, but if
    // that call failed (network), the referrer still earns here. Idempotent.
    const referralCode = paystackData.data.metadata?.referralCode;
    const customerEmail = paystackData.data.customer.email;
    if (typeof referralCode === "string" && referralCode && customerEmail) {
      const { error: redeemError } = await supabase.rpc("redeem_referral_code", {
        p_code: referralCode,
        p_email: customerEmail,
      });
      if (redeemError) console.error("[paystack-verify] referral redeem error:", redeemError.message);
      else console.log("[paystack-verify] referral redeemed:", referralCode);
    }

    console.log("[paystack-verify] Success! Returning payment details");
    return new Response(
      JSON.stringify({
        success: true,
        status: "success",
        data: {
          email: paystackData.data.customer.email,
          amount: paystackData.data.amount / 100,
          package: packageName,
          reference: paystackData.data.reference,
          access_expires_at: accessExpiresAt.toISOString(),
        },
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[paystack-verify] Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
