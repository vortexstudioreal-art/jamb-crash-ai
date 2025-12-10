import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, BookOpen, Calculator, Atom, FlaskConical, Leaf, BookText, Building2, TrendingUp, Church, Globe, Receipt, ShoppingCart, Wheat, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

interface FreeTrialSubjectPickerProps {
  onComplete: (subjects: string[]) => void;
  onCancel: () => void;
}

const SUBJECTS = [
  { id: 'english', name: 'English', icon: BookText, required: true },
  { id: 'mathematics', name: 'Mathematics', icon: Calculator },
  { id: 'physics', name: 'Physics', icon: Atom },
  { id: 'chemistry', name: 'Chemistry', icon: FlaskConical },
  { id: 'biology', name: 'Biology', icon: Leaf },
  { id: 'literature', name: 'Literature', icon: BookOpen },
  { id: 'government', name: 'Government', icon: Building2 },
  { id: 'economics', name: 'Economics', icon: TrendingUp },
  { id: 'crs', name: 'CRS', icon: Church },
  { id: 'irs', name: 'IRS', icon: Church },
  { id: 'geography', name: 'Geography', icon: Globe },
  { id: 'accounting', name: 'Accounting', icon: Receipt },
  { id: 'commerce', name: 'Commerce', icon: ShoppingCart },
  { id: 'agricultural_science', name: 'Agric Science', icon: Wheat },
];

export const FreeTrialSubjectPicker = ({ onComplete, onCancel }: FreeTrialSubjectPickerProps) => {
  const [selected, setSelected] = useState<string[]>(['english']);

  const toggleSubject = (id: string) => {
    if (id === 'english') return; // English is required
    
    setSelected(prev => {
      if (prev.includes(id)) {
        return prev.filter(s => s !== id);
      }
      if (prev.length >= 4) {
        toast({
          title: "Maximum 4 subjects! 📚",
          description: "You can only select English + 3 other subjects",
          variant: "destructive"
        });
        return prev;
      }
      return [...prev, id];
    });
  };

  const handleContinue = () => {
    if (selected.length !== 4) {
      toast({
        title: "Select 4 subjects! 🎯",
        description: `Choose ${4 - selected.length} more subject(s) to continue`,
        variant: "destructive"
      });
      return;
    }
    onComplete(selected);
  };

  const canContinue = selected.length === 4;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-background z-50 flex items-center justify-center p-4"
    >
      <div className="bg-card rounded-3xl p-6 md:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-border shadow-2xl">
        <div className="text-center mb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="text-6xl mb-4"
          >
            🎯
          </motion.div>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            Choose Your Subject Combination
          </h2>
          <p className="text-muted-foreground mb-2">
            Select English + 3 other subjects for your free trial quiz
          </p>
          <div className="inline-flex items-center gap-2 bg-primary/20 text-primary px-4 py-2 rounded-full text-sm font-bold">
            <Check className="w-4 h-4" />
            {selected.length}/4 subjects selected
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
          {SUBJECTS.map((subject, index) => {
            const Icon = subject.icon;
            const isSelected = selected.includes(subject.id);
            const isRequired = subject.required;
            
            return (
              <motion.button
                key={subject.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                onClick={() => toggleSubject(subject.id)}
                disabled={isRequired}
                className={`relative p-4 rounded-xl border-2 transition-all ${
                  isSelected
                    ? 'border-primary bg-primary/10 shadow-lg shadow-primary/20'
                    : 'border-border hover:border-primary/50 bg-card'
                } ${isRequired ? 'cursor-not-allowed' : 'cursor-pointer active:scale-95'}`}
              >
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center"
                  >
                    <Check className="w-4 h-4 text-primary-foreground" />
                  </motion.div>
                )}
                <Icon className={`w-8 h-8 mx-auto mb-2 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                <p className={`font-medium text-sm ${isSelected ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {subject.name}
                </p>
                {isRequired && (
                  <span className="text-xs text-primary font-medium">Required ✓</span>
                )}
              </motion.button>
            );
          })}
        </div>

        <div className="bg-primary/10 rounded-xl p-4 mb-6 border border-primary/20">
          <p className="text-sm text-foreground text-center">
            🎁 <strong>Free Trial:</strong> 20-question quiz (5 from each subject) + 30-minute dashboard access
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onCancel}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleContinue}
            disabled={!canContinue}
            variant="hero"
            className="flex-1"
          >
            Continue to Quiz
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};
