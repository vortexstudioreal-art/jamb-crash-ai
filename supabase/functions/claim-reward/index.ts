import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Must match frontend plans (Basic ₦1,500 / ACE ₦3,500 / SCHOLAR ₦7,500)
const PACKAGE_PRICES: Record<string, number> = {
  basic: 1500,
  pro: 3500,
  standard: 3500,
  premium: 7500,
  ultimate: 7500,
};

const BOOST_TIERS: Record<string, { refsRequired: number; rewardDays: number }> = {
  bronze: { refsRequired: 1, rewardDays: 3 },
  silver: { refsRequired: 3, rewardDays: 14 },
  gold: { refsRequired: 5, rewardDays: 30 },
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const db = createClient(supabaseUrl, supabaseServiceKey);

    // Auth: rewards are account-bound — the JWT email must match the claim.
    // This is what stops DevTools forgery (client-side inserts can't prove it).
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Sign in to claim rewards" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { data: { user }, error: authError } = await db.auth.getUser(
      authHeader.replace("Bearer ", ""),
    );
    if (authError || !user?.email) {
      return new Response(JSON.stringify({ error: "Session expired. Please sign in again." }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { claim_type, email } = body as { claim_type: string; email: string };
    const emailKey = (email || "").toLowerCase();
    if (!emailKey || emailKey !== user.email!.toLowerCase()) {
      return new Response(JSON.stringify({ error: "Email mismatch" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ---------- 100% coupon claim: grants the full plan ----------
    if (claim_type === "coupon_free") {
      const packageName = String(body.package || "").toLowerCase();
      const couponCode = String(body.couponCode || "").toUpperCase().trim();
      const referralCode = body.referralCode ? String(body.referralCode).toUpperCase().trim() : null;

      const expectedPrice = PACKAGE_PRICES[packageName];
      if (!expectedPrice) {
        return new Response(JSON.stringify({ error: "Invalid package" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (!couponCode) {
        return new Response(JSON.stringify({ error: "Coupon code required" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: coupon } = await db
        .from("coupon_codes")
        .select("id, discount_amount, discount_percentage, coupon_type, is_active, expiry_date, usage_limit, times_used")
        .eq("code", couponCode)
        .maybeSingle();

      const usable =
        coupon &&
        coupon.is_active === true &&
        (!coupon.expiry_date || new Date(coupon.expiry_date) > new Date()) &&
        (coupon.usage_limit == null || (coupon.times_used ?? 0) < coupon.usage_limit);
      if (!usable) {
        return new Response(JSON.stringify({ error: "Coupon is invalid or expired" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      let provenDiscount = coupon.discount_percentage && coupon.discount_percentage > 0
        ? Math.floor(expectedPrice * (coupon.discount_percentage / 100))
        : (coupon.discount_amount ?? 0);
      provenDiscount = Math.max(0, Math.min(provenDiscount, expectedPrice));

      if (referralCode) {
        const { data: ref } = await db
          .from("referrals")
          .select("referrer_email")
          .eq("referral_code", referralCode)
          .is("referred_email", null)
          .limit(1)
          .maybeSingle();
        if (!ref || !ref.referrer_email || ref.referrer_email.toLowerCase() === emailKey) {
          return new Response(JSON.stringify({ error: "Referral code is invalid" }), {
            status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        provenDiscount = Math.min(expectedPrice, provenDiscount + 1000);
      }

      // Only zero-due claims may use this path — anything payable goes
      // through Paystack where the amount is enforced again at verify time.
      if (expectedPrice - provenDiscount > 0) {
        return new Response(JSON.stringify({ error: "This coupon does not cover the full price" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const reference = `FREE_${Date.now()}_${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
      const accessExpiresAt = new Date();
      accessExpiresAt.setDate(accessExpiresAt.getDate() + 365);

      const { error: payError } = await db.from("payments").insert({
        email: emailKey,
        package: packageName,
        amount: 0,
        currency: "NGN",
        status: "success",
        paystack_reference: reference,
        access_expires_at: accessExpiresAt.toISOString(),
      });
      if (payError) throw new Error("Failed to grant access");

      await db.from("coupon_usage").insert({
        coupon_id: coupon.id,
        used_by_email: emailKey,
        amount_paid: 0,
        discount_applied: expectedPrice,
        creator_earning: 0,
        commission_percentage: 0,
        commission_payable: false,
      });
      await db.rpc("increment_coupon_usage", { p_coupon_id: coupon.id });

      if (referralCode) {
        await db.rpc("redeem_referral_code", { p_code: referralCode, p_email: emailKey });
      }

      return new Response(JSON.stringify({
        success: true,
        reference,
        package: packageName,
        access_expires_at: accessExpiresAt.toISOString(),
      }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // ---------- Refer & Boost tier claim: grants premium days ----------
    if (claim_type === "referral_boost") {
      const tierId = String(body.tierId || "").toLowerCase();
      const tier = BOOST_TIERS[tierId];
      if (!tier) {
        return new Response(JSON.stringify({ error: "Invalid tier" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const reference = `BOOST-${tierId.toUpperCase()}-${emailKey}`;

      // Idempotent: already claimed?
      const { data: existing } = await db
        .from("payments")
        .select("id")
        .eq("email", emailKey)
        .eq("paystack_reference", reference)
        .eq("status", "success")
        .limit(1);
      if (existing && existing.length > 0) {
        return new Response(JSON.stringify({ success: true, already: true, reference }), {
          status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Eligibility is counted server-side — the client count is display only.
      const { count } = await db
        .from("referrals")
        .select("*", { count: "exact", head: true })
        .ilike("referrer_email", emailKey)
        .eq("is_used", true);
      if ((count || 0) < tier.refsRequired) {
        return new Response(JSON.stringify({ error: "Not enough referrals yet" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const accessExpiresAt = new Date();
      accessExpiresAt.setDate(accessExpiresAt.getDate() + tier.rewardDays);

      const { error: payError } = await db.from("payments").insert({
        email: emailKey,
        package: "premium",
        amount: 0,
        currency: "NGN",
        status: "success",
        paystack_reference: reference,
        access_expires_at: accessExpiresAt.toISOString(),
      });
      if (payError) throw new Error("Failed to grant boost");

      return new Response(JSON.stringify({
        success: true,
        reference,
        access_expires_at: accessExpiresAt.toISOString(),
        rewardDays: tier.rewardDays,
      }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ error: "Invalid claim_type" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[claim-reward] Unexpected error:", err);
    return new Response(JSON.stringify({ error: "An unexpected error occurred" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
