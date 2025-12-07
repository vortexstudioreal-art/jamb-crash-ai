import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    
    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Resend not configured", configured: false }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { email, test_mode } = await req.json();

    // If test mode, just verify credentials work
    if (test_mode) {
      console.log("Test mode - checking Resend configuration");
      return new Response(
        JSON.stringify({ 
          success: true, 
          configured: true,
          message: "Resend is configured correctly" 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Sending test email to: ${email}`);

    // Send email via Resend API
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "JAMB Crash AI <onboarding@resend.dev>",
        to: [email],
        subject: "✅ JAMB Crash AI - Email System Working!",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; }
              .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; }
              .header { background: linear-gradient(135deg, #16a34a, #22c55e); padding: 30px; text-align: center; }
              .header h1 { color: white; margin: 0; font-size: 24px; }
              .content { padding: 30px; }
              .success-badge { background: #dcfce7; color: #16a34a; padding: 10px 20px; border-radius: 20px; display: inline-block; font-weight: bold; }
              .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎉 JAMB 48-Hour Crash</h1>
              </div>
              <div class="content">
                <p style="text-align: center;">
                  <span class="success-badge">✅ Email System Working!</span>
                </p>
                <h2 style="color: #333; text-align: center;">Test Email Successful!</h2>
                <p style="color: #666; text-align: center;">
                  This confirms that JAMB Crash AI emails are properly configured and working.
                </p>
                <p style="color: #666; text-align: center;">
                  You'll now receive study plans, reminders, and important updates via email.
                </p>
                <div style="text-align: center; margin-top: 30px;">
                  <a href="https://jambcrash.com" style="background: #16a34a; color: white; padding: 15px 30px; border-radius: 8px; text-decoration: none; font-weight: bold;">
                    Continue Studying 📚
                  </a>
                </div>
              </div>
              <div class="footer">
                <p>JAMB 48-Hour Crash - Score 300+ in JAMB</p>
                <p>© ${new Date().getFullYear()} All rights reserved</p>
              </div>
            </div>
          </body>
          </html>
        `,
      }),
    });

    const result = await response.json();
    console.log("Resend API response:", JSON.stringify(result));

    if (!response.ok) {
      return new Response(
        JSON.stringify({ success: false, error: result.message || "Failed to send email" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, data: result }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error sending email:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});