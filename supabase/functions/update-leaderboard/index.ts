import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LeaderboardUpdate {
  userEmail: string;
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
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { userEmail, correctCount, totalQuestions, timeTaken, totalTimeSeconds }: LeaderboardUpdate = await req.json();

    // Calculate leaderboard points
    const timeUsedPercentage = (timeTaken / totalTimeSeconds) * 100;
    const accuracyPercent = (correctCount / totalQuestions) * 100;

    let bonusPoints = 0;
    if (timeUsedPercentage < 50) bonusPoints += 5; // Fast completion bonus
    if (accuracyPercent >= 80) bonusPoints += 5; // High accuracy bonus

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
      // Update existing entry
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
      // Create new entry
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

    // Recalculate all ranks using efficient database function
    await supabase.rpc('recalculate_leaderboard_ranks');

    return new Response(
      JSON.stringify({ success: true, pointsEarned: quizPoints }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error updating leaderboard:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
