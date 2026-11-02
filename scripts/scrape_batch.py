"""Scrape several schoolngr subjects in one run.

Usage:
    python scripts/scrape_batch.py 5 computer-studies arabic french ...

Each subject is fetched up to N pages, resuming from scripts/scrape_progress.json.
Failures are non-fatal: the run moves on to the next subject.
"""

import sys
import time
import traceback

import scrape_schoolngr_inc as s


def main():
    if len(sys.argv) < 3:
        print("Usage: python scripts/scrape_batch.py <pages-per-subject> <slug> [slug ...]")
        sys.exit(1)

    pages = int(sys.argv[1])
    slugs = sys.argv[2:]
    progress = s.load_progress()

    for slug in slugs:
        if slug not in s.SLUG_TO_SUBJECT:
            print(f"!! unknown slug '{slug}', skipping")
            continue
        if slug in progress["completed_subjects"]:
            print(f"== {slug} already complete, skipping")
            continue
        print(f"\n=== {slug} ===")
        try:
            s.process_subject(slug, s.SLUG_TO_SUBJECT[slug], progress, max_pages=pages)
        except Exception:
            print(f"!! {slug} crashed, continuing")
            traceback.print_exc()
        time.sleep(1)

    print(f"\nBatch done. total_inserted={progress.get('total_inserted')}")


if __name__ == "__main__":
    main()
