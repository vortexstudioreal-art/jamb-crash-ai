import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Target, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

interface ScorePredictorProps {
  userEmail: string;
  targetScore?: number;
  weakSubject?: string;
  onShowResultCard: (min: number, max: number) => void;
}

export const ScorePredictor = ({ userEmail, targetScore = 300, weakSubject, onShowResultCard }: ScorePredictorProps) => {
  const [predictedMin, setPredictedMin] = useState<number | null>(null);
  const [predictedMax, setPredictedMax] = useState<number | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [progress, setProgress] = useState(0);

  const calculatePrediction = async () => {
    setIsCalculating(true);
    
    // Simulate calculation with progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 150));
      setProgress(i);
    }

    // Calculate predicted score based on target and factors
    const baseScore = targetScore;
    const variance = Math.floor(Math.random() * 20) + 10; // 10-30 variance
    const boost = weakSubject ? 5 : 15; // Better prediction if no weak subject identified
    
    const min = Math.max(180, baseScore - variance);
    const max = Math.min(400, baseScore + variance + boost);
    
    setPredictedMin(min);
    setPredictedMax(max);

    // Save to database
    try {
      await supabase
        .from('user_progress')
        .upsert({
          email: userEmail,
          target_score: targetScore,
          weak_subject: weakSubject,
          predicted_score_min: min,
          predicted_score_max: max,
          plan_completed: true,
        }, { onConflict: 'email' });
    } catch (err) {
      console.error('Error saving prediction:', err);
    }

    setIsCalculating(false);
  };

  if (predictedMin && predictedMax) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="card-elevated p-8 text-center"
      >
        <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6">
          <Award className="w-10 h-10 text-primary" />
        </div>
        
        <h2 className="text-2xl font-bold text-foreground mb-2">Your Predicted Score</h2>
        <p className="text-muted-foreground mb-6">Based on your study plan completion</p>
        
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: 'spring' }}
          className="bg-gradient-to-r from-primary/20 to-accent/20 rounded-2xl p-6 mb-6"
        >
          <span className="text-5xl font-bold text-primary">{predictedMin}</span>
          <span className="text-3xl text-muted-foreground mx-2">–</span>
          <span className="text-5xl font-bold text-primary">{predictedMax}</span>
        </motion.div>

        <p className="text-sm text-muted-foreground mb-6">
          Keep studying consistently to hit the upper range!
        </p>

        <Button
          onClick={() => onShowResultCard(predictedMin, predictedMax)}
          className="gradient-primary text-primary-foreground"
        >
          Share Your Prediction
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-elevated p-6"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
          <TrendingUp className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">Score Predictor</h3>
          <p className="text-sm text-muted-foreground">See your likely JAMB score</p>
        </div>
      </div>

      {isCalculating ? (
        <div className="space-y-4">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-center text-muted-foreground">
            Analyzing your study pattern...
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Target className="w-4 h-4" />
            <span>Target: {targetScore} points</span>
          </div>
          <Button onClick={calculatePrediction} className="w-full gradient-primary text-primary-foreground">
            Calculate My Predicted Score
          </Button>
        </div>
      )}
    </motion.div>
  );
};
