## Goal

Replace the single scrolling dashboard with a modern 5-tab bottom navigation, matching the mockup you shared. All existing features stay — they just move into the tab where they belong.

## Bottom Nav (always visible when signed in)

```
🏠 Home    📚 Study    🤖 AI    🏆 Community    👤 Profile
```

- Fixed to bottom of the viewport, safe-area padding for iOS.
- Active tab uses the green primary color (matches mockup).
- Visible on both mobile and desktop (centered, max-width). Say the word if you want it mobile-only.
- The top `DashboardHeader` (logo, notifications, admin shield) stays.

## Tab contents

**🏠 Home** — "one screen, minimal scroll"
- Greeting ("Good morning, {name} 👋")
- Predicted JAMB Score card (existing `ScorePredictor`)
- Study Streak + Today's Goal row (compact)
- Quick Actions grid: Full Quiz · Mini Quiz · Practice · Ask AI
- AI Tip card (existing daily tip)
- Continue Studying (last quiz / last novel)

**📚 Study**
- Study Plan · Flashcards · Notes · PDFs · Syllabus · Novels · High-Yield Questions
- Rendered as a clean list/grid of feature cards that route into the existing components.

**🤖 AI** — the "wow" tab
- Ask AI (ChatBot)
- Score Prediction (full detailed view)
- Weakness Analysis (from `TopicMasteryTracker` + weak subject)
- Study Recommendations (AI-generated)
- AI Generated Quiz entry point
- Slight gradient / glow treatment so it feels premium.

**🏆 Community**
- Leaderboard · Scholarships · WhatsApp Channel · TikTok · Challenges (Speed Round / Streak) · Daily Streaks

**👤 Profile**
- Study Stats · Achievements · Settings · Notifications · Premium (upgrade / manage) · Logout

## Technical approach

- New `src/components/BottomNav.tsx` — 5 tabs, active state, motion transitions.
- New `src/components/tabs/` folder with `HomeTab.tsx`, `StudyTab.tsx`, `AITab.tsx`, `CommunityTab.tsx`, `ProfileTab.tsx`. Each is a thin composition of existing components — no business logic rewrites.
- `Index.tsx` dashboard branch switches from the current long scroll to `<ActiveTab />` based on a new `activeTab` state; the existing `currentStep` state machine (quiz, quiz-results, novel-reader, etc.) still handles full-screen sub-views.
- Add `pb-20` to tab content to clear the bottom nav.
- Deep links preserved: `?step=...` still works; new `?tab=home|study|ai|community|profile` for tab routing.

## Out of scope (unless you ask)

- Redesigning individual feature components (Flashcards, Leaderboard, etc.) — they stay as they are.
- Changing landing / auth / admin / collaborator pages.
- Changing pricing/payment flows.

Reply "go" and I'll build it. Or tell me: **mobile-only bottom nav, or all screens?**
