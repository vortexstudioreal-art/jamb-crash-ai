import { supabase } from '@/integrations/supabase/client';
import { errorLogger } from '@/services/errorLogger';
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
  getMetadata,
  setMetadata,
  type SyncItem 
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
      const { error } = await supabase.from('quiz_attempts').insert(item.data as Database['public']['Tables']['quiz_attempts']['Insert']);
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
  }
};

// Download all data for offline use
export const downloadAllForOffline = async (
  userEmail: string,
  subjects: string[],
  onProgress?: (progress: { stage: string; percent: number }) => void
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Stage 1: Download questions (per-subject caps — a single global
    // .limit() lets one subject eat the whole budget and starves the rest).
    onProgress?.({ stage: 'Downloading questions...', percent: 10 });

    const PER_SUBJECT_LIMIT = 500;
    for (const subject of subjects) {
      const { data: subjectQuestions, error: subjectError } = await supabase
        .from('jamb_questions')
        .select('*')
        .eq('subject', subject as Database['public']['Enums']['jamb_subject'])
        .limit(PER_SUBJECT_LIMIT);

      if (subjectError) throw subjectError;

      if (subjectQuestions && subjectQuestions.length > 0) {
        await saveQuestions(subjectQuestions);
      }
    }

    onProgress?.({ stage: 'Questions saved!', percent: 40 });

    // Stage 2: Download flashcards
    onProgress?.({ stage: 'Downloading flashcards...', percent: 50 });
    
    const { data: flashcards, error: flashcardsError } = await supabase
      .from('flashcards')
      .select('*')
      .eq('email', userEmail);

    if (flashcardsError) throw flashcardsError;
    
    if (flashcards && flashcards.length > 0) {
      await saveFlashcards(flashcards);
    }

    onProgress?.({ stage: 'Flashcards saved!', percent: 70 });

    // Stage 3: Download syllabus
    onProgress?.({ stage: 'Downloading syllabus...', percent: 80 });
    
    const { data: syllabus, error: syllabusError } = await supabase
      .from('jamb_syllabus')
      .select('*')
      .in('subject', subjects.map(s => s.toLowerCase()));

    if (syllabusError) throw syllabusError;
    
    if (syllabus && syllabus.length > 0) {
      await saveSyllabus(syllabus);
    }

    onProgress?.({ stage: 'Downloading novels...', percent: 85 });

    // Stage 4: Download novels and chapters
    const { data: novels } = await supabase
      .from('novels')
      .select('*');

    if (novels && novels.length > 0) {
      await saveNovels(novels);

      const { data: chapters } = await supabase
        .from('novel_chapters')
        .select('id, novel_id, chapter_number, title, content, estimated_reading_time, word_count, likely_questions, created_at')
        .in('novel_id', novels.map(n => n.id));

      if (chapters && chapters.length > 0) {
        await saveNovelChapters(chapters);
      }
    }

    onProgress?.({ stage: 'All data downloaded!', percent: 100 });
    
    await setMetadata('offline_download_complete', Date.now());
    await setMetadata('offline_subjects', subjects);

    return { success: true };
  } catch (error) {
    errorLogger.error(error, { component: 'syncService', action: 'download for offline' });
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to download data' 
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
