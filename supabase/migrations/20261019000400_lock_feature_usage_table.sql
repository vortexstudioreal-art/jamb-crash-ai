-- feature_usage was fully client-writable, which made the daily caps and the
-- rewarded-ad economy cosmetic:
--   * UPDATE had USING but no WITH CHECK, so a user could set usage_count or
--     bonus_uses to any value for their own row.
--   * DELETE let them erase their row outright, resetting the day's counters.
--   * INSERT let them mint a row with any contents.
-- Hardening increment_feature_usage()/grant_bonus_use() alone did not help,
-- because the table itself was still open — these policies are what close it.
--
-- The app only ever SELECTs this table (useFeatureUsage); every write goes
-- through the SECURITY DEFINER RPCs, so removing the write policies changes
-- nothing for legitimate use.

DROP POLICY IF EXISTS "Users can insert own feature usage" ON public.feature_usage;
DROP POLICY IF EXISTS "Users can update own feature usage" ON public.feature_usage;
DROP POLICY IF EXISTS "Users can delete own feature usage" ON public.feature_usage;

-- Admins keep full access for audits and manual corrections.
DROP POLICY IF EXISTS "Admins can manage feature usage" ON public.feature_usage;
CREATE POLICY "Admins can manage feature usage"
  ON public.feature_usage FOR ALL
  USING (is_admin_or_owner(auth.uid()))
  WITH CHECK (is_admin_or_owner(auth.uid()));

-- Defence in depth: the RPCs are SECURITY DEFINER, so they bypass RLS as the
-- table owner. Revoke direct table writes from the anon/authenticated roles so
-- no future policy mistake can re-open them.
REVOKE INSERT, UPDATE, DELETE ON public.feature_usage FROM anon, authenticated;