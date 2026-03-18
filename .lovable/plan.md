

# Application Health Report

## Summary
After reviewing the codebase, console logs, network requests, edge function logs, and database schema, here is a comprehensive status report.

---

## WORKING

| Feature | Status | Notes |
|---------|--------|-------|
| **Authentication (Login/Signup)** | Working | Email validation, disposable email blocking, password recovery all implemented |
| **Subject Selection** | Working | English + 3 subject picker with caching for instant reload |
| **Dashboard Navigation** | Working | `startTransition` fix resolved the React suspension/blank screen error |
| **Mini Quiz (20 Qs)** | Working | Available to all users, fetches from `jamb_questions` table |
| **Full Quiz (60 Qs)** | Working | Feature-gated to Pro+ users, lazy-loaded |
| **Practice Quiz** | Working | By-subject mode, feature-gated |
| **Quiz Results** | Working | Shows score breakdown after quiz completion |
| **Games Page** | Working | Dedicated `/games` route with Speed Round and Streak Challenge |
| **Study Plan Generator** | Working | Lazy-loaded, accepts personalization data |
| **Syllabus Reader** | Working | Reads from `jamb_syllabus` table |
| **Flashcards** | Working | CRUD operations with spaced repetition |
| **Study Notes** | Working | Personal notes per subject |
| **JAMB Novels** | Working | Browser, detail, and reader views with progress tracking |
| **Leaderboard** | Working | Server-side authenticated after security fix |
| **Repeated/High-Yield Questions** | Working | Dedicated page at `/repeated-questions` |
| **Score Predictor** | Working | Weighted algorithm using quiz history |
| **Referral System** | Working | Code generation and tracking |
| **Dark Mode** | Working | Defaults to dark, persists preference |
| **Trial System (30 min)** | Working | Database-backed, prevents re-use |
| **Payment Flow (Paystack)** | Working | Server-side price validation added |
| **Admin Panel** | Working | Protected by `requireAdmin` route guard |
| **RLS Policies** | Working | All tables have proper row-level security |
| **Offline Caching** | Working | Subjects and access state cached in localStorage |
| **Settings Page** | Working | Route exists at `/settings` |

---

## ISSUES FOUND

### 1. ChatBot - Authorization uses anon key instead of user token
**Severity: Medium**
In `ChatBot.tsx` line 118, the chat edge function is called with the **anon key** as Bearer token instead of the user's session access token. This means the chat function can't verify who's calling it.
```typescript
// Current (wrong):
Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
// Should be:
Authorization: `Bearer ${session?.access_token}`,
```

### 2. GamesPage - No ProtectedRoute wrapper
**Severity: Medium**
The `/games` route in `App.tsx` (line 73) has no `<ProtectedRoute>` wrapper. An unauthenticated user navigating to `/games` will see a brief flash before being redirected via the `navigate('/auth')` inside the component. This is inconsistent with the app's auth pattern.

### 3. Dashboard `setCurrentStep` not wrapped in `startTransition` in some places
**Severity: Low**
Lines 1142 and 1404-1410 in `Index.tsx` use `setCurrentStep(...)` directly without `startTransition`, which could re-trigger the suspension error when lazy-loaded components are involved (e.g., clicking "Upload PDF" button on dashboard).

### 4. `handle_new_user` trigger has hardcoded admin emails
**Severity: Low (Security Smell)**
The database trigger `handle_new_user` still contains hardcoded emails (`muzzyothmam@gmail.com`, `saeedabdulbasit933@gmail.com`) for auto-assigning admin roles. This is functional but inflexible.

### 5. `payments` table INSERT policy allows anonymous inserts
**Severity: Medium**
The `payments` table has `WITH CHECK (true)` for INSERT, meaning anyone (even unauthenticated) can insert payment records. This should be restricted to authenticated users at minimum.

### 6. Duplicate INSERT policies on `leaderboard_scores`
**Severity: Low**
Two identical INSERT policies exist: "Users can insert own leaderboard entry" and "Users can insert own score" — both check `user_id = auth.uid()`. Redundant but not broken.

### 7. WhatsApp Sandbox credentials exposed in client code
**Severity: Low**
`WhatsAppReminder.tsx` has `SANDBOX_NUMBER = '+14155238886'` and `SANDBOX_JOIN_MESSAGE = 'join sound-sound'` hardcoded. This is a Twilio sandbox detail — not a real security risk but messy for production.

---

## UNTESTABLE (Require Live Interaction)

These features need manual testing with a logged-in session:

| Feature | Why |
|---------|-----|
| **Paystack Payment** | Requires real/test Paystack transaction |
| **WhatsApp Reminders** | Requires Twilio sandbox opt-in |
| **Email Reminders** | Requires Resend API call |
| **JAMB News** | Edge function fetches external news |
| **Scholarships** | Edge function fetches external data |
| **PDF Upload** | Requires file upload interaction |
| **ChatBot AI responses** | Requires Lovable AI API key working |

---

## RECOMMENDED FIXES (Priority Order)

1. **Fix ChatBot auth** — Use session access token instead of anon key
2. **Wrap `/games` in ProtectedRoute** — Consistent auth enforcement
3. **Fix remaining `setCurrentStep` calls** — Wrap in `startTransition` (lines 1142, 1404-1410)
4. **Restrict `payments` INSERT** — Change to `authenticated` role with email check
5. **Remove duplicate leaderboard INSERT policy** — Cleanup

