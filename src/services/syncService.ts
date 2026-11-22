import { supabase } from '@/integrations/supabase/client';
import { errorLogger } from '@/services/errorLogger';
import { withTimeout } from '@/lib/withTimeout';
import type { Database } from '@/integrations/supabase/types';
import { 
  getSyncQueue, 
  removeSyncItem, 
  updateSyncItemRetries,
  saveQuestions,
  saveFlashcards,
  saveSyllabus,
  saveNovels,
  saveNovelChapters,
  saveLessons,
  getMetadata,
  setMetadata,
  type SyncItem,
  type CachedLesson,
} from './offlineStorage';

const MAX_RETRIES = 10;

// Guard against concurrent sync runs (AuthContext periodic sync +
// useOfflineStatus online-flush can fire together): without it the same
// queue items insert twice before either run deletes them.
let syncInFlight = false;

// Sync pending items when back online
export const syncPendingItems = async (): Promise<{ synced: number; failed: number }> => {
  if (syncInFlight) return { synced: 0, failed: 0 };
  syncInFlight = true;
  try {
    const queue = await getSyncQueue();
    let synced = 0;
    let failed = 0;

    for (const item of queue) {
      try {
        await processSyncItem(item);
        await removeSyncItem(item.id);
        synced++;
      } catch (error) {
        errorLogger.error(error, { component: 'syncService', action: `sync item ${item.id}` });

        if (item.retries >= MAX_RETRIES) {
          await removeSyncItem(item.id);
          failed++;
        } else {
          await updateSyncItemRetries(item.id, item.retries + 1);
        }
      }
    }

    return { synced, failed };
  } finally {
    syncInFlight = false;
  }
};

const processSyncItem = async (item: SyncItem): Promise<void> => {
  switch (item.type) {
    case 'quiz_attempt': {
      // ignoreDuplicates: a retried attempt whose original insert actually
      // landed must not create a second row (it would double-count scores).
      const { error } = await supabase.from('quiz_attempts').upsert(
        item.data as Database['public']['Tables']['quiz_attempts']['Insert'],
        { onConflict: 'id', ignoreDuplicates: true }
      );
      if (error) throw error;
      break;
    }
    case 'flashcard_update': {
      const data = item.data as { updates: Database['public']['Tables']['flashcards']['Update']; id: string };
      const { error } = await supabase.from('flashcards').update(data.updates).eq('id', data.id);
      if (error) throw error;
      break;
    }
    case 'reading_progress': {
      const { error } = await supabase.from('reading_progress').upsert(item.data as Database['public']['Tables']['reading_progress']['Insert'], { onConflict: 'email,syllabus_id' });
      if (error) throw error;
      break;
    }
    case 'novel_progress': {
      // Merge time deltas onto the server row so offline reading adds up
      // instead of overwriting newer online progress.
      const d = item.data as {
        email: string;
        novel_id: string;
        current_chapter_id: string;
        chapter_number: number;
        total_chapters: number;
        time_delta_seconds: number;
      };
      const { data: existing } = await supabase
        .from('user_novel_progress')
        .select('total_time_spent_seconds')
        .eq('email', d.email)
        .eq('novel_id', d.novel_id)
        .maybeSingle();
      const total = Math.max(d.total_chapters, 1);
      const { error } = await supabase.from('user_novel_progress').upsert(
        {
          email: d.email,
          novel_id: d.novel_id,
          current_chapter_id: d.current_chapter_id,
          progress_percent: Math.round((d.chapter_number / total) * 100),
          is_completed: d.chapter_number >= total,
          total_time_spent_seconds: (existing?.total_time_spent_seconds || 0) + Math.max(0, d.time_delta_seconds),
          last_read_at: new Date().toISOString(),
        },
        { onConflict: 'email,novel_id' }
      );
      if (error) throw error;
      break;
    }
  }
};

export interface OfflineDownloadResult {
  /** True only when every section downloaded cleanly. */
  success: boolean;
  /** True when at least part of the pack was cached but some section failed. */
  partial: boolean;
  error?: string;
  /** Subjects whose question set is now cached (or confirmed empty). */
  subjects: string[];
  /** Human-readable names of sections that failed and can be retried. */
  warnings: string[];
}

const QUESTION_TIMEOUT_MS = 25000;
const SECTION_TIMEOUT_MS = 20000;

/**
 * Download the offline study pack.
 *
 * A single failed request must never discard the whole pack: mobile networks
 * drop requests constantly and the old implementation aborted everything on
 * the first error, leaving users with nothing cached. Each section now runs
 * under its own timeout and is recorded as a warning if it fails, while the
 * rest still lands in IndexedDB. `offline_download_complete` is only written
 * when there were no warnings, so a partial pack is retried next time.
 */
export const downloadAllForOffline = async (
  userEmail: string,
  subjects: string[],
  onProgress?: (progress: { stage: string; percent: number }) => void
): Promise<OfflineDownloadResult> => {
  const warnings: string[] = [];
  const cachedSubjects: string[] = [];
  let cachedAnything = false;

  const fail = (section: string, error: unknown) => {
    warnings.push(section);
    errorLogger.error(error, { component: 'syncService', action: `download for offline: ${section}` });
  };

  try {
    // Stage 1: Download questions (per-subject caps — a single global
    // .limit() lets one subject eat the whole budget and starves the rest).
    onProgress?.({ stage: 'Downloading questions...', percent: 10 });

    const PER_SUBJECT_LIMIT = 500;
    for (let i = 0; i < subjects.length; i++) {
      const subject = subjects[i];
      try {
        const { data: subjectQuestions, error: subjectError } = await withTimeout(
          supabase
            .from('jamb_questions')
            .select('*')
            .eq('subject', subject as Database['public']['Enums']['jamb_subject'])
            .limit(PER_SUBJECT_LIMIT),
          QUESTION_TIMEOUT_MS,
          `questions:${subject}`
        );

        if (subjectError) throw subjectError;

        if (subjectQuestions && subjectQuestions.length > 0) {
          await saveQuestions(subjectQuestions);
          cachedAnything = true;
        }
        // Count the subject even when the bank is empty: otherwise the auto
        // seed would retry it forever on every launch.
        cachedSubjects.push(subject);
      } catch (error) {
        fail(`questions:${subject}`, error);
      }

      onProgress?.({
        stage: `Downloading questions (${i + 1}/${subjects.length})...`,
        percent: 10 + Math.round(((i + 1) / Math.max(subjects.length, 1)) * 30),
      });
    }

    if (cachedSubjects.length === 0) {
      // No questions at all: nothing useful to keep offline, report failure.
      return {
        success: false,
        partial: false,
        error: 'Could not download any questions. Check your connection and try again.',
        subjects: [],
        warnings,
      };
    }

    onProgress?.({ stage: 'Questions saved!', percent: 40 });

    // Stage 2: Download flashcards
    onProgress?.({ stage: 'Downloading flashcards...', percent: 50 });
    try {
      const { data: flashcards, error: flashcardsError } = await withTimeout(
        supabase.from('flashcards').select('*').eq('email', userEmail),
        SECTION_TIMEOUT_MS,
        'flashcards'
      );

      if (flashcardsError) throw flashcardsError;

      if (flashcards && flashcards.length > 0) {
        await saveFlashcards(flashcards);
        cachedAnything = true;
      }
      onProgress?.({ stage: 'Flashcards saved!', percent: 60 });
    } catch (error) {
      fail('flashcards', error);
    }

    // Stage 3: Download syllabus
    onProgress?.({ stage: 'Downloading syllabus...', percent: 65 });
    try {
      const { data: syllabus, error: syllabusError } = await withTimeout(
        supabase
          .from('jamb_syllabus')
          .select('*')
          .in('subject', subjects.map((s) => s.toLowerCase())),
        SECTION_TIMEOUT_MS,
        'syllabus'
      );

      if (syllabusError) throw syllabusError;

      if (syllabus && syllabus.length > 0) {
        await saveSyllabus(syllabus);
        cachedAnything = true;
      }
    } catch (error) {
      fail('syllabus', error);
    }

    onProgress?.({ stage: 'Downloading lessons...', percent: 72 });

    // Stage 4: Download lessons (full rows for the user's subjects — the
    // whole published corpus is small enough to keep offline).
    try {
      const { data: lessons, error: lessonsError } = await withTimeout(
        supabase
          .from('lessons')
          .select('*')
          .eq('status', 'published')
          .in('subject', subjects.map((s) => s.toLowerCase())),
        SECTION_TIMEOUT_MS,
        'lessons'
      );

      if (lessonsError) throw lessonsError;

      if (lessons && lessons.length > 0) {
        const cached: CachedLesson[] = (lessons as Array<Record<string, unknown>>).map((l) => ({
          id: String(l.id),
          subject: String((l as { subject?: unknown }).subject ?? ''),
          topic: String((l as { topic?: unknown }).topic ?? ''),
          subtopic: (l as { subtopic?: unknown }).subtopic as string | null ?? null,
          title: String((l as { title?: unknown }).title ?? ''),
          difficulty_level: ((l as { difficulty_level?: unknown }).difficulty_level as string | null) ?? null,
          estimated_minutes: ((l as { estimated_minutes?: unknown }).estimated_minutes as number | null) ?? null,
          status: ((l as { status?: unknown }).status as string | null) ?? null,
          row: l as unknown as CachedLesson['row'],
        }));
        await saveLessons(cached);
        cachedAnything = true;
      }
    } catch (error) {
      fail('lessons', error);
    }

    onProgress?.({ stage: 'Downloading books...', percent: 85 });

    // Stage 5: Download novels and chapters
    try {
      const { data: novels } = await withTimeout(
        supabase.from('novels').select('*'),
        SECTION_TIMEOUT_MS,
        'novels'
      );

      if (novels && novels.length > 0) {
        await saveNovels(novels);
        cachedAnything = true;

        try {
          const { data: chapters } = await withTimeout(
            supabase
              .from('novel_chapters')
              .select('id, novel_id, chapter_number, title, content, estimated_reading_time, word_count, likely_questions, created_at')
              .in('novel_id', novels.map((n) => n.id)),
            SECTION_TIMEOUT_MS,
            'novel chapters'
          );

          if (chapters && chapters.length > 0) {
            await saveNovelChapters(chapters);
          }
        } catch (error) {
          fail('novel chapters', error);
        }
      }
    } catch (error) {
      fail('books', error);
    }

    // Merge with anything cached by an earlier run so a partial refresh does
    // not forget subjects that are still available offline.
    const previous = (await getMetadata<string[] | null>('offline_subjects').catch(() => null)) ?? [];
    const mergedSubjects = Array.from(new Set([...previous, ...cachedSubjects]));

    await setMetadata('offline_subjects', mergedSubjects);

    const complete = warnings.length === 0;
    if (complete) {
      await setMetadata('offline_download_complete', Date.now());
      onProgress?.({ stage: 'All data downloaded!', percent: 100 });
    } else {
      onProgress?.({ stage: 'Saved what we could — will retry the rest', percent: 100 });
    }

    return {
      success: complete,
      partial: !complete && cachedAnything,
      error: complete
        ? undefined
        : `Some sections could not be downloaded (${warnings.join(', ')}). They will be retried next time you are online.`,
      subjects: cachedSubjects,
      warnings,
    };
  } catch (error) {
    // Only storage/IndexedDB level failures should land here.
    errorLogger.error(error, { component: 'syncService', action: 'download for offline' });
    return {
      success: false,
      partial: cachedAnything,
      error: error instanceof Error ? error.message : 'Failed to download data',
      subjects: cachedSubjects,
      warnings,
    };
  }
};

// Check if offline data needs refresh
export const shouldRefreshOfflineData = async (): Promise<boolean> => {
  const lastDownload = await getMetadata<number | null>('offline_download_complete');
  if (!lastDownload) return true;
  
  // Refresh if data is older than 7 days
  const refreshThreshold = 7 * 24 * 60 * 60 * 1000;
  return Date.now() - lastDownload > refreshThreshold;
};

// Get cached subjects
export const getCachedSubjects = async (): Promise<string[] | null> => {
  return getMetadata<string[] | null>('offline_subjects');
};

// Periodic sync management
let syncIntervalId: number | null = null;

/**
 * Start periodic sync
 * @param intervalMs - Interval in milliseconds (default 5 minutes)
 */
export const startPeriodicSync = (
  intervalMs: number = 5 * 60 * 1000,
  onSyncComplete?: (result: { synced: number; failed: number }) => void
): void => {
  // Clear existing interval if any
  if (syncIntervalId !== null) {
    clearInterval(syncIntervalId);
  }

  // Run initial sync immediately
  syncPendingItems().then(onSyncComplete).catch((e) => errorLogger.error(e, { component: 'syncService', action: 'initial sync' }));

  // Set up periodic sync
  syncIntervalId = window.setInterval(async () => {
    try {
      if (navigator.onLine) {
        const result = await syncPendingItems();
        onSyncComplete?.(result);
      }
    } catch (error) {
      errorLogger.error(error, { component: 'syncService', action: 'periodic sync' });
    }
  }, intervalMs);
};

/**
 * Stop periodic sync
 */
export const stopPeriodicSync = (): void => {
  if (syncIntervalId !== null) {
    clearInterval(syncIntervalId);
    syncIntervalId = null;
  }
};
