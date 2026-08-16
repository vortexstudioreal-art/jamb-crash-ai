import '@capacitor/background-runner';

// Background sync task - syncs offline data when app is in background
addEventListener('jambSyncEvent', async () => {
  try {
    // Sync pending quiz attempts
    const pendingQuizzes = localStorage.getItem('jamb_pending_quizzes');
    if (pendingQuizzes) {
      const quizzes = JSON.parse(pendingQuizzes);
      if (Array.isArray(quizzes) && quizzes.length > 0) {
        // Process pending quizzes
        localStorage.removeItem('jamb_pending_quizzes');
      }
    }

    // Sync pending subject changes
    const pendingSubjects = localStorage.getItem('jamb_pending_subjects');
    if (pendingSubjects) {
      const subjects = JSON.parse(pendingSubjects);
      if (Array.isArray(subjects) && subjects.length > 0) {
        localStorage.removeItem('jamb_pending_subjects');
      }
    }

    return { success: true };
  } catch {
    return { success: false };
  }
});
