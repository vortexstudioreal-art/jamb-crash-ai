import { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, BookOpen, Calculator, Atom, FlaskConical, Leaf, BookText, Building2, TrendingUp, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TimedQuiz } from './TimedQuiz';
import { QuizResults, type QuizResultsProps } from './QuizResults';

interface DemoQuizFlowProps {
  onComplete: () => void;
  onUpgrade: () => void;
}

const DEMO_SUBJECTS = [
  { id: 'english', name: 'English', icon: BookText },
  { id: 'mathematics', name: 'Mathematics', icon: Calculator },
  { id: 'physics', name: 'Physics', icon: Atom },
  { id: 'chemistry', name: 'Chemistry', icon: FlaskConical },
  { id: 'biology', name: 'Biology', icon: Leaf },
  { id: 'literature', name: 'Literature', icon: BookOpen },
  { id: 'government', name: 'Government', icon: Building2 },
  { id: 'economics', name: 'Economics', icon: TrendingUp },
];

type FlowStep = 'select' | 'quiz' | 'results';

export const DemoQuizFlow = ({ onComplete, onUpgrade }: DemoQuizFlowProps) => {
  const [step, setStep] = useState<FlowStep>('select');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [quizResults, setQuizResults] = useState<QuizResultsProps['results'] | null>(null);

  const handleStartQuiz = () => {
    if (selectedSubject) {
      setStep('quiz');
    }
  };

  const handleQuizComplete = (results: QuizResultsProps['results']) => {
    setQuizResults(results);
    setStep('results');
  };

  if (step === 'quiz') {
    return (
      <TimedQuiz
        userEmail="demo_user"
        subjects={[selectedSubject]}
        quizType="demo"
        onComplete={handleQuizComplete}
        onExit={onComplete}
      />
    );
  }

  if (step === 'results' && quizResults) {
    return (
      <QuizResults
        results={quizResults}
        quizType="demo"
        onRetry={() => setStep('select')}
        onHome={onComplete}
        onUpgrade={onUpgrade}
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-background z-50 flex items-center justify-center p-4"
    >
      <div className="max-w-lg w-full">
        <motion.div
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          className="text-center mb-8"
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="text-6xl mb-4 inline-block"
          >
            🎁
          </motion.div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Free Trial Quiz! 🎉
          </h1>
          <p className="text-muted-foreground">
            Test 20 real JAMB questions for FREE. Pick one subject to start!
          </p>
        </motion.div>

        <div className="bg-card rounded-2xl p-6 border border-border mb-6">
          <h2 className="font-bold text-foreground mb-4">Choose Your Subject:</h2>
          <div className="grid grid-cols-2 gap-3">
            {DEMO_SUBJECTS.map((subject) => {
              const Icon = subject.icon;
              const isSelected = selectedSubject === subject.id;
              
              return (
                <motion.button
                  key={subject.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedSubject(subject.id)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    isSelected
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <Icon className={`w-6 h-6 mx-auto mb-2 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                  <p className={`font-medium text-sm ${isSelected ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {subject.name}
                  </p>
                </motion.button>
              );
            })}
          </div>
        </div>

        <div className="bg-accent/50 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Zap className="w-4 h-4 text-primary" />
            <span><strong>20 questions</strong> • 30 minutes • Real JAMB past questions</span>
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={onComplete} className="flex-1">
            Maybe Later
          </Button>
          <Button
            variant="hero"
            onClick={handleStartQuiz}
            disabled={!selectedSubject}
            className="flex-1"
          >
            Start Quiz <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4">
          ⚡ One free trial per device. Make it count!
        </p>
      </div>
    </motion.div>
  );
};
