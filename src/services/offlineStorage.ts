import { openDB, DBSchema, IDBPDatabase } from 'idb';
import type { Json } from '@/integrations/supabase/types';

interface Question {
  id: string;
  subject: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  explanation?: string | null;
  year?: number | null;
  image_url?: string | null;
  topics?: string[] | null;
  created_at?: string | null;
}

interface Flashcard {
  id: string;
  email: string;
  front: string;
  back: string;
  subject: string;
  topic?: string | null;
  mastery_level?: string | null;
  times_reviewed?: number | null;
  next_review_at?: string | null;
  difficulty?: string | null;
  source_id?: string | null;
  source_type?: string | null;
  times_correct?: number | null;
  last_reviewed_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

interface SyllabusItem {
  id: string;
  subject: string;
  topic: string;
  subtopic: string | null;
  objectives: string[] | null;
  recommended_content: string | null;
  difficulty_level: string | null;
  estimated_reading_time: number | null;
  order_index: number | null;
  image_url?: string | null;
  reference_materials?: Json | null;
  created_at?: string | null;
  updated_at?: string | null;
}

interface SyncItem {
  id: string;
  type: 'quiz_attempt' | 'flashcard_update' | 'reading_progress';
  data: unknown;
  timestamp: number;
  retries: number;
}

interface CachedNovel {
  id: string;
  title: string;
  author: string;
  description: string | null;
  cover_image_url: string | null;
  category: string;
  total_chapters: number | null;
  year: number | null;
  is_premium: boolean | null;
  difficulty_level: string | null;
  subject: string | null;
  created_at: string | null;
  download_url: string | null;
  full_book_pdf_path: string | null;
  full_book_pdf_url: string | null;
  updated_at: string | null;
}

interface CachedChapter {
  id: string;
  novel_id: string;
  chapter_number: number;
  title: string;
  content: string;
  estimated_reading_time: number | null;
  word_count: number | null;
  likely_questions: Json | null;
  created_at: string | null;
}

interface JambOfflineDB extends DBSchema {
  questions: {
    key: string;
    value: Question;
    indexes: { 'by-subject': string };
  };
  flashcards: {
    key: string;
    value: Flashcard;
    indexes: { 'by-email': string; 'by-subject': string };
  };
  syllabus: {
    key: string;
    value: SyllabusItem;
    indexes: { 'by-subject': string };
  };
  syncQueue: {
    key: string;
    value: SyncItem;
    indexes: { 'by-type': string };
  };
  metadata: {
    key: string;
    value: { key: string; value: unknown; updatedAt: number };
  };
  novels: {
    key: string;
    value: CachedNovel;
    indexes: { 'by-category': string };
  };
  novelChapters: {
    key: string;
    value: CachedChapter;
    indexes: { 'by-novel': string };
  };
}

const DB_NAME = 'jamb-offline-db';
const DB_VERSION = 2;

let dbPromise: Promise<IDBPDatabase<JambOfflineDB>> | null = null;

const getDB = async (): Promise<IDBPDatabase<JambOfflineDB>> => {
  if (!dbPromise) {
    dbPromise = openDB<JambOfflineDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Questions store
        if (!db.objectStoreNames.contains('questions')) {
          const questionsStore = db.createObjectStore('questions', { keyPath: 'id' });
          questionsStore.createIndex('by-subject', 'subject');
        }

        // Flashcards store
        if (!db.objectStoreNames.contains('flashcards')) {
          const flashcardsStore = db.createObjectStore('flashcards', { keyPath: 'id' });
          flashcardsStore.createIndex('by-email', 'email');
          flashcardsStore.createIndex('by-subject', 'subject');
        }

        // Syllabus store
        if (!db.objectStoreNames.contains('syllabus')) {
          const syllabusStore = db.createObjectStore('syllabus', { keyPath: 'id' });
          syllabusStore.createIndex('by-subject', 'subject');
        }

        // Sync queue store
        if (!db.objectStoreNames.contains('syncQueue')) {
          const syncStore = db.createObjectStore('syncQueue', { keyPath: 'id' });
          syncStore.createIndex('by-type', 'type');
        }

        // Metadata store
        if (!db.objectStoreNames.contains('metadata')) {
          db.createObjectStore('metadata', { keyPath: 'key' });
        }

        // Novels store
        if (!db.objectStoreNames.contains('novels')) {
          const novelsStore = db.createObjectStore('novels', { keyPath: 'id' });
          novelsStore.createIndex('by-category', 'category');
        }

        // Novel chapters store
        if (!db.objectStoreNames.contains('novelChapters')) {
          const chaptersStore = db.createObjectStore('novelChapters', { keyPath: 'id' });
          chaptersStore.createIndex('by-novel', 'novel_id');
        }
      },
    });
  }
  return dbPromise;
};

// Questions
export const saveQuestions = async (questions: Question[]): Promise<void> => {
  const db = await getDB();
  const tx = db.transaction('questions', 'readwrite');
  await Promise.all([
    ...questions.map(q => tx.store.put(q)),
    tx.done,
  ]);
  await setMetadata('questions_last_sync', Date.now());
};

export const getQuestions = async (subjects?: string[]): Promise<Question[]> => {
  const db = await getDB();
  const allQuestions = await db.getAll('questions');
  
  if (subjects && subjects.length > 0) {
    return allQuestions.filter(q => subjects.includes(q.subject));
  }
  return allQuestions;
};

export const getQuestionsBySubject = async (subject: string): Promise<Question[]> => {
  const db = await getDB();
  return db.getAllFromIndex('questions', 'by-subject', subject);
};

export const getQuestionsCount = async (): Promise<number> => {
  const db = await getDB();
  return db.count('questions');
};

// Flashcards
export const saveFlashcards = async (flashcards: Flashcard[]): Promise<void> => {
  const db = await getDB();
  const tx = db.transaction('flashcards', 'readwrite');
  await Promise.all([
    ...flashcards.map(f => tx.store.put(f)),
    tx.done,
  ]);
  await setMetadata('flashcards_last_sync', Date.now());
};

export const getFlashcards = async (email?: string): Promise<Flashcard[]> => {
  const db = await getDB();
  if (email) {
    return db.getAllFromIndex('flashcards', 'by-email', email);
  }
  return db.getAll('flashcards');
};

export const getFlashcardsCount = async (): Promise<number> => {
  const db = await getDB();
  return db.count('flashcards');
};

export const updateFlashcard = async (flashcard: Flashcard): Promise<void> => {
  const db = await getDB();
  await db.put('flashcards', flashcard);
};

// Syllabus
export const saveSyllabus = async (syllabus: SyllabusItem[]): Promise<void> => {
  const db = await getDB();
  const tx = db.transaction('syllabus', 'readwrite');
  await Promise.all([
    ...syllabus.map(s => tx.store.put(s)),
    tx.done,
  ]);
  await setMetadata('syllabus_last_sync', Date.now());
};

export const getSyllabus = async (subjects?: string[]): Promise<SyllabusItem[]> => {
  const db = await getDB();
  const allSyllabus = await db.getAll('syllabus');
  
  if (subjects && subjects.length > 0) {
    return allSyllabus.filter(s => subjects.includes(s.subject));
  }
  return allSyllabus;
};

export const getSyllabusCount = async (): Promise<number> => {
  const db = await getDB();
  return db.count('syllabus');
};

// Novels
export const saveNovels = async (novels: CachedNovel[]): Promise<void> => {
  const db = await getDB();
  const tx = db.transaction('novels', 'readwrite');
  await Promise.all([
    ...novels.map(n => tx.store.put(n)),
    tx.done,
  ]);
  await setMetadata('novels_last_sync', Date.now());
};

export const getCachedNovels = async (): Promise<CachedNovel[]> => {
  const db = await getDB();
  return db.getAll('novels');
};

export const getCachedNovel = async (id: string): Promise<CachedNovel | undefined> => {
  const db = await getDB();
  return db.get('novels', id);
};

export const getNovelsCount = async (): Promise<number> => {
  const db = await getDB();
  return db.count('novels');
};

// Novel Chapters
export const saveNovelChapters = async (chapters: CachedChapter[]): Promise<void> => {
  const db = await getDB();
  const tx = db.transaction('novelChapters', 'readwrite');
  await Promise.all([
    ...chapters.map(ch => tx.store.put(ch)),
    tx.done,
  ]);
};

export const getCachedChaptersByNovel = async (novelId: string): Promise<CachedChapter[]> => {
  const db = await getDB();
  return db.getAllFromIndex('novelChapters', 'by-novel', novelId);
};

export const getCachedChapter = async (chapterId: string): Promise<CachedChapter | undefined> => {
  const db = await getDB();
  return db.get('novelChapters', chapterId);
};

export const getNovelChaptersCount = async (): Promise<number> => {
  const db = await getDB();
  return db.count('novelChapters');
};

// Sync Queue
export const addToSyncQueue = async (type: SyncItem['type'], data: unknown): Promise<void> => {
  const db = await getDB();
  const item: SyncItem = {
    id: `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type,
    data,
    timestamp: Date.now(),
    retries: 0,
  };
  await db.add('syncQueue', item);
};

export const getSyncQueue = async (): Promise<SyncItem[]> => {
  const db = await getDB();
  return db.getAll('syncQueue');
};

export const removeSyncItem = async (id: string): Promise<void> => {
  const db = await getDB();
  await db.delete('syncQueue', id);
};

export const updateSyncItemRetries = async (id: string, retries: number): Promise<void> => {
  const db = await getDB();
  const item = await db.get('syncQueue', id);
  if (item) {
    item.retries = retries;
    await db.put('syncQueue', item);
  }
};

export const getSyncQueueCount = async (): Promise<number> => {
  const db = await getDB();
  return db.count('syncQueue');
};

// Metadata
export const setMetadata = async (key: string, value: unknown): Promise<void> => {
  const db = await getDB();
  await db.put('metadata', { key, value, updatedAt: Date.now() });
};

export const getMetadata = async <T = unknown>(key: string): Promise<T> => {
  const db = await getDB();
  const item = await db.get('metadata', key);
  // Typed wrapper around IndexedDB: the caller supplies T via the generic,
  // so the stored value is returned as the requested type.
  return item?.value as T;
};

// Clear all data
export const clearAllData = async (): Promise<void> => {
  const db = await getDB();
  await Promise.all([
    db.clear('questions'),
    db.clear('flashcards'),
    db.clear('syllabus'),
    db.clear('syncQueue'),
    db.clear('metadata'),
    db.clear('novels'),
    db.clear('novelChapters'),
  ]);
};

// Get storage info
export const getStorageInfo = async (): Promise<{
  questionsCount: number;
  flashcardsCount: number;
  syllabusCount: number;
  pendingSyncCount: number;
  novelsCount: number;
  novelChaptersCount: number;
  lastSync: number | null;
}> => {
  const [questionsCount, flashcardsCount, syllabusCount, pendingSyncCount, novelsCount, novelChaptersCount, lastSync] = await Promise.all([
    getQuestionsCount(),
    getFlashcardsCount(),
    getSyllabusCount(),
    getSyncQueueCount(),
    getNovelsCount(),
    getNovelChaptersCount(),
    getMetadata<number | null>('questions_last_sync'),
  ]);

  return {
    questionsCount,
    flashcardsCount,
    syllabusCount,
    pendingSyncCount,
    novelsCount,
    novelChaptersCount,
    lastSync,
  };
};

// Check if data is stale (older than 24 hours)
export const isDataStale = async (): Promise<boolean> => {
  const lastSync = await getMetadata<number | null>('questions_last_sync');
  if (!lastSync) return true;
  
  const staleThreshold = 24 * 60 * 60 * 1000; // 24 hours
  return Date.now() - lastSync > staleThreshold;
};

export type { Question, Flashcard, SyllabusItem, SyncItem, CachedNovel, CachedChapter };
