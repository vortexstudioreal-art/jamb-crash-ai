"""Resumable explanation backfill runner.

Walks the real UTME subjects, one Groq call per batch, 30s apart (the proven
Groq pacing). Idempotent server-side: the function only ever selects rows where
explanation IS NULL, so stopping and restarting is safe and never double-writes.

Stops cleanly on 429 (daily token allowance exhausted) and can simply be
re-run the next day to pick up where it left off. Intended to run unattended
from a scheduled task; also safe to run by hand.

Usage:  python scripts/run_backfill.py
"""
import json, os, sys, time, urllib.request, urllib.error

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

env = {}
envpath = os.path.join(ROOT, '.env')
for line in open(envpath):
    line = line.strip()
    if line and not line.startswith('#') and '=' in line:
        k, v = line.split('=', 1)
        env[k.strip()] = v.strip().strip('"').strip("'")
HOST = env['VITE_SUPABASE_URL']
KEY = env['VITE_SUPABASE_PUBLISHABLE_KEY']
LOG = os.path.join(ROOT, 'scripts', 'backfill-%s.log' % time.strftime('%Y-%m-%d'))

EMAIL = env.get('BACKFILL_EMAIL') or os.environ.get('BACKFILL_EMAIL', '')
PASSWORD = env.get('BACKFILL_PASSWORD') or os.environ.get('BACKFILL_PASSWORD', '')
if not EMAIL or not PASSWORD:
    raise SystemExit(
        'Set BACKFILL_EMAIL and BACKFILL_PASSWORD in .env (or the environment). '
        'The backfill needs a real account session; it is not left in the script '
        'so the password can be rotated without editing code.'
    )

# Real UTME subjects only. commerce/accounting are deliberately excluded:
# commerce is a WAEC subject, never examined by JAMB, and it held 514 of the
# missing explanations - 18% of all remaining backfill work.
SUBJECTS = ['english', 'mathematics', 'physics', 'chemistry', 'biology',
            'government', 'literature', 'economics', 'agricultural_science']

BATCH = 15          # function caps at 15; under the size that silently dies
SPACING = 30        # seconds between Groq calls


def log(msg):
    line = '[%s] %s' % (time.strftime('%H:%M:%S'), msg)
    print(line, flush=True)
    try:
        with open(LOG, 'a', encoding='utf-8') as f:
            f.write(line + '\n')
    except Exception:
        pass


def req(url, data=None, headers=None, tries=4):
    last = None
    for i in range(tries):
        try:
            return urllib.request.urlopen(urllib.request.Request(url, data=data, headers=headers or {}), timeout=180)
        except urllib.error.HTTPError as e:
            return e
        except Exception as ex:
            last = ex
            time.sleep(5)
    return last


def get_token():
    r = req(HOST + '/auth/v1/token?grant_type=password',
            data=json.dumps({'email': EMAIL, 'password': PASSWORD}).encode(),
            headers={'apikey': KEY, 'Content-Type': 'application/json'})
    if isinstance(r, urllib.error.HTTPError):
        raise SystemExit('AUTH FAIL %s' % r.code)
    if isinstance(r, Exception):
        raise SystemExit('AUTH NET %s' % r)
    return json.load(r)['access_token']


def remaining(tok):
    H = {'apikey': KEY, 'Authorization': 'Bearer ' + tok, 'Prefer': 'count=exact'}
    r = req(HOST + '/rest/v1/jamb_questions?select=id&explanation=is.null', headers=H)
    if isinstance(r, urllib.error.HTTPError) or isinstance(r, Exception):
        return None
    try:
        return int(r.headers.get('Content-Range', '0/0').split('/')[-1])
    except Exception:
        return None


def main():
    # Refuse to start if another run is already going. The scheduled task plus a
    # manual run would otherwise double-call Groq and waste the daily allowance.
    lockfile = os.path.join(ROOT, 'scripts', 'backfill.lock')
    if os.path.exists(lockfile):
        age = time.time() - os.path.getmtime(lockfile)
        if age < 3600:
            log('another run is active (lock %ds old) - exiting' % age)
            return
        log('clearing stale lock (%ds old)' % age)
    try:
        open(lockfile, 'w').close()
    except Exception:
        pass

    try:
        run()
    finally:
        try:
            os.remove(lockfile)
        except Exception:
            pass


def run():
    tok = get_token()
    start_left = remaining(tok)
    log('START - %s questions still missing explanations' % start_left)

    total_written = 0
    calls = 0
    auth_time = time.time()
    empty_streak = 0

    for subject in SUBJECTS:
        for attempt in range(400):
            # JWTs expire after an hour; refresh well before that.
            if time.time() - auth_time > 45 * 60:
                try:
                    tok = get_token()
                    auth_time = time.time()
                    log('refreshed auth token')
                except SystemExit:
                    log('AUTH EXPIRED - stopping, rerun to resume')
                    return

            H = {'apikey': KEY, 'Content-Type': 'application/json',
                 'Authorization': 'Bearer ' + tok}
            body = json.dumps({'subject': subject, 'limit': BATCH}).encode()
            r = req(HOST + '/functions/v1/backfill-explanations', data=body, headers=H)
            calls += 1

            if isinstance(r, urllib.error.HTTPError):
                detail = r.read().decode()[:160]
                if r.code == 429:
                    log('429 daily allowance exhausted at %s - stopping (rerun tomorrow)' % subject)
                    log('DONE calls=%d written=%d remaining=%s' % (calls, total_written, remaining(tok)))
                    return
                log('HTTP %s on %s: %s' % (r.code, subject, detail))
                time.sleep(SPACING)
                continue
            if isinstance(r, Exception):
                log('NET %s on %s' % (r, subject))
                time.sleep(SPACING)
                continue

            try:
                d = json.loads(r.read().decode())
            except Exception:
                log('bad JSON on %s' % subject)
                time.sleep(SPACING)
                continue

            parsed = d.get('parsed', d.get('written', 0)) or 0
            rejected = d.get('rejected', 0) or 0
            written = parsed
            total_written += written
            left = remaining(tok)

            log('%s: parsed=%s rejected=%s | total written=%d | remaining=%s'
                % (subject, parsed, rejected, total_written, left))

            if left is not None and left <= 0:
                log('ALL EXPLANATIONS DONE - %d written across %d calls' % (total_written, calls))
                return

            # No rows left for this subject: a few in a row means we are done.
            if parsed == 0 and rejected == 0 and (left is None or d.get('remaining', 1) == 0):
                empty_streak += 1
                if empty_streak >= 2:
                    log('%s exhausted' % subject)
                    break
            else:
                empty_streak = 0

            time.sleep(SPACING)

    log('FINISHED all subjects - calls=%d written=%d remaining=%s'
        % (calls, total_written, remaining(tok)))


if __name__ == '__main__':
    main()
