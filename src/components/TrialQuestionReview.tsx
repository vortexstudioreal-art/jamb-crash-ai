import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle, XCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TrialQuizResults } from './TrialQuiz';

interface TrialQuestionReviewProps {
  results: TrialQuizResults;
  onBack: () => void;
}

export const TrialQuestionReview = ({ results, onBack }: TrialQuestionReviewProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const question = results.questions[currentIndex];
  const isCorrect = question.userAnswer === question.correct_answer;

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      {/* Header */}
      <div className="bg-card border-b border-border p-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Button variant="ghost" onClick={onBack} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
          <span className="text-sm text-muted-foreground">
            Question {currentIndex + 1} of {results.questions.length}
          </span>
        </div>
      </div>

      {/* Question Review */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-3xl mx-auto">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {/* Status Badge */}
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
              isCorrect 
                ? 'bg-green-500/20 text-green-500' 
                : 'bg-destructive/20 text-destructive'
            }`}>
              {isCorrect ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
              {isCorrect ? 'Correct' : 'Incorrect'}
              <span className="capitalize ml-2 text-muted-foreground">• {question.subject}</span>
            </div>

            {/* Question */}
            <div className="bg-card rounded-2xl p-6 border border-border">
              <p className="text-xl font-medium text-foreground leading-relaxed">
                {question.question}
              </p>
            </div>

            {/* Options */}
            <div className="space-y-3">
              {['A', 'B', 'C', 'D'].map((letter) => {
                const optionKey = `option_${letter.toLowerCase()}` as keyof typeof question;
                const optionText = question[optionKey] as string;
                const isCorrectAnswer = question.correct_answer === letter;
                const isUserAnswer = question.userAnswer === letter;
                
                let style = 'bg-card border-border';
                if (isCorrectAnswer) {
                  style = 'bg-green-500/20 border-green-500';
                } else if (isUserAnswer && !isCorrectAnswer) {
                  style = 'bg-destructive/20 border-destructive';
                }

                return (
                  <div
                    key={letter}
                    className={`p-4 rounded-xl border-2 flex items-center gap-4 ${style}`}
                  >
                    <span className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                      isCorrectAnswer 
                        ? 'bg-green-500 text-white' 
                        : isUserAnswer
                          ? 'bg-destructive text-white'
                          : 'bg-muted text-muted-foreground'
                    }`}>
                      {isCorrectAnswer && <CheckCircle className="w-5 h-5" />}
                      {isUserAnswer && !isCorrectAnswer && <XCircle className="w-5 h-5" />}
                      {!isCorrectAnswer && !isUserAnswer && letter}
                    </span>
                    <span className={`flex-1 ${isCorrectAnswer ? 'text-green-500 font-semibold' : 'text-foreground'}`}>
                      {optionText}
                    </span>
                    {isCorrectAnswer && (
                      <span className="text-xs text-green-500 font-medium">Correct Answer</span>
                    )}
                    {isUserAnswer && !isCorrectAnswer && (
                      <span className="text-xs text-destructive font-medium">Your Answer</span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Explanation */}
            {question.explanation && (
              <div className="bg-primary/10 rounded-xl p-4 border border-primary/20">
                <p className="text-sm text-foreground">
                  <strong>Explanation:</strong> {question.explanation}
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="bg-card border-t border-border p-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Previous
          </Button>
          
          <div className="flex gap-1">
            {results.questions.map((q, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`w-8 h-8 rounded-full text-xs font-medium transition-all ${
                  i === currentIndex
                    ? 'bg-primary text-primary-foreground'
                    : q.userAnswer === q.correct_answer
                      ? 'bg-green-500/20 text-green-500'
                      : 'bg-destructive/20 text-destructive'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
          
          <Button
            variant="outline"
            onClick={() => setCurrentIndex(prev => Math.min(results.questions.length - 1, prev + 1))}
            disabled={currentIndex === results.questions.length - 1}
          >
            Next
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
};
