

# Plan: Fix Novel Chapters, WhatsApp, APK Download, Notes+Games, Performance & Login

## Issue Summary

After investigating, here's what I found:

### 1. Novel Chapters Showing "1 chapter"
The poetry entries (Crossing the Bar, The Proud King, The School Boy, The Pulley, etc.) genuinely only have 1 chapter in the database. This is because they're single poems with one analysis chapter. The `total_chapters` column matches the actual count. To fix the user perception, I'll enrich these poems into multiple sections (e.g., Summary, Line-by-Line Analysis, Themes, Literary Devices) as separate chapters -- similar to what was done for The Life Changer.

**Action**: Call the `enrich-novel-chapters` edge function for all remaining novels (poetry and prose that haven't been enriched yet). For poetry, update the approach to split content into 3-4 chapters (Summary & Context, Line-by-Line Analysis, Themes & Literary Devices, Practice Questions). Update `total_chapters` in the `novels` table accordingly.

### 2. WhatsApp Reminders
Good news: I tested the edge function and it **actually works** -- it just sent 3 messages successfully to all active users. The cron job runs daily at 5 AM UTC and recent runs all show "succeeded." 

The likely issue is **Twilio sandbox session expiration**. Users must periodically re-send "join sound-sound" to +14155238886 to stay connected. I'll improve the UI to make this more prominent and add a "Test Send" button so users can verify their connection.

### 3. APK Download Button
Since you need hosting suggestions: the simplest free option is uploading the APK to your GitHub releases or Google Drive. I'll add a download section/button on the landing page and settings page that links to wherever you host it. For now, I'll create the UI with a placeholder URL you can update.

### 4. Study Notes + Quiz Games
I'll add both features:
- **Study Notes**: A notes page where users can write, save, and organize notes by subject. Stored in the database with offline support via IndexedDB.
- **Quiz Games**: Fun mini-games like Speed Round (answer as many as possible in 60 seconds), Flashcard Match (match terms to definitions), and a Streak Challenge.

### 5. App Slowness
The main `Index.tsx` file is **1,406 lines** -- this is a major performance bottleneck. It loads ~40+ components and runs multiple `useEffect` hooks on mount including database queries for subjects, quiz history, and trial status. I'll:
- Lazy-load heavy components with `React.lazy()` and `Suspense`
- Split the dashboard into smaller sub-components
- Defer non-critical database queries
- Add loading skeletons for perceived performance

### 6. Subject Selection Still Showing on Login
The cache-first approach is implemented but there's a timing issue: `subjectsLoading` starts as `true` (line 83), which blocks the auto-redirect (line 142). When the cached subjects are loaded, `subjectsLoading` is set to `false`, but the auto-redirect `useEffect` may not re-trigger properly due to dependency timing with `isFullyLoading` (which also depends on `trialLoading`). Fix: initialize `subjectsLoading` based on whether cache exists, and ensure the redirect fires immediately when cache is found.

---

## Implementation Steps

### Step 1: Fix subject selection redirect (performance + UX)
- Initialize `subjectsLoading` to `false` if localStorage cache exists
- Move cache check into state initializer so it's available on first render
- This also improves perceived speed

### Step 2: Lazy-load heavy components
- Wrap dashboard sub-views (TimedQuiz, Flashcards, SyllabusReader, NovelBrowser, StudyMaterials, etc.) with `React.lazy`
- Add `Suspense` boundaries with loading skeletons

### Step 3: Enrich remaining novel chapters
- Update the `enrich-novel-chapters` edge function to handle poetry (split into 3-4 analysis chapters)
- Run enrichment for all un-enriched novels
- Update `total_chapters` in the novels table

### Step 4: Add WhatsApp "Test Connection" button
- Add a "Send Test Message" button in the WhatsApp setup card
- Make the sandbox activation instructions more prominent (not hidden in a collapsible)

### Step 5: Add APK download button
- Add a download card/button on the landing page and settings
- Use a configurable URL (stored in a constant, easy to update)

### Step 6: Create Study Notes feature
- Database table: `user_notes` (id, email, title, content, subject, created_at, updated_at)
- Notes page with create/edit/delete, organized by subject
- Cache notes in IndexedDB for offline

### Step 7: Create Quiz Games feature  
- Speed Round: 60-second timed challenge, answer as many questions as possible
- Streak Challenge: How many correct answers in a row
- Accessible from dashboard as a "Games" card

