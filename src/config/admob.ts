// AdMob Configuration for Mobile App
// ALL AdMob IDs are centralized here — edit only this file when IDs change.

export const ADMOB_CONFIG = {
  appId: 'ca-app-pub-3175040135445213~2811266017',

  // Rewarded Video Ad Unit IDs by feature
  adUnits: {
    pdfUpload: 'ca-app-pub-3175040135445213/5245857668',
    aiExplanation: 'ca-app-pub-3175040135445213/8993530989',
    flashcardGeneration: 'ca-app-pub-3175040135445213/2303821944',
    extraQuizQuestions: 'ca-app-pub-3175040135445213/9297243384',
  },

  bannerAdUnit: 'ca-app-pub-3175040135445213/8933327015',

  // Test ad unit IDs for development only
  testAdUnits: {
    rewardedVideo: 'ca-app-pub-3940256099942544/5224354917',
    banner: 'ca-app-pub-3940256099942544/6300978111',
  },
};

// Map feature types to their rewarded ad unit IDs
export const getAdUnitForFeature = (featureType: string): string => {
  const mapping: Record<string, string> = {
    pdf_upload: ADMOB_CONFIG.adUnits.pdfUpload,
    ai_explanation: ADMOB_CONFIG.adUnits.aiExplanation,
    flashcard: ADMOB_CONFIG.adUnits.flashcardGeneration,
    study_plan: ADMOB_CONFIG.adUnits.aiExplanation,
    subject_change: ADMOB_CONFIG.adUnits.pdfUpload,
    quick_quiz: ADMOB_CONFIG.adUnits.extraQuizQuestions,
  };

  const adUnit = mapping[featureType];

  return adUnit || ADMOB_CONFIG.testAdUnits.rewardedVideo;
};

// Get banner ad unit (single ID for all placements)
export const getBannerAdUnit = (): string => {
  return ADMOB_CONFIG.bannerAdUnit || ADMOB_CONFIG.testAdUnits.banner;
};

// Check if running in a Capacitor/mobile environment
export const isMobileApp = (): boolean => {
  return typeof (window as unknown as { Capacitor?: unknown }).Capacitor !== 'undefined';
};
