-- Daily Educational Notifications Cron Job
-- Runs every day at 7:00 AM (WAT / UTC+1) = 8:00 AM UTC
-- Sends riddles, quotes, fun facts, leaderboard updates, and study reminders

SELECT cron.schedule(
  'daily-educational-notifications',
  '0 8 * * *',
  $$
  SELECT net.http_post(
    url := current_setting('app.settings.supabase_url') || '/functions/v1/daily-educational-notification',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
    ),
    body := '{}'::jsonb
  );
  $$
);
