# Question scraper

Pulls real JAMB past questions (with answers and explanations) from
schoolngr.com into `jamb_questions`.

## Run it unattended (recommended)

```powershell
powershell -ExecutionPolicy Bypass -File scripts\install_scrape_worker.ps1 -StartNow
```

That drops a launcher into your Startup folder, so the worker starts at
every logon with no console window and restarts itself if it exits.
No admin rights needed.

- Check progress: `python scripts\scrape_worker.py --status`
- Watch the log: `Get-Content scripts\scrape-worker.log -Tail 30 -Wait`
- Stop and remove: `powershell -ExecutionPolicy Bypass -File scripts\install_scrape_worker.ps1 -Uninstall`

The worker walks `scripts/scrape_queue.json`, one page at a time:

- saves progress after every page, so killing it loses nothing
- retries network failures forever with backoff (30s → 15min)
- rotates to another subject when one keeps failing
- skips questions already in the bank
- only marks a subject complete after an empty page is confirmed twice

If the PC is offline it waits and retries; when the connection returns it
carries on from the last saved page. If the PC is asleep or switched off,
nothing can run — it resumes on the next logon.

## Run it once, in the foreground

```powershell
python scripts\scrape_worker.py --once --pages-per-visit 3
```

## Single subject

```powershell
python scripts\scrape_schoolngr_inc.py biology --pages 5
python scripts\scrape_schoolngr_inc.py biology --restart   # redo from page 1
```

## Batch of subjects

```powershell
python scripts\scrape_batch.py 4 french history music art
```

## State

- `scripts/scrape_progress.json` — last good page per subject, resume state
- `scripts/scrape_queue.json` — subject order for the unattended worker
- `scripts/scrape-worker.log` — dated log (gitignored)

## Notes

- Writes use the anon key while the temporary anon-INSERT policy exists.
  Set `SCRAPE_SUPABASE_KEY` to a service-role key and that policy can be
  dropped.
- Empty subjects on schoolngr (Arabic, Hausa, Igbo, Yoruba, PHE) are
  verified empty and marked complete immediately.
