import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ArrowLeft, Atom, Palette, Calculator, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SubjectChangerProps {
  userEmail: string;
  currentSubjects: string[];
  onComplete: (subjects: string[]) => void;
  onClose: () => void;
  isBypassUser?: boolean;
}

type Category = 'science' | 'art' | 'commercial';

interface CategoryData {
  name: string;
  icon: typeof Atom;
  color: string;
  subjects: { id: string; name: string }[];
}

const CATEGORIES: Record<Category, CategoryData> = {
  science: {
    name: 'SCIENCE',
    icon: Atom,
    color: 'from-blue-500 to-cyan-500',
    subjects: [
      { id: 'mathematics', name: 'Mathematics' },
      { id: 'physics', name: 'Physics' },
      { id: 'chemistry', name: 'Chemistry' },
      { id: 'biology', name: 'Biology' },
      { id: 'agricultural_science', name: 'Agriculture' },
      { id: 'geography', name: 'Geography' },
    ],
  },
  art: {
    name: 'ART',
    icon: Palette,
    color: 'from-purple-500 to-pink-500',
    subjects: [
      { id: 'literature', name: 'Literature' },
      { id: 'government', name: 'Government' },
      { id: 'crs', name: 'CRS' },
      { id: 'irs', name: 'IRS' },
    ],
  },
  commercial: {
    name: 'COMMERCIAL',
    icon: Calculator,
    color: 'from-green-500 to-emerald-500',
    subjects: [
      { id: 'mathematics', name: 'Mathematics' },
      { id: 'economics', name: 'Economics' },
      { id: 'commerce', name: 'Commerce' },
      { id: 'accounting', name: 'Accounting' },
      { id: 'government', name: 'Government' },
      { id: 'geography', name: 'Geography' },
    ],
  },
};

export const SubjectChanger = ({ 
  userEmail, 
  currentSubjects, 
  onComplete, 
  onClose,
  isBypassUser = false 
}: SubjectChangerProps) => {
  const [step, setStep] = useState<'category' | 'subjects'>('category');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selected, setSelected] = useState<string[]>(['english']);
  const [saving, setSaving] = useState(false);

  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category);
    setSelected(['english']);
    setStep('subjects');
  };

  const toggleSubject = (id: string) => {
    setSelected(prev => {
      if (prev.includes(id)) {
        return prev.filter(s => s !== id);
      }
      if (prev.length >= 4) {
        toast.error("Maximum 4 subjects! Remove one to add another");
        return prev;
      }
      return [...prev, id];
    });
  };

  const handleSubmit = async () => {
    if (selected.length !== 4) {
      toast.error(`Select 4 subjects! You've picked ${selected.length}/4`);
      return;
    }

    setSaving(true);
    
    if (isBypassUser) {
      toast.success("Subjects updated! 🎉");
      onComplete(selected);
      setSaving(false);
      return;
    }
    
    try {
      const { error } = await supabase
        .from('user_subjects')
        .upsert({
          email: userEmail,
          subjects: selected as any,
          updated_at: new Date().toISOString()
        }, { onConflict: 'email' });

      if (error) throw error;

      toast.success("Subjects updated! 🎉");
      onComplete(selected);
    } catch (error) {
      console.error('Error saving subjects:', error);
      toast.error("Oops! Something went wrong. Try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-card rounded-3xl p-6 md:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto border border-border shadow-2xl"
      >
        <AnimatePresence mode="wait">
          {step === 'category' ? (
            <motion.div
              key="category"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <div className="text-center mb-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.1 }}
                  className="text-5xl mb-4"
                >
                  🎯
                </motion.div>
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  Choose Your Category
                </h2>
                <p className="text-muted-foreground text-sm">
                  Pick your JAMB combination type
                </p>
              </div>

              <div className="space-y-3">
                {(Object.entries(CATEGORIES) as [Category, CategoryData][]).map(([key, cat], index) => {
                  const Icon = cat.icon;
                  return (
                    <motion.button
                      key={key}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => handleCategorySelect(key)}
                      className={`w-full p-5 rounded-2xl bg-gradient-to-r ${cat.color} text-white font-bold text-lg flex items-center gap-4 hover:scale-[1.02] transition-transform shadow-lg`}
                    >
                      <Icon className="w-8 h-8" />
                      <div className="text-left">
                        <span className="block">{cat.name}</span>
                        <span className="text-sm font-normal opacity-80">
                          {cat.subjects.length} subjects available
                        </span>
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              <Button
                variant="ghost"
                onClick={onClose}
                className="w-full mt-4"
              >
                Cancel
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="subjects"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <button
                onClick={() => setStep('category')}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to categories
              </button>

              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-foreground mb-1">
                  {selectedCategory && CATEGORIES[selectedCategory].name} Subjects
                </h2>
                <p className="text-muted-foreground text-sm">
                  English (required) + pick 3 more
                </p>
                <div className="mt-3 inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
                  <Check className="w-4 h-4" />
                  {selected.length}/4 selected
                </div>
              </div>

              {/* English - Required */}
              <div className="mb-3 p-4 rounded-xl border-2 border-primary bg-primary/10">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <span className="font-bold text-foreground">English</span>
                  <span className="text-xs text-primary ml-auto">Required ✓</span>
                </div>
              </div>

              {/* Category Subjects */}
              <div className="space-y-2 mb-6">
                {selectedCategory && CATEGORIES[selectedCategory].subjects.map((subject, index) => {
                  const isSelected = selected.includes(subject.id);
                  return (
                    <motion.button
                      key={subject.id}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => toggleSubject(subject.id)}
                      className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${
                        isSelected
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50 bg-card'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        isSelected ? 'bg-primary' : 'border-2 border-muted-foreground'
                      }`}>
                        {isSelected && <Check className="w-4 h-4 text-primary-foreground" />}
                      </div>
                      <span className={`font-medium ${isSelected ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {subject.name}
                      </span>
                    </motion.button>
                  );
                })}
              </div>

              <Button
                onClick={handleSubmit}
                disabled={selected.length !== 4 || saving}
                size="lg"
                className="w-full gradient-primary"
              >
                {saving ? "Saving..." : `Save Subjects (${selected.length}/4)`}
              </Button>

              <Button
                variant="ghost"
                onClick={onClose}
                className="w-full mt-2"
              >
                Cancel
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};