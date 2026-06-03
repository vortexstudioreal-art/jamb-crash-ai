# Fix-Up Pass (pre-admin / pre-pricing)

Grouped by area. After all of this is shipped & verified, we move on to **admin dashboard + price changes** in a separate round.

---

## 1. Novels — two modes: Summary + Full Book

Current "Summary" mode (AI study guide) stays as-is. Add a parallel **Full Book** mode.

- DB: add `full_book_pdf_url` (text) + `full_book_pdf_path` (text, for storage) to `novels`.
- New private storage bucket `book-pdfs` with admin-only write, signed-URL read for paid users.
- Admin panel → Novels: form to either **upload a PDF** (stored in bucket) OR **paste an external URL** (Archive.org etc.). Per book, either field works.
- Novel detail page: two tabs — **Study Guide** (existing chapters) and **Full Book** (PDF viewer).
- Mobile: open in new window (existing iOS workaround pattern).

## 2. Core subject books as PDFs (English, Maths, Physics, etc.)

- New table `subject_books` (subject, title, author, year, pdf_url, pdf_path, uploaded_by, is_active).
- Shown inside **Study Materials** per subject as a "📘 Recommended Books" section.
- Same admin upload-OR-URL flow as novels.
- Filtered by the user's selected subjects (English + 3).

## 3. Quiz bugs

- **Highlight persists on next question**: in `TimedQuiz`, `selectedAnswer` UI state isn't being cleared between questions. Reset selection + feedback state in the `onNext` handler (and on `currentIndex` change via `useEffect`).
- **Answer B bias**: questions are stored with a fixed `correct_answer` letter. Shuffle options at render time per question and remap the correct letter so position is random across A/B/C/D. Store shuffle seed per question in session so review screens still match.

## 4. Mastery Tracker — stricter rule

Replace current heuristic. A syllabus topic is **Completed** only when **both**:
1. Reading progress on that topic = 100%, AND
2. User has scored ≥70% on **5 separate quiz attempts** tagged to that topic.

Levels: Not started → Learning (any progress) → Practicing (1–4 passing quizzes) → **Mastered** (5+ passing quizzes + 100% read).
- Add `topic` tag to `quiz_attempts.questions_data` aggregation (already partially there) and compute counts from `jamb_questions.topics`.

## 5. More questions

- Add ~1,000 more questions across the 4 lowest-count subjects via a new `seed-extra-questions-v2` edge function (Gemini-generated, deduped by question hash).
- Run from admin once, idempotent.

## 6. High-Yield Topics accuracy

- Currently pulls any question loosely matching a topic name → some out-of-subject leaks.
- Fix: filter strictly by `subject = X AND topics @> ARRAY[topic]` (Postgres array contains). No fuzzy matching.
- Drop topics with <5 real questions in that subject so we never show "high yield" topics that have no real coverage.

## 7. Offline mode — must-be-online-first gate

- Remove the always-available offline toggle.
- New rule: offline mode is **opt-in per device**. User must tap **"Enable Offline Mode"** while online → triggers full download (questions, syllabus, novels, flashcards for their subjects) → only then can the app run offline.
- If they haven't enabled it and go offline → show "You need to enable offline mode while online first" screen instead of cached fallback.
- Store `offline_enabled: true` flag in IndexedDB alongside the download.

## 8. Referrals — switch to Airtime rewards

Replace the 500 NGN account credit model.

- Reward = **₦200 airtime** per successful referral (referred user must complete a paid signup).
- New table `airtime_rewards` (email, network, phone, amount, status: pending/sent/failed, created_at, sent_at).
- User flow: dashboard "Refer & Earn" → shows pending airtime balance → "Claim" button asks for **phone + network** → creates a `pending` row.
- Admin panel: "Airtime Payouts" tab → list pending → mark sent (manual delivery for v1; automated VTU integration later).
- Minimum claim: ₦200 (1 successful referral).

## 9. Countdown — negative values

- JAMB countdown currently subtracts past dates without clamping → shows negative days.
- Fix: clamp to 0 and switch UI to **"Exam in progress / completed"** state when `examDate <= today`.
- Add admin-editable `exam_date` setting (single row in `app_settings` table) so it's not hardcoded.

## 10. "NEW" tool that doesn't work

- Need to identify which tool. Based on dashboard, this is likely the new feature card with a "NEW" badge that has no handler / broken route.
- I'll audit all `NEW`-badged cards in `DashboardHeader` / `Index` / `PremiumDashboard` and either wire the missing route or hide the badge until working.
- (If you can name it before I start, even better — but I'll find it.)

---

## Technical details

```text
DB migrations
├── novels: + full_book_pdf_url, full_book_pdf_path
├── new: subject_books (id, subject, title, author, year, pdf_url, pdf_path, is_active)
├── new: airtime_rewards (id, email, phone, network, amount, status, created_at, sent_at)
├── new: app_settings (key, value jsonb) — for exam_date etc.
└── storage bucket: book-pdfs (private, admin-write, signed-url read for paid users)

Edge functions
├── seed-extra-questions-v2 (deduped Gemini generation)
└── sign-book-pdf (returns signed URL after paid-access check)

Frontend
├── NovelDetail: Summary | Full Book tabs + PDF viewer
├── StudyMaterials: per-subject "Recommended Books" section
├── TimedQuiz: clear selection on next + shuffle options
├── TopicMasteryTracker: new 5-quiz rule
├── HighYieldQuestions: strict subject+topic array filter
├── Offline gate screen + opt-in flow
├── ReferralSystem: airtime claim UI
├── Countdown: clamp + admin-editable date
└── Audit + fix the broken "NEW" tool
```

## Out of scope (next round)

- Admin dashboard redesign
- Price changes
- Automated airtime VTU integration
