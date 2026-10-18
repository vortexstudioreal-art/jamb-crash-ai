-- Leaderboard scores were fully client-writable, which let anyone buy a
-- scholarship place:
--   * "Users can update own score" had USING but no WITH CHECK, so any
--     authenticated user could PATCH their own total_score / rank to any
--     value. Verified live: setting total_score=999999 and rank=1 both
--     succeeded against a normal account.
--   * "Users can insert own leaderboard entry" allowed INSERT of a fresh row
--     with an arbitrary score (only a NOT NULL on email blocked the probe).
--   * ScholarshipPage computes merit qualification from total_score, so a
--     forged score put a user in the qualifying top-N immediately.
--
-- Writes now happen only in the update-leaderboard Edge Function, which runs
-- with the service role (so RLS does not apply to it), verifies the caller's
-- JWT, and re-derives correct/total from the stored quiz_attempts row rather
-- than trusting client-sent numbers. Users keep read access.

DROP POLICY IF EXISTS "Users can update own score" ON public.leaderboard_scores;
DROP POLICY IF EXISTS "Users can insert own leaderboard entry" ON public.leaderboard_scores;
DROP POLICY IF EXISTS "Users can insert own score" ON public.leaderboard_scores;

-- Admins retain full access for audit/correction.
DROP POLICY IF EXISTS "Admins can manage leaderboard" ON public.leaderboard_scores;
CREATE POLICY "Admins can manage leaderboard"
  ON public.leaderboard_scores FOR ALL
  USING (is_admin_or_owner(auth.uid()))
  WITH CHECK (is_admin_or_owner(auth.uid()));

-- Defence in depth: even a future stray policy cannot re-open scoring, because
-- the table-level grant is gone. The Edge Function is unaffected (service role).
REVOKE INSERT, UPDATE, DELETE ON public.leaderboard_scores FROM anon, authenticated;
