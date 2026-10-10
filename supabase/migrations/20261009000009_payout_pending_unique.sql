-- One pending payout request per collaborator. The client guards with a
-- pre-check, but double-clicks across tabs could still insert two pending
-- rows and get paid twice. The partial unique index makes the second insert
-- fail with 23505, which the client turns into an "already pending" notice.

DROP INDEX IF EXISTS public.payout_requests_one_pending_per_collaborator;
CREATE UNIQUE INDEX payout_requests_one_pending_per_collaborator
  ON public.payout_requests (collaborator_email)
  WHERE status = 'pending';
