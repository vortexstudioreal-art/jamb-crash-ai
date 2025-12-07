import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, BookOpen, Calculator, Atom, FlaskConical, Leaf, BookText, Building2, TrendingUp, Church, Globe, Receipt, ShoppingCart, Wheat } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface SubjectSelectorProps {
  userEmail: string;
  onComplete: (subjects: string[]) => void;
  isBypassUser?: boolean; // Bypass users skip database operations
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

export const SubjectSelector = ({ userEmail, onComplete, isBypassUser = false }: SubjectSelectorProps) => {
  const [selected, setSelected] = useState<string[]>(['english']);
  const [saving, setSaving] = useState(false);

  const toggleSubject = (id: string) => {
    if (id === 'english') return; // English is required
    
    setSelected(prev => {
      if (prev.includes(id)) {
        return prev.filter(s => s !== id);
      }
      if (prev.length >= 4) {
        toast({
          title: "Maximum 4 subjects! 📚",
          description: "Remove one subject to add another",
          variant: "destructive"
        });
        return prev;
      }
      return [...prev, id];
    });
  };

  const handleSubmit = async () => {
    if (selected.length !== 4) {
      toast({
        title: "Select 4 subjects! 🎯",
        description: `You've selected ${selected.length}/4 subjects`,
        variant: "destructive"
      });
      return;
    }

    setSaving(true);
    
    // BYPASS USERS: Skip database save, just proceed
    if (isBypassUser) {
      toast({
        title: "Awesome choice! 🎉",
        description: "Your subjects are saved. Let's crush JAMB together!"
      });
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

      toast({
        title: "Awesome choice! 🎉",
        description: "Your subjects are saved. Let's crush JAMB together!"
      });
      onComplete(selected);
    } catch (error) {
      console.error('Error saving subjects:', error);
      toast({
        title: "Oops! Something went wrong",
        description: "Please try again",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <div className="bg-card rounded-3xl p-6 md:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-border shadow-2xl">
        <div className="text-center mb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="text-6xl mb-4"
          >
            🎓
          </motion.div>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            Choose Your JAMB Subjects! 📚
          </h2>
          <p className="text-muted-foreground">
            Pick English + 3 others. We'll prepare questions just for YOU!
          </p>
          <div className="mt-3 inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
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
                transition={{ delay: index * 0.05 }}
                onClick={() => toggleSubject(subject.id)}
                disabled={isRequired}
                className={`relative p-4 rounded-xl border-2 transition-all ${
                  isSelected
                    ? 'border-primary bg-primary/10 shadow-lg'
                    : 'border-border hover:border-primary/50 bg-card'
                } ${isRequired ? 'cursor-not-allowed' : 'cursor-pointer'}`}
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
                  <span className="text-xs text-primary">Required ✓</span>
                )}
              </motion.button>
            );
          })}
        </div>

        <div className="bg-accent/50 rounded-xl p-4 mb-6">
          <p className="text-sm text-muted-foreground text-center">
            💡 <strong>Pro tip:</strong> Pick subjects that match your course! 
            Science students usually need Physics, Chemistry, Biology/Maths.
          </p>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={selected.length !== 4 || saving}
          size="xl"
          variant="hero"
          className="w-full"
        >
          {saving ? (
            "Saving your combo... 🔄"
          ) : (
            <>
              Start Studying! 🚀
              <span className="ml-2 text-sm opacity-75">({selected.length}/4)</span>
            </>
          )}
        </Button>
      </div>
    </motion.div>
  );
};
