import '@capacitor/background-runner';
import { supabase } from './integrations/supabase/client';

interface PendingQuiz {
  id: string;
  subject: string;
  answers: Record<string, string>;
  score: number;
  total: number;
  completedAt: string;
}

interface PendingSubject {
  subject: string;
  addedAt: string;
}

// Background sync task - syncs offline data when app is in background
addEventListener('jambSyncEvent', async () => {
  try {
    const results = { quizzes: 0, subjects: 0, errors: 0 };

    // Sync pending quiz attempts
    const pendingQuizzes = localStorage.getItem('jamb_pending_quizzes');
    if (pendingQuizzes) {
      const quizzes: PendingQuiz[] = JSON.parse(pendingQuizzes);
      if (Array.isArray(quizzes) && quizzes.length > 0) {
        for (const quiz of quizzes) {
          try {
            const { error } = await supabase.from('quiz_history').upsert({
              id: quiz.id,
              user_id: (await supabase.auth.getUser()).data.user?.id || '',
              subject: quiz.subject,
              answers: quiz.answers,
              score: quiz.score,
              total: quiz.total,
              completed_at: quiz.completedAt,
              synced: true,
            }, { onConflict: 'id' });

            if (!error) results.quizzes++;
            else results.errors++;
          } catch {
            results.errors++;
          }
        }
        localStorage.removeItem('jamb_pending_quizzes');
      }
    }

    // Sync pending subject additions
    const pendingSubjects = localStorage.getItem('jamb_pending_subjects');
    if (pendingSubjects) {
      const subjects: PendingSubject[] = JSON.parse(pendingSubjects);
      if (Array.isArray(subjects) && subjects.length > 0) {
        const userId = (await supabase.auth.getUser()).data.user?.id;
        if (userId) {
          for (const subj of subjects) {
            try {
              const { error } = await supabase.from('user_subjects').upsert({
                user_id: userId,
                subject: subj.subject,
                added_at: subj.addedAt,
              }, { onConflict: 'user_id,subject' });

              if (!error) results.subjects++;
              else results.errors++;
            } catch {
              results.errors++;
            }
          }
        }
        localStorage.removeItem('jamb_pending_subjects');
      }
    }

    return { success: results.errors === 0, synced: results };
  } catch {
    return { success: false };
  }
});
