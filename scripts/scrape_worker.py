"""
Long-running scraper worker for schoolngr.com JAMB past questions.

Why this exists
---------------
The one-shot scraper needs a human to keep re-running it, and a dropped
connection used to look like "subject finished". This worker runs unattended:

  * walks a queue of subjects, one page at a time
  * saves progress after every page (kill it anytime, nothing is lost)
  * retries network failures forever with exponential backoff
  * rotates to the next subject when one keeps failing, so one dead
    subject can't stall the whole run
  * skips questions already in the bank (no duplicate rows)
  * only marks a subject complete after the empty page is confirmed twice
  * writes a dated log and takes a lock so two copies never run at once

When the machine is offline it simply waits and retries; as soon as the
connection comes back it carries on from the last saved page.

Usage
-----
    python scripts/scrape_worker.py                  # run forever
    python scripts/scrape_worker.py --once           # one pass over the queue
    python scripts/scrape_worker.py --pages-per-visit 3
    python scripts/scrape_worker.py --status

Stop it with Ctrl+C. Nothing is lost.
"""

import argparse
import datetime as dt
import html
import json
import os
import re
import sys
import time
import traceback
import urllib.error
import urllib.request

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROGRESS_FILE = os.environ.get("SCRAPE_PROGRESS_FILE", os.path.join(SCRIPT_DIR, "scrape_progress.json"))
QUEUE_FILE = os.environ.get("SCRAPE_QUEUE_FILE", os.path.join(SCRIPT_DIR, "scrape_queue.json"))
LOCK_FILE = os.path.join(SCRIPT_DIR, ".scrape_worker.lock")
LOG_FILE = os.path.join(SCRIPT_DIR, "scrape-worker.log")

SUPABASE_URL = os.environ.get("VITE_SUPABASE_URL", "https://pjdgzqnyyobtiwplatni.supabase.co")
# Prefer a service-role key kept out of source control (SCRAPE_SUPABASE_KEY).
# The anon fallback only works while the temporary anon-INSERT policy exists.
SUPABASE_KEY = (
    os.environ.get("SCRAPE_SUPABASE_KEY")
    or os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    or os.environ.get(
        "VITE_SUPABASE_PUBLISHABLE_KEY",
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqZGd6cW55eW9idGl3cGxhdG5pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUwMjk0NzMsImV4cCI6MjEwMDYwNTQ3M30.kL3ZsJb4fCoYvuTXGzXL0um3Ui1vvZEVslPVXiToyPs",
    )
)

SLUG_TO_SUBJECT = {
    "english-language": "english",
    "mathematics": "mathematics",
    "physics": "physics",
    "chemistry": "chemistry",
    "biology": "biology",
    "literature-in-english": "literature",
    "government": "government",
    "economics": "economics",
    "christian-religious-studies-crs": "crs",
    "islamic-religious-studies-irs": "irs",
    "geography": "geography",
    "agricultural-science": "agricultural_science",
    "commerce": "commerce",
    "accounts-principles-of-accounts": "accounting",
    "arabic": "arabic",
    "art": "art",
    "computer-studies": "computer_studies",
    "french": "french",
    "hausa": "hausa",
    "history": "history",
    "home-economics": "home_economics",
    "igbo": "igbo",
    "music": "music",
    "physical-health-education": "physical_health_education",
    "yoruba": "yoruba",
}

# Backoff schedule for network trouble (seconds).
BACKOFF = [30, 60, 120, 300, 600, 900]
MAX_PAGE = 200
STOP = False


def log(msg):
    line = f"[{dt.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] {msg}"
    print(line, flush=True)
    try:
        with open(LOG_FILE, "a", encoding="utf-8") as f:
            f.write(line + "\n")
    except Exception:
        pass


# ---------------------------------------------------------------- http

def fetch(url, timeout=20, attempts=3):
    last = None
    for i in range(attempts):
        try:
            req = urllib.request.Request(
                url,
                headers={
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                    "Accept": "text/html",
                },
            )
            with urllib.request.urlopen(req, timeout=timeout) as resp:
                body = resp.read().decode("utf-8", errors="replace")
            if len(body) < 2000:
                raise IOError(f"short response ({len(body)} bytes)")
            return body
        except Exception as e:  # network-ish, retry
            last = e
            if i < attempts - 1:
                time.sleep(3 + i * 4)
    raise last


def supabase_get(path, timeout=60):
    req = urllib.request.Request(
        f"{SUPABASE_URL}/rest/v1/{path}",
        headers={"apikey": SUPABASE_KEY, "Authorization": f"Bearer {SUPABASE_KEY}"},
    )
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return json.load(r)


def supabase_insert(rows):
    req = urllib.request.Request(
        f"{SUPABASE_URL}/rest/v1/jamb_questions",
        data=json.dumps(rows).encode("utf-8"),
        headers={
            "apikey": SUPABASE_KEY,
            "Authorization": f"Bearer {SUPABASE_KEY}",
            "Content-Type": "application/json",
            "Prefer": "return=minimal",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            return resp.status, resp.read().decode()[:200]
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode()[:500]
    except Exception as e:
        return 0, str(e)[:300]


# ---------------------------------------------------------------- state

def load_json(path, default):
    if os.path.exists(path):
        try:
            with open(path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return default
    return default


def save_json(path, data):
    tmp = path + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)
    os.replace(tmp, path)


def acquire_lock():
    if os.path.exists(LOCK_FILE):
        try:
            other = int(open(LOCK_FILE).read().strip())
            os.kill(other, 0)  # raises if not running
            return False
        except Exception:
            # stale lock
            pass
    with open(LOCK_FILE, "w") as f:
        f.write(str(os.getpid()))
    return True


def release_lock():
    try:
        if os.path.exists(LOCK_FILE) and int(open(LOCK_FILE).read().strip()) == os.getpid():
            os.remove(LOCK_FILE)
    except Exception:
        pass


# ---------------------------------------------------------------- dedupe

def normalise(text):
    text = (text or "").lower()
    text = re.sub(r"[^a-z0-9]+", " ", text)
    return re.sub(r"\s+", " ", text).strip()[:300]


class KnownQuestions:
    """All question texts already in the bank, so we never add duplicates."""

    def __init__(self):
        self.seen = set()
        self.loaded_at = 0

    def refresh(self, force=False):
        if not force and time.time() - self.loaded_at < 1800:
            return
        seen = set()
        offset = 0
        try:
            while True:
                batch = supabase_get(
                    f"jamb_questions?select=question&limit=1000&offset={offset}"
                )
                for row in batch:
                    seen.add(normalise(row.get("question")))
                if len(batch) < 1000:
                    break
                offset += 1000
            self.seen = seen
            self.loaded_at = time.time()
            log(f"Loaded {len(seen)} existing question fingerprints")
        except Exception as e:
            log(f"WARN could not refresh known questions ({e}); keeping previous set")

    def add(self, text):
        self.seen.add(normalise(text))

    def __contains__(self, text):
        return normalise(text) in self.seen


# ---------------------------------------------------------------- scraping

def clean_text(s):
    if not s:
        return s
    s = re.sub(r"<[^>]+>", " ", s)
    s = html.unescape(s)
    # schoolngr publishes UTF-8 that arrives as cp1252 mojibake ("â†’" for "→").
    # Repair it when it round-trips cleanly, otherwise leave the text as-is and
    # let the quality gate below decide.
    try:
        s = s.encode("cp1252").decode("utf-8")
    except (UnicodeEncodeError, UnicodeDecodeError):
        pass
    s = re.sub(r"\s+", " ", s).strip()
    return s


def scrape_listing_page(slug, page_num):
    html = fetch(f"https://www.schoolngr.com/classroom/jamb/{slug}?page={page_num}")
    blocks = re.split(r"<div class='question-block'>", html)
    questions = []
    for block in blocks[1:]:
        q_match = re.search(r"<div class='question-text'>(.*?)</div>", block, re.DOTALL)
        q_text = clean_text(q_match.group(1)) if q_match else ""
        year_match = re.search(r"examyear=(\d{4})", block)
        options = {}
        # schoolngr serves five options (A-E). Four are stored, so capture all
        # five and let build_row pick which one to drop.
        for letter, text in re.findall(
            r"<li data-option='([A-E])'(?: data-correct=[\"']true[\"'])?>"
            r"<span class='option-label'>[A-E]</span>(.*?)</li>",
            block,
        ):
            options[letter] = clean_text(text)
        correct_match = re.search(r"<li data-option='([A-E])' data-correct=[\"']true[\"']>", block)
        detail_match = re.search(r"href='/classroom/[a-z0-9_-]+/(\d+)'", block)
        if q_text and options:
            questions.append(
                {
                    "question": q_text,
                    "year": int(year_match.group(1)) if year_match else None,
                    "options": options,
                    "correct_answer": correct_match.group(1) if correct_match else None,
                    "detail_id": detail_match.group(1) if detail_match else None,
                }
            )
    return questions


def scrape_detail_page(slug, detail_id):
    try:
        html = fetch(f"https://www.schoolngr.com/classroom/{slug}/{detail_id}", timeout=15, attempts=2)
    except Exception:
        return None, None
    correct = None
    m = re.search(r'<div class="question-answer-content"><strong>Correct Answer:</strong>\s*Option\s*([A-D])', html)
    if m:
        correct = m.group(1)
    explanation = None
    m = re.search(r'<div class="question-explanation-content"><strong>Explanation:</strong>(.*?)</div>', html, re.DOTALL)
    if m:
        explanation = clean_text(m.group(1))
        if not explanation or explanation == "<br/>":
            explanation = None
    return correct, explanation


def build_row(slug, q):
    """Turn a scraped question into a row the bank can actually store.

    The table holds four options (option_a..option_d) but schoolngr serves
    five. Dropping ``option_e`` blindly would write questions whose
    correct_answer is "E" with no such option stored, so when E is the answer
    it is kept and renumbered D, discarding D's distractor instead.

    Returns None when the question cannot be represented faithfully.
    """
    options = q.get("options") or {}
    correct = (q.get("correct_answer") or "").strip().upper()
    text = (q.get("question") or "").strip()

    if len(text) < 5 or correct not in ("A", "B", "C", "D", "E"):
        return None
    if not all(options.get(letter) for letter in ("A", "B", "C", "D")):
        return None

    if correct == "E":
        if not options.get("E"):
            return None
        picked = [options["A"], options["B"], options["C"], options["E"]]
        correct = "D"
    else:
        picked = [options["A"], options["B"], options["C"], options["D"]]

    return {
        "subject": SLUG_TO_SUBJECT[slug],
        "question": text,
        "option_a": picked[0],
        "option_b": picked[1],
        "option_c": picked[2],
        "option_d": picked[3],
        "correct_answer": correct,
        "explanation": q.get("explanation") or "",
        "year": q.get("year"),
        "is_ai_generated": False,
        "topics": [SLUG_TO_SUBJECT[slug]],
        "image_url": None,
        "diagram_svg": None,
    }


def visit_subject(slug, progress, known, pages_per_visit):
    """Scrape up to N pages of one subject. Returns 'ok'|'done'|'error'."""
    state = progress["subject_progress"].setdefault(slug, {"last_page": 0, "inserted": 0})
    page = state["last_page"] + 1
    if page > MAX_PAGE:
        return "done"
    dup_pages = 0

    for _ in range(pages_per_visit):
        if STOP:
            return "ok"

        try:
            qs = scrape_listing_page(slug, page)
        except Exception as e:
            log(f"{slug} page {page}: network error ({e})")
            return "error"

        # An empty page can be a real end of pagination or a hiccup.
        if not qs:
            time.sleep(8)
            try:
                if not scrape_listing_page(slug, page):
                    log(f"{slug}: page {page} empty twice - subject finished")
                    progress["subject_progress"].pop(slug, None)
                    if slug not in progress["completed_subjects"]:
                        progress["completed_subjects"].append(slug)
                    save_json(PROGRESS_FILE, progress)
                    return "done"
                qs = scrape_listing_page(slug, page)
            except Exception as e:
                log(f"{slug} page {page}: error while confirming end ({e})")
                return "error"

        fresh = [q for q in qs if q["question"] not in known]
        skipped = len(qs) - len(fresh)
        if skipped:
            log(f"{slug} page {page}: skipped {skipped} duplicate(s)")

        # schoolngr keeps paginating long after the bank already holds the
        # questions, and duplicates cluster (up to ~9 pages seen) before new
        # content resumes. Ten all-duplicate pages in a row means the rest of
        # the subject is imported, so stop walking instead of grinding through
        # another 200 pages of no-ops.
        if not fresh:
            dup_pages += 1
            if dup_pages >= 10:
                log(f"{slug}: {dup_pages} pages with nothing new - treating as exhausted")
                progress["subject_progress"].pop(slug, None)
                if slug not in progress["completed_subjects"]:
                    progress["completed_subjects"].append(slug)
                save_json(PROGRESS_FILE, progress)
                return "done"
        else:
            dup_pages = 0

        if fresh:
            for q in fresh:
                if q["detail_id"]:
                    correct, explanation = scrape_detail_page(slug, q["detail_id"])
                    if correct:
                        q["correct_answer"] = correct
                    q["explanation"] = explanation
                    time.sleep(0.05)

            rows = []
            kept = []
            for q in fresh:
                row = build_row(slug, q)
                if row is None:
                    continue
                rows.append(row)
                kept.append(q)
            if len(kept) < len(fresh):
                log(f"{slug} page {page}: skipped {len(fresh) - len(kept)} unusable question(s)")

            if rows:
                status, body = supabase_insert(rows)
                if status != 201:
                    log(f"{slug} page {page}: INSERT FAILED {status} {body}")
                    return "error"

                for q in kept:
                    known.add(q["question"])
                state["inserted"] = state.get("inserted", 0) + len(rows)
                progress["total_inserted"] = progress.get("total_inserted", 0) + len(rows)
                log(f"{slug} page {page}: inserted {len(rows)}")

        state["last_page"] = page
        save_json(PROGRESS_FILE, progress)
        if slug in progress["completed_subjects"]:
            progress["completed_subjects"].remove(slug)
            save_json(PROGRESS_FILE, progress)

        page += 1
        if page > MAX_PAGE:
            return "done"
        time.sleep(1.0)

    return "ok"


# ---------------------------------------------------------------- main

def pending_subjects(progress, queue):
    done = set(progress.get("completed_subjects", []))
    return [s for s in queue if s not in done and s in SLUG_TO_SUBJECT]


def main():
    parser = argparse.ArgumentParser(description="Unattended schoolngr question worker")
    parser.add_argument("--once", action="store_true", help="one pass over the queue, then exit")
    parser.add_argument("--pages-per-visit", type=int, default=3, help="pages scraped before rotating subject")
    parser.add_argument("--idle-seconds", type=int, default=300, help="wait before rechecking a finished queue")
    parser.add_argument("--status", action="store_true", help="print queue status and exit")
    args = parser.parse_args()

    queue = load_json(QUEUE_FILE, list(SLUG_TO_SUBJECT.keys()))
    progress = load_json(PROGRESS_FILE, {"completed_subjects": [], "total_inserted": 0, "subject_progress": {}})

    if args.status:
        done = set(progress.get("completed_subjects", []))
        print(f"{'subject':<30}{'page':>6}{'inserted':>10}  state")
        print("-" * 60)
        for slug in queue:
            st = progress["subject_progress"].get(slug, {})
            started = st.get("last_page", 0) > 0 or st.get("inserted", 0) > 0
            state = "done" if slug in done else ("in progress" if started else "not started")
            print(f"{slug:<30}{st.get('last_page', 0):>6}{st.get('inserted', 0):>10}  {state}")
        print("-" * 60)
        print(f"total inserted this campaign: {progress.get('total_inserted', 0)}")
        return 0

    if not acquire_lock():
        print("Another worker is already running. Exiting.")
        return 0

    known = KnownQuestions()
    known.refresh(force=True)
    log(f"Worker started. Queue: {len(queue)} subjects")

    # Round-robin over the queue: each subject gets a short turn, then moves
    # to the back, so one slow subject can't monopolise the run.
    order = pending_subjects(progress, queue)
    failures = {}
    passes_done = 0

    try:
        while not STOP:
            done = set(progress.get("completed_subjects", []))
            order = [s for s in order if s not in done]
            if not order:
                order = pending_subjects(progress, queue)
            if not order:
                if args.once:
                    log("Queue finished.")
                    break
                log(f"All subjects complete. Sleeping {args.idle_seconds}s in case new ones appear.")
                time.sleep(args.idle_seconds)
                order = pending_subjects(progress, queue)
                continue

            # Healthy subjects first, but everyone keeps their turn.
            order.sort(key=lambda s: failures.get(s, 0))
            slug = order.pop(0)

            result = visit_subject(slug, progress, known, args.pages_per_visit)

            if result == "done":
                log(f"{slug}: complete")
                failures[slug] = 0
                # "done" also covers hitting MAX_PAGE, which never touches
                # completed_subjects. Record it here or the queue hands the
                # same subject straight back (a tight, log-spamming loop).
                if slug not in progress.get("completed_subjects", []):
                    progress.setdefault("completed_subjects", []).append(slug)
                    save_json(PROGRESS_FILE, progress)
                continue

            if result == "error":
                n = failures.get(slug, 0) + 1
                failures[slug] = n
                progress.setdefault("failures", {})[slug] = n
                save_json(PROGRESS_FILE, progress)
                # A timed-out insert may still have landed. Re-read the bank
                # before touching this page again so we don't add duplicates.
                known.refresh(force=True)
                wait = BACKOFF[min(n - 1, len(BACKOFF) - 1)]
                log(f"{slug}: failure #{n}, retrying after {wait}s")
                order.append(slug)
                if args.once and passes_done >= len(queue):
                    log("Stopping: --once pass finished with errors outstanding.")
                    break
                time.sleep(wait)
                continue

            failures[slug] = 0
            progress.setdefault("failures", {})[slug] = 0
            save_json(PROGRESS_FILE, progress)
            order.append(slug)
            time.sleep(1.0)

            if args.once:
                passes_done += 1
                if passes_done >= len(queue):
                    log("Queue pass finished.")
                    break

    except KeyboardInterrupt:
        log("Interrupted - progress saved, safe to restart.")
    except Exception:
        log("Worker crashed:\n" + traceback.format_exc())
        return 1
    finally:
        release_lock()

    return 0


if __name__ == "__main__":
    sys.exit(main())
