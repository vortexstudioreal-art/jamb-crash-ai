import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { isMobileApp, ADMOB_CONFIG } from '@/config/admob';
import { useAdAnalytics } from '@/hooks/useAdAnalytics';
import { useAuth } from '@/contexts/AuthContext';

interface BannerAdProps {
  placement: 'dashboard-footer' | 'quiz-footer' | 'syllabus-footer';
  className?: string;
}

// Banner Ad unit IDs - you would add these to your AdMob config
const BANNER_AD_UNITS = {
  'dashboard-footer': 'ca-app-pub-3175040135445213/XXXXXXXXXX', // Add your banner ad unit
  'quiz-footer': 'ca-app-pub-3175040135445213/XXXXXXXXXX',
  'syllabus-footer': 'ca-app-pub-3175040135445213/XXXXXXXXXX',
};

const PROMO_ADS = [
  {
    id: 1,
    title: "Upgrade to Pro!",
    description: "Get unlimited quizzes, AI explanations & more",
    cta: "Learn More",
    gradient: "from-primary/90 to-green-600/90",
    internal: true,
  },
  {
    id: 2,
    title: "📚 Study Smarter",
    description: "Pro users score 40% higher on average",
    cta: "Go Pro",
    gradient: "from-purple-600/90 to-primary/90",
    internal: true,
  },
  {
    id: 3,
    title: "🎯 Premium Features",
    description: "WhatsApp reminders, score prediction & more",
    cta: "Upgrade",
    gradient: "from-orange-500/90 to-red-500/90",
    internal: true,
  },
];

export const BannerAd = ({ placement, className = '' }: BannerAdProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const [currentPromo, setCurrentPromo] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const { user } = useAuth();
  const { trackAdStarted, trackAdCompleted } = useAdAnalytics();
  const userEmail = user?.email || null;

  useEffect(() => {
    setIsMobile(isMobileApp());
  }, []);

  // Rotate promos every 10 seconds for web
  useEffect(() => {
    if (isMobile) return;
    
    const interval = setInterval(() => {
      setCurrentPromo(prev => (prev + 1) % PROMO_ADS.length);
    }, 10000);
    
    return () => clearInterval(interval);
  }, [isMobile]);

  // Load AdMob banner for mobile
  useEffect(() => {
    if (!isMobile || !isVisible) return;

    const loadBannerAd = async () => {
      try {
        const { AdMob, BannerAdSize, BannerAdPosition } = await import('@capacitor-community/admob');
        
        await AdMob.initialize({
          initializeForTesting: import.meta.env.DEV,
        });

        trackAdStarted(userEmail, `banner_${placement}`, 'admob');

        await AdMob.showBanner({
          adId: BANNER_AD_UNITS[placement] || ADMOB_CONFIG.testAdUnits.rewardedVideo,
          adSize: BannerAdSize.ADAPTIVE_BANNER,
          position: BannerAdPosition.BOTTOM_CENTER,
          margin: 0,
        });

        trackAdCompleted(userEmail, `banner_${placement}`, 'admob', 0);
      } catch (error) {
        console.error('Banner ad error:', error);
        // Fallback to promo ad shown
      }
    };

    loadBannerAd();

    return () => {
      // Clean up banner on unmount
      import('@capacitor-community/admob').then(({ AdMob }) => {
        AdMob.removeBanner().catch(() => {});
      });
    };
  }, [isMobile, isVisible, placement, userEmail, trackAdStarted, trackAdCompleted]);

  const handleClick = () => {
    const promo = PROMO_ADS[currentPromo];
    trackAdStarted(userEmail, `promo_${placement}`, 'simulation');
    
    if (promo.internal) {
      // Scroll to pricing
      const pricingSection = document.getElementById('pricing');
      if (pricingSection) {
        pricingSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
    
    trackAdCompleted(userEmail, `promo_${placement}`, 'simulation', 1);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    // Auto-show again after 5 minutes
    setTimeout(() => setIsVisible(true), 5 * 60 * 1000);
  };

  if (!isVisible) return null;

  // On mobile, the AdMob SDK handles banner display
  // We just need a placeholder for spacing
  if (isMobile) {
    return <div className={`h-16 ${className}`} />;
  }

  // Web promo banner
  const promo = PROMO_ADS[currentPromo];

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={promo.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={`relative ${className}`}
      >
        <div 
          className={`relative bg-gradient-to-r ${promo.gradient} rounded-xl p-4 cursor-pointer group overflow-hidden`}
          onClick={handleClick}
        >
          {/* Background decoration */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIi8+PC9zdmc+')] opacity-50" />
          
          {/* Dismiss button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-1 right-1 text-white/70 hover:text-white hover:bg-white/10 h-6 w-6 z-10"
            onClick={(e) => {
              e.stopPropagation();
              handleDismiss();
            }}
          >
            <X className="w-3 h-3" />
          </Button>

          <div className="relative flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-sm md:text-base truncate">
                {promo.title}
              </p>
              <p className="text-white/80 text-xs md:text-sm truncate">
                {promo.description}
              </p>
            </div>
            <Button
              size="sm"
              variant="secondary"
              className="shrink-0 bg-white/20 hover:bg-white/30 text-white border-white/20 text-xs"
            >
              {promo.cta}
              <ExternalLink className="w-3 h-3 ml-1" />
            </Button>
          </div>

          {/* Progress dots for carousel */}
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-1">
            {PROMO_ADS.map((_, idx) => (
              <div
                key={idx}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  idx === currentPromo ? 'bg-white' : 'bg-white/40'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Ad label */}
        <p className="text-[10px] text-muted-foreground text-center mt-1">
          Sponsored
        </p>
      </motion.div>
    </AnimatePresence>
  );
};
