import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Check, BookOpen, Calculator, Atom, FlaskConical, Leaf, BookText, Building2, TrendingUp, Church, Globe, Receipt, ShoppingCart, Wheat, CheckCircle, GraduationCap, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { toast } from 'sonner';
import { getMatchingCourses, getPartiallyMatchingCourses, SUBJECT_DISPLAY_NAMES } from '@/data/jambCourseRequirements';
import { errorLogger } from '@/services/errorLogger';

interface SubjectSelectorProps {
  userEmail: string;
  onComplete: (subjects: string[]) => void;
  isBypassUser?: boolean; // Bypass users skip database operations
  initialSubjects?: string[]; // Pre-select subjects when changing
  onCancel?: () => void; // Close handler when used as modal for changing subjects
  isChangingSubjects?: boolean; // Show "Saved" instead of "Account" in progress
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

export const SubjectSelector = ({ 
  userEmail, 
  onComplete, 
  isBypassUser = false,
  initialSubjects,
  onCancel,
  isChangingSubjects = false
}: SubjectSelectorProps) => {
  const [selected, setSelected] = useState<string[]>(
    initialSubjects && initialSubjects.length > 0 
      ? initialSubjects 
      : ['english']
  );
  const [saving, setSaving] = useState(false);

  const toggleSubject = (id: string) => {
    if (id === 'english') return; // English is required
    
    setSelected(prev => {
      if (prev.includes(id)) {
        return prev.filter(s => s !== id);
      }
      if (prev.length >= 4) {
        toast.error("Maximum 4 subjects! 📚", { description: "Remove one subject to add another" });
        return prev;
      }
      return [...prev, id];
    });
  };

  const handleSubmit = async () => {
    if (selected.length !== 4) {
      toast.error("Select 4 subjects! 🎯", { description: `You've selected ${selected.length}/4 subjects` });
      return;
    }

    setSaving(true);
    
    // BYPASS USERS: Skip database save, just proceed
    if (isBypassUser) {
      toast("Awesome choice! 🎉", { description: "Your subjects are saved. Let's crush JAMB together!" });
      onComplete(selected);
      setSaving(false);
      return;
    }
    
    try {
      // OFFLINE: save locally + queue for later sync so the user isn't blocked.
      if (typeof navigator !== "undefined" && !navigator.onLine) {
        try {
          localStorage.setItem(
            `jamb_subjects_${userEmail}`,
            JSON.stringify(selected),
          );
          const queueRaw = localStorage.getItem("jamb_pending_subjects") || "[]";
          const queue = JSON.parse(queueRaw);
          queue.push({ email: userEmail, subjects: selected, ts: Date.now() });
          localStorage.setItem("jamb_pending_subjects", JSON.stringify(queue));
        } catch {
          // localStorage unavailable — subjects saved on next sync
        }
        toast("Saved offline 📴", { description: "We'll sync your subjects when you're back online." });
        onComplete(selected);
        setSaving(false);
        return;
      }

      const { error } = await supabase
        .from('user_subjects')
        .upsert({
          email: userEmail,
          subjects: selected as Database['public']['Enums']['jamb_subject'][],
          updated_at: new Date().toISOString()
        }, { onConflict: 'email' });

      if (error) throw error;

      toast("Awesome choice! 🎉", { description: "Your subjects are saved. Let's crush JAMB together!" });
      try {
        localStorage.setItem(
          `jamb_subjects_${userEmail}`,
          JSON.stringify(selected),
        );
      } catch {
        // localStorage unavailable — server copy is authoritative
      }
      onComplete(selected);
    } catch (error) {
      errorLogger.error(error, { component: 'SubjectSelector', action: 'save subjects' });
      // Network failure mid-save: still let the user in, cache + queue.
      if (typeof navigator !== "undefined" && !navigator.onLine) {
        try {
          localStorage.setItem(
            `jamb_subjects_${userEmail}`,
            JSON.stringify(selected),
          );
          const queueRaw = localStorage.getItem("jamb_pending_subjects") || "[]";
          const queue = JSON.parse(queueRaw);
          queue.push({ email: userEmail, subjects: selected, ts: Date.now() });
          localStorage.setItem("jamb_pending_subjects", JSON.stringify(queue));
        } catch {
          // localStorage unavailable — offline queue skipped
        }
        toast("Saved offline 📴", { description: "We'll sync your subjects when you're back online." });
        onComplete(selected);
        setSaving(false);
        return;
      }
      toast.error("Oops! Something went wrong", { description: "Please try again" });
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
        {/* Progress Indicator - only show when not changing subjects */}
        {!isChangingSubjects && (
          <div className="mb-6">
            <div className="flex items-center justify-between max-w-xs mx-auto">
              {/* Step 1 - Create Account (Completed) */}
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-xs mt-1.5 text-primary font-medium">Account</span>
              </div>
              
              {/* Connector (Completed) */}
              <div className="flex-1 h-0.5 bg-primary mx-2 mb-5" />
              
              {/* Step 2 - Select Subjects (Active) */}
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
                  2
                </div>
                <span className="text-xs mt-1.5 text-primary font-medium">Select Subjects</span>
              </div>
              
              {/* Connector */}
              <div className="flex-1 h-0.5 bg-border mx-2 mb-5" />
              
              {/* Step 3 - Start Learning */}
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground font-bold text-sm">
                  3
                </div>
                <span className="text-xs mt-1.5 text-muted-foreground">Start Learning</span>
              </div>
            </div>
          </div>
        )}

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
            {isChangingSubjects ? 'Change Your Subjects 🔄' : 'Choose Your JAMB Subjects! 📚'}
          </h2>
          <p className="text-muted-foreground">
            Pick English + 3 others. {isChangingSubjects ? 'Your quiz data will be updated.' : "We'll prepare questions just for YOU!"}
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

        {/* Course Match Preview */}
        {selected.length === 4 && (
          <CourseMatchPreview selectedSubjects={selected} />
        )}

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
          ) : isChangingSubjects ? (
            <>
              Save Changes ✓
              <span className="ml-2 text-sm opacity-75">({selected.length}/4)</span>
            </>
          ) : (
            <>
              Start Studying! 🚀
              <span className="ml-2 text-sm opacity-75">({selected.length}/4)</span>
            </>
          )}
        </Button>

        {/* Cancel button - only show when changing subjects */}
        {isChangingSubjects && onCancel && (
          <Button
            variant="ghost"
            onClick={onCancel}
            className="w-full mt-3"
          >
            Cancel
          </Button>
        )}
      </div>
    </motion.div>
  );
};

// Course Match Preview Component
const CourseMatchPreview = ({ selectedSubjects }: { selectedSubjects: string[] }) => {
  const matchingCourses = useMemo(() => getMatchingCourses(selectedSubjects), [selectedSubjects]);
  const topMatches = matchingCourses.slice(0, 5);

  if (matchingCourses.length === 0) {
    const partialMatches = getPartiallyMatchingCourses(selectedSubjects).slice(0, 3);
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6"
      >
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="w-5 h-5 text-yellow-500" />
          <h3 className="font-semibold text-foreground">Limited Course Matches</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-3">
          Your current combo doesn't fully match many courses. Consider these partial matches:
        </p>
        <div className="space-y-2">
          {partialMatches.map(course => (
            <div key={course.id} className="flex items-center justify-between text-sm">
              <span className="text-foreground">{course.course}</span>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-yellow-400 border-yellow-500/30 text-xs">
                  {Math.round(course.matchPercentage)}% match
                </Badge>
                <span className="text-xs text-muted-foreground">
                  Need: {course.missingSubjects.map(s => SUBJECT_DISPLAY_NAMES[s]).join(', ')}
                </span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 mb-6"
    >
      <div className="flex items-center gap-2 mb-3">
        <GraduationCap className="w-5 h-5 text-green-500" />
        <h3 className="font-semibold text-foreground">Your Combo Matches!</h3>
        <Badge className="bg-green-500 text-white text-xs ml-auto">
          {matchingCourses.length} courses
        </Badge>
      </div>
      <p className="text-sm text-muted-foreground mb-3">
        You're eligible for these courses with your subject combination:
      </p>
      <div className="flex flex-wrap gap-2">
        {topMatches.map(course => (
          <Badge key={course.id} variant="secondary" className="text-xs">
            {course.course}
          </Badge>
        ))}
        {matchingCourses.length > 5 && (
          <Badge variant="outline" className="text-xs text-primary border-primary/30">
            +{matchingCourses.length - 5} more
          </Badge>
        )}
      </div>
    </motion.div>
  );
};
