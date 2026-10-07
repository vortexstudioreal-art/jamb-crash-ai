import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InitializePaymentRequest {
  email: string;
  amount: number;
  package: string;
  callbackUrl: string;
}

// Server-side price lookup - NEVER trust client-supplied amounts
// Must match frontend plans (Basic ₦1,500 / ACE ₦3,500 / SCHOLAR ₦7,500)
const PACKAGE_PRICES: Record<string, number> = {
  basic: 1500,
  pro: 3500,
  standard: 3500,
  premium: 7500,
  ultimate: 7500,
};

// Rate limiting - 5 payment initializations per email per hour
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour

function isRateLimited(email: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(email);
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(email, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return false;
  }
  
  if (record.count >= RATE_LIMIT_MAX) {
    return true;
  }
  
  record.count++;
  return false;
}

// Simple email validation
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

serve(async (req) => {
  console.log("[paystack-initialize] Function called, method:", req.method);
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestBody = await req.text();
    const { email, amount, package: packageName, callbackUrl }: InitializePaymentRequest = JSON.parse(requestBody);

    console.log("[paystack-initialize] Parsed request:", { email, amount, packageName });

    // Validate input
    if (!email || !amount || !packageName) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return new Response(
        JSON.stringify({ error: "Invalid email format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Server-side price validation - never trust client amount
    const expectedPrice = PACKAGE_PRICES[packageName.toLowerCase()];
    if (!expectedPrice) {
      console.error("[paystack-initialize] Invalid package:", packageName);
      return new Response(
        JSON.stringify({ error: "Invalid package selected" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Amount must not exceed expected price (coupons can reduce it, but never below 0)
    // and must be a positive number
    if (typeof amount !== 'number' || amount <= 0 || amount > expectedPrice) {
      console.error("[paystack-initialize] Invalid amount:", amount, "expected max:", expectedPrice);
      return new Response(
        JSON.stringify({ error: "Invalid amount for selected package" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check rate limiting
    if (isRateLimited(email)) {
      return new Response(
        JSON.stringify({ error: "Too many payment attempts. Please try again later." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const paystackSecretKey = Deno.env.get("PAYSTACK_SECRET_KEY");
    if (!paystackSecretKey) {
      console.error("[paystack-initialize] PAYSTACK_SECRET_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Payment service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate unique reference
    const reference = `JAMB_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // Initialize Paystack transaction
    const paystackResponse = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${paystackSecretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        amount: amount * 100, // Paystack expects amount in kobo
        currency: "NGN",
        reference,
        callback_url: callbackUrl,
        metadata: {
          package: packageName,
          expected_price: expectedPrice,
          custom_fields: [
            {
              display_name: "Package",
              variable_name: "package",
              value: packageName,
            },
          ],
        },
      }),
    });

    const paystackData = await paystackResponse.json();

    if (!paystackData.status) {
      console.error("[paystack-initialize] Paystack error:", paystackData.message);
      return new Response(
        JSON.stringify({ error: paystackData.message || "Payment initialization failed" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Store pending payment in database using service role
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { error: dbError } = await supabase.from("payments").insert({
      email,
      package: packageName,
      amount,
      status: "pending",
      paystack_reference: reference,
    });

    if (dbError) {
      console.error("[paystack-initialize] Database error:", dbError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        authorization_url: paystackData.data.authorization_url,
        access_code: paystackData.data.access_code,
        reference: paystackData.data.reference,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[paystack-initialize] Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
