// AdMob Configuration for Mobile App
// These ad unit IDs are for rewarded video ads in the mobile version

export const ADMOB_CONFIG = {
  appId: 'ca-app-pub-3175040135445213~XXXXXXXXXX', // Your AdMob App ID (update this)
  
  // Rewarded Video Ad Unit IDs by feature
  adUnits: {
    pdfUpload: 'ca-app-pub-3175040135445213/5245857668',      // 1+ upload
    aiExplanation: 'ca-app-pub-3175040135445213/8993530989',  // AI explanation
    flashcardGeneration: 'ca-app-pub-3175040135445213/2303821944', // flash card generation
  },
  
  // Banner Ad Unit IDs by placement
  bannerAdUnits: {
    dashboardFooter: 'ca-app-pub-3175040135445213/XXXXXXXXXX', // Update with your banner ad unit
    quizFooter: 'ca-app-pub-3175040135445213/XXXXXXXXXX',
    syllabusFooter: 'ca-app-pub-3175040135445213/XXXXXXXXXX',
  },
  
  // Test ad unit IDs for development (use these during testing)
  testAdUnits: {
    rewardedVideo: 'ca-app-pub-3940256099942544/5224354917', // Google's test rewarded ad
    banner: 'ca-app-pub-3940256099942544/6300978111', // Google's test banner ad
  },
};

// Map feature types to their ad unit IDs
export const getAdUnitForFeature = (featureType: string): string => {
  const mapping: Record<string, string> = {
    pdf_upload: ADMOB_CONFIG.adUnits.pdfUpload,
    ai_explanation: ADMOB_CONFIG.adUnits.aiExplanation,
    flashcard: ADMOB_CONFIG.adUnits.flashcardGeneration,
    study_plan: ADMOB_CONFIG.adUnits.aiExplanation, // Reuse AI explanation ad
    subject_change: ADMOB_CONFIG.adUnits.pdfUpload, // Reuse upload ad
    quick_quiz: ADMOB_CONFIG.adUnits.flashcardGeneration, // Reuse flashcard ad
  };
  
  return mapping[featureType] || ADMOB_CONFIG.testAdUnits.rewardedVideo;
};

// Get banner ad unit for placement
export const getBannerAdUnit = (placement: string): string => {
  const mapping: Record<string, string> = {
    'dashboard-footer': ADMOB_CONFIG.bannerAdUnits.dashboardFooter,
    'quiz-footer': ADMOB_CONFIG.bannerAdUnits.quizFooter,
    'syllabus-footer': ADMOB_CONFIG.bannerAdUnits.syllabusFooter,
  };
  
  return mapping[placement] || ADMOB_CONFIG.testAdUnits.banner;
};

// Check if running in a Capacitor/mobile environment
export const isMobileApp = (): boolean => {
  return typeof (window as any).Capacitor !== 'undefined';
};
