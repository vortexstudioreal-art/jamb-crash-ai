-- Add INSERT policy for users to insert their own leaderboard entry
CREATE POLICY "Users can insert own leaderboard entry"
ON public.leaderboard_scores
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Add DELETE policy for authenticated users to delete placeholders
CREATE POLICY "Authenticated users can delete placeholders"
ON public.leaderboard_scores
FOR DELETE
TO authenticated
USING (is_placeholder = true);

-- Enable realtime for leaderboard_scores
ALTER PUBLICATION supabase_realtime ADD TABLE public.leaderboard_scores;