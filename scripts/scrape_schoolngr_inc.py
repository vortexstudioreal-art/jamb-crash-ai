"""
Schoolngr.com JAMB scraper - incremental version.

Saves progress after each page so a timeout never loses work, and stops
without marking a subject "complete" when the failure was the network
rather than the end of the pagination.

Usage:
    python scripts/scrape_schoolngr_inc.py <subject-slug> [--pages N]

--pages N caps how many pages this run pulls (default: all). Use it to
spread a batch across several subjects instead of draining one.
"""

import argparse
import html
import json
import os
import re
import sys
import time
import urllib.error
import urllib.request

# Public anon key. Insert is allowed for anon via the policy added in
# supabase/migrations/20261024000200_insert_questions_anon_policy.sql.
SUPABASE_URL = os.environ.get("VITE_SUPABASE_URL", "https://pjdgzqnyyobtiwplatni.supabase.co")
SUPABASE_KEY = os.environ.get(
    "VITE_SUPABASE_PUBLISHABLE_KEY",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqZGd6cW55eW9idGl3cGxhdG5pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUwMjk0NzMsImV4cCI6MjEwMDYwNTQ3M30.kL3ZsJb4fCoYvuTXGzXL0um3Ui1vvZEVslPVXiToyPs",
)

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROGRESS_FILE = os.environ.get(
    "SCRAPE_PROGRESS_FILE",
    os.path.join(SCRIPT_DIR, "scrape_progress.json"),
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


def log(msg):
    print(msg, flush=True)


def fetch(url, timeout=15):
    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "Accept": "text/html",
        },
    )
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return resp.read().decode("utf-8", errors="replace")


def supabase_insert(rows):
    url = f"{SUPABASE_URL}/rest/v1/jamb_questions"
    data = json.dumps(rows).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=data,
        headers={
            "apikey": SUPABASE_KEY,
            "Authorization": f"Bearer {SUPABASE_KEY}",
            "Content-Type": "application/json",
            "Prefer": "resolution=merge-duplicates,return=minimal",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return resp.status, resp.read().decode()[:200]
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode()[:500]
    except Exception as e:  # network errors on insert
        return 0, str(e)[:300]


def clean_text(s):
    if not s:
        return s
    s = re.sub(r"<[^>]+>", " ", s)
    s = html.unescape(s)
    # schoolngr publishes UTF-8 that arrives as cp1252 mojibake ("â†’" for "→").
    # Repair it when it round-trips cleanly, otherwise leave the text as-is.
    try:
        s = s.encode("cp1252").decode("utf-8")
    except (UnicodeEncodeError, UnicodeDecodeError):
        pass
    s = re.sub(r"\s+", " ", s).strip()
    return s


def load_progress():
    if os.path.exists(PROGRESS_FILE):
        with open(PROGRESS_FILE, "r") as f:
            return json.load(f)
    return {"completed_subjects": [], "total_inserted": 0, "subject_progress": {}}


def save_progress(progress):
    with open(PROGRESS_FILE, "w") as f:
        json.dump(progress, f, indent=2)


def scrape_listing_page(slug, page_num):
    url = f"https://www.schoolngr.com/classroom/jamb/{slug}?page={page_num}"
    html = fetch(url)
    blocks = re.split(r"<div class='question-block'>", html)
    questions = []
    for block in blocks[1:]:
        q_match = re.search(r"<div class='question-text'>(.*?)</div>", block, re.DOTALL)
        q_text = clean_text(q_match.group(1)) if q_match else ""
        year_match = re.search(r"examyear=(\d{4})", block)
        year = int(year_match.group(1)) if year_match else None
        options = {}
        # schoolngr serves five options (A-E); four are stored, so capture all
        # five and let build_row pick which one to drop.
        opt_matches = re.findall(
            r"<li data-option='([A-E])'(?: data-correct=[\"']true[\"'])?>"
            r"<span class='option-label'>[A-E]</span>(.*?)</li>",
            block,
        )
        for opt_letter, opt_text in opt_matches:
            options[opt_letter] = clean_text(opt_text)
        correct = None
        correct_match = re.search(r"<li data-option='([A-E])' data-correct=[\"']true[\"']>", block)
        if correct_match:
            correct = correct_match.group(1)
        detail_match = re.search(r"href='/classroom/[a-z0-9_-]+/(\d+)'", block)
        detail_id = detail_match.group(1) if detail_match else None
        if q_text and options:
            questions.append(
                {
                    "question": q_text,
                    "year": year,
                    "options": options,
                    "correct_answer": correct,
                    "detail_id": detail_id,
                    "slug": slug,
                }
            )
    return questions


def scrape_detail_page(slug, detail_id):
    url = f"https://www.schoolngr.com/classroom/{slug}/{detail_id}"
    try:
        html = fetch(url, timeout=10)
    except Exception:
        return None, None
    correct = None
    ans_match = re.search(
        r'<div class="question-answer-content"><strong>Correct Answer:</strong>\s*Option\s*([A-D])',
        html,
    )
    if ans_match:
        correct = ans_match.group(1)
    explanation = None
    expl_match = re.search(
        r'<div class="question-explanation-content"><strong>Explanation:</strong>(.*?)</div>',
        html,
        re.DOTALL,
    )
    if expl_match:
        explanation = clean_text(expl_match.group(1))
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


def process_subject(slug, subject_name, progress, max_pages=None):
    subj_progress = progress["subject_progress"].get(slug, {"last_page": 0, "inserted": 0})
    start_page = subj_progress["last_page"] + 1
    stopped_on_error = False   # network / insert failure
    stopped_on_cap = False     # hit --pages limit, there may be more pages
    reached_end = False        # empty listing page = true end

    log(f"Scraping {slug} -> {subject_name} (starting from page {start_page})")

    page = start_page
    pages_this_run = 0
    while True:
        if max_pages is not None and pages_this_run >= max_pages:
            log(f"  Hit --pages limit ({max_pages}), stopping for now")
            stopped_on_cap = True
            break

        try:
            qs = scrape_listing_page(slug, page)
        except Exception as e:
            # A network error is not the end of the subject. Remember the last
            # good page and stop here so the next run resumes instead of
            # silently throwing away the rest of the subject.
            log(f"  Page {page} network error: {e}")
            log(f"  Stopping at page {page - 1}; {slug} stays incomplete")
            subj_progress["last_page"] = page - 1
            progress["subject_progress"][slug] = subj_progress
            save_progress(progress)
            stopped_on_error = True
            break

        if not qs:
            log(f"  Page {page}: no more questions - subject complete")
            reached_end = True
            break

        log(f"  Page {page}: {len(qs)} questions")

        for q in qs:
            if q["detail_id"]:
                try:
                    correct, explanation = scrape_detail_page(slug, q["detail_id"])
                    if correct:
                        q["correct_answer"] = correct
                    q["explanation"] = explanation
                except Exception as e:
                    log(f"    Detail error for {q['detail_id']}: {e}")
                time.sleep(0.05)

        rows = []
        kept = []
        for q in qs:
            row = build_row(slug, q)
            if row is None:
                continue
            rows.append(row)
            kept.append(q)
        if len(kept) < len(qs):
            log(f"    Skipped {len(qs) - len(kept)} unusable question(s)")

        if rows:
            status, body = supabase_insert(rows)
            if status == 201:
                subj_progress["inserted"] = subj_progress.get("inserted", 0) + len(rows)
                progress["total_inserted"] = progress.get("total_inserted", 0) + len(rows)
                log(f"    Inserted {len(rows)} questions")
            else:
                log(f"    INSERT FAILED: {status} {body}")
                # Do not advance last_page: retry this page next run.
                progress["subject_progress"][slug] = subj_progress
                save_progress(progress)
                stopped_on_error = True
                break

        subj_progress["last_page"] = page
        progress["subject_progress"][slug] = subj_progress
        save_progress(progress)

        pages_this_run += 1
        page += 1
        time.sleep(0.3)

        if page > 200:
            log("  Reached page limit (200), stopping")
            stopped_on_cap = True
            break

    if stopped_on_error or stopped_on_cap or not reached_end:
        if slug in progress["completed_subjects"]:
            progress["completed_subjects"].remove(slug)
        save_progress(progress)
        log(f"  Subject {slug} paused at page {subj_progress.get('last_page', 0)} - run again to resume")
        return False

    if slug not in progress["completed_subjects"]:
        progress["completed_subjects"].append(slug)
    save_progress(progress)
    log(f"  Subject {slug} complete")
    return True


def main():
    parser = argparse.ArgumentParser(description="Incremental schoolngr.com JAMB scraper")
    parser.add_argument("slug", help="schoolngr subject slug, e.g. biology")
    parser.add_argument("--pages", type=int, default=None, help="max pages to pull this run")
    parser.add_argument("--restart", action="store_true", help="ignore saved page and start at 1")
    args = parser.parse_args()

    slug = args.slug
    if slug not in SLUG_TO_SUBJECT:
        print(f"Unknown slug '{slug}'. Known: {', '.join(sorted(SLUG_TO_SUBJECT))}")
        sys.exit(1)

    subject_name = SLUG_TO_SUBJECT[slug]
    progress = load_progress()

    if args.restart:
        progress["subject_progress"].pop(slug, None)
        if slug in progress["completed_subjects"]:
            progress["completed_subjects"].remove(slug)

    if slug in progress["completed_subjects"] and not args.restart:
        print(f"{slug} already completed. Use --restart to redo it.")
        return

    process_subject(slug, subject_name, progress, max_pages=args.pages)


if __name__ == "__main__":
    main()
