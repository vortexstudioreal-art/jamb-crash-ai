import { supabase } from '@/integrations/supabase/client';
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

const MAX_RETRIES = 3;

// Sync pending items when back online
export const syncPendingItems = async (): Promise<{ synced: number; failed: number }> => {
  const queue = await getSyncQueue();
  let synced = 0;
  let failed = 0;

  for (const item of queue) {
    try {
      await processSyncItem(item);
      await removeSyncItem(item.id);
      synced++;
    } catch (error) {
      console.error(`Failed to sync item ${item.id}:`, error);
      
      if (item.retries >= MAX_RETRIES) {
        await removeSyncItem(item.id);
        failed++;
      } else {
        await updateSyncItemRetries(item.id, item.retries + 1);
      }
    }
  }

  return { synced, failed };
};

const processSyncItem = async (item: SyncItem): Promise<void> => {
  switch (item.type) {
    case 'quiz_attempt':
      await supabase.from('quiz_attempts').insert(item.data as Database['public']['Tables']['quiz_attempts']['Insert']);
      break;
    case 'flashcard_update': {
      const data = item.data as { updates: Database['public']['Tables']['flashcards']['Update']; id: string };
      await supabase.from('flashcards').update(data.updates).eq('id', data.id);
      break;
    }
    case 'reading_progress':
      await supabase.from('reading_progress').upsert(item.data as Database['public']['Tables']['reading_progress']['Insert'], { onConflict: 'email,syllabus_id' });
      break;
  }
};

// Download all data for offline use
export const downloadAllForOffline = async (
  userEmail: string,
  subjects: string[],
  onProgress?: (progress: { stage: string; percent: number }) => void
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Stage 1: Download questions
    onProgress?.({ stage: 'Downloading questions...', percent: 10 });
    
    const { data: questions, error: questionsError } = await supabase
      .from('jamb_questions')
      .select('*')
      .in('subject', subjects as Database['public']['Enums']['jamb_subject'][])
      .limit(2000);

    if (questionsError) throw questionsError;
    
    if (questions && questions.length > 0) {
      await saveQuestions(questions);
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
        .select('id, novel_id, chapter_number, title, content, estimated_reading_time, word_count, likely_questions')
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
    console.error('Error downloading for offline:', error);
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
  syncPendingItems().then(onSyncComplete).catch(console.error);

  // Set up periodic sync
  syncIntervalId = window.setInterval(async () => {
    try {
      if (navigator.onLine) {
        const result = await syncPendingItems();
        onSyncComplete?.(result);
      }
    } catch (error) {
      console.error('Periodic sync failed:', error);
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
