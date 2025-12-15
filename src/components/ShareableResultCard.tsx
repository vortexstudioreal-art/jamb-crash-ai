import { useRef } from 'react';
import { motion } from 'framer-motion';
import { Share2, Download, X, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface ShareableResultCardProps {
  predictedMin: number;
  predictedMax: number;
  onClose: () => void;
}

export const ShareableResultCard = ({ predictedMin, predictedMax, onClose }: ShareableResultCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleShare = async () => {
    const shareText = `🎯 I just got my JAMB score prediction: ${predictedMin}–${predictedMax}!\n\nPreparing with Jamb Crash AI 🚀\n\n#JAMB2025 #UTMEPrep #JAMBCrash`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My JAMB Score Prediction',
          text: shareText,
        });
      } catch (err) {
        // User cancelled or error
        copyToClipboard(shareText);
      }
    } else {
      copyToClipboard(shareText);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard! Share on WhatsApp or social media');
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(`🎯 I just got my JAMB score prediction: ${predictedMin}–${predictedMax}!\n\nPreparing with Jamb Crash AI 🚀\n\n#JAMB2025 #UTMEPrep`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-card rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
      >
        <div className="flex justify-end p-2">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Shareable Card */}
        <div
          ref={cardRef}
          className="mx-4 mb-4 rounded-xl overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #006B3F 0%, #00A859 50%, #FFD700 100%)',
          }}
        >
          <div className="p-6 text-center text-white">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            
            <h3 className="text-lg font-medium opacity-90 mb-2">My JAMB Score Prediction</h3>
            
            <div className="bg-white/20 rounded-xl p-4 mb-4">
              <span className="text-4xl font-bold">{predictedMin}</span>
              <span className="text-2xl mx-2">–</span>
              <span className="text-4xl font-bold">{predictedMax}</span>
            </div>

            <p className="text-sm opacity-80 mb-2">Preparing with</p>
            <p className="text-xl font-bold">Jamb Crash AI 🚀</p>
            
            <div className="mt-4 pt-4 border-t border-white/20">
              <p className="text-xs opacity-70">#JAMB2025 #UTMEPrep</p>
            </div>
          </div>
        </div>

        {/* Share Buttons */}
        <div className="p-4 space-y-3">
          <Button
            onClick={handleWhatsAppShare}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share on WhatsApp
          </Button>
          
          <Button
            onClick={handleShare}
            variant="outline"
            className="w-full"
          >
            <Download className="w-4 h-4 mr-2" />
            Copy & Share Anywhere
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ShareableResultCard;
