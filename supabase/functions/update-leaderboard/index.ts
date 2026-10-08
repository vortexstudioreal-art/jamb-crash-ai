import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LeaderboardUpdate {
  correctCount: number;
  totalQuestions: number;
  timeTaken: number;
  totalTimeSeconds: number;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Authenticate the user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify the user's token using anon key client
    const authClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await authClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userEmail = claimsData.claims.email as string;
    if (!userEmail) {
      return new Response(
        JSON.stringify({ error: 'No email in token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Use service role for DB operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { correctCount, totalQuestions, timeTaken, totalTimeSeconds }: LeaderboardUpdate = await req.json();

    // Validate numbers — zero/negative totals would produce NaN/Infinity points.
    if (
      !Number.isFinite(correctCount) || !Number.isFinite(totalQuestions) ||
      !Number.isFinite(timeTaken) || !Number.isFinite(totalTimeSeconds) ||
      totalQuestions <= 0 || totalTimeSeconds <= 0 ||
      correctCount < 0 || correctCount > totalQuestions
    ) {
      return new Response(
        JSON.stringify({ error: 'Invalid quiz stats' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate leaderboard points
    const timeUsedPercentage = (timeTaken / totalTimeSeconds) * 100;
    const accuracyPercent = (correctCount / totalQuestions) * 100;

    let bonusPoints = 0;
    if (timeUsedPercentage < 50) bonusPoints += 5;
    if (accuracyPercent >= 80) bonusPoints += 5;

    const quizPoints = correctCount + bonusPoints;

    // Get user's current leaderboard entry
    const { data: existingEntry } = await supabase
      .from('leaderboard_scores')
      .select('*')
      .eq('email', userEmail)
      .single();

    // Get user's profile for full_name
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, id')
      .eq('email', userEmail)
      .single();

    const userName = profile?.full_name || userEmail.split('@')[0];

    if (existingEntry) {
      const newTotalScore = existingEntry.total_score + quizPoints;
      const newQuestionsAnswered = existingEntry.questions_answered + totalQuestions;
      const oldAccuracy = existingEntry.average_accuracy || 0;
      const newAccuracy = ((oldAccuracy * existingEntry.questions_answered) + 
        (accuracyPercent * totalQuestions)) / newQuestionsAnswered;
      const newBestScore = Math.max(existingEntry.best_quiz_score || 0, Math.round(accuracyPercent));

      await supabase
        .from('leaderboard_scores')
        .update({
          total_score: newTotalScore,
          questions_answered: newQuestionsAnswered,
          average_accuracy: newAccuracy,
          best_quiz_score: newBestScore,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingEntry.id);
    } else if (profile?.id) {
      await supabase
        .from('leaderboard_scores')
        .insert({
          user_id: profile.id,
          email: userEmail,
          full_name: userName,
          total_score: quizPoints,
          questions_answered: totalQuestions,
          average_accuracy: accuracyPercent,
          best_quiz_score: Math.round(accuracyPercent),
          is_placeholder: false
        });
    }

    // Remove lowest placeholder if we now have >10 real users
    const { data: allScores } = await supabase
      .from('leaderboard_scores')
      .select('id, is_placeholder, total_score')
      .order('total_score', { ascending: true });

    if (allScores && allScores.length > 10) {
      const lowestPlaceholder = allScores.find(s => s.is_placeholder);
      if (lowestPlaceholder) {
        await supabase
          .from('leaderboard_scores')
          .delete()
          .eq('id', lowestPlaceholder.id);
      }
    }

    await supabase.rpc('recalculate_leaderboard_ranks');

    return new Response(
      JSON.stringify({ success: true, pointsEarned: quizPoints }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error updating leaderboard:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
