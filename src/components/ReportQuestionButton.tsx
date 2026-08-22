import { useState } from 'react';
import { Flag, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { errorLogger } from '@/services/errorLogger';

const REASONS = [
  { value: 'wrong_answer', label: 'Wrong answer key' },
  { value: 'typo', label: 'Typo / grammar error' },
  { value: 'duplicate', label: 'Duplicate question' },
  { value: 'unclear', label: 'Confusing or incomplete' },
  { value: 'image', label: 'Missing / broken image' },
  { value: 'other', label: 'Other' },
] as const;

interface ReportQuestionButtonProps {
  questionId: string;
  userEmail: string;
  compact?: boolean;
  onReported?: () => void;
}

export function ReportQuestionButton({ questionId, userEmail, compact = false, onReported }: ReportQuestionButtonProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<string>('wrong_answer');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async () => {
    if (!userEmail) return;
    setSubmitting(true);
    const { error } = await supabase.from('question_reports').insert({
      question_id: questionId,
      email: userEmail,
      reason,
      notes: notes.trim() || null,
    });
    setSubmitting(false);
    if (error) {
      errorLogger.error(error, { component: 'ReportQuestionButton', action: 'submit report' });
      return;
    }
    setDone(true);
    onReported?.();
    setTimeout(() => {
      setOpen(false);
      setDone(false);
      setNotes('');
      setReason('wrong_answer');
    }, 1200);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="ghost"
          className={compact ? 'h-7 px-2 text-muted-foreground hover:text-amber-600 gap-1' : 'h-8 px-3 text-muted-foreground hover:text-amber-600 gap-1.5 border border-border'}
          title="Report an issue with this question"
        >
          <Flag className="w-3.5 h-3.5" />
          <span className="text-xs">Report</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Flag className="w-4 h-4 text-amber-500" />
            Report question issue
          </DialogTitle>
          <DialogDescription>
            Help us improve the question bank. Our team will review your report.
          </DialogDescription>
        </DialogHeader>

        {done ? (
          <div className="flex flex-col items-center gap-2 py-6 text-center">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
            <p className="font-medium text-foreground">Report submitted!</p>
            <p className="text-sm text-muted-foreground">Thanks for helping improve Jamb Crash AI.</p>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">What's the issue?</label>
              <div className="grid grid-cols-2 gap-2">
                {REASONS.map(r => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setReason(r.value)}
                    className={`px-3 py-2 rounded-lg border text-xs font-medium text-left transition-all ${
                      reason === r.value
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border text-muted-foreground hover:border-primary/40'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Details (optional)</label>
              <Textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="e.g. The correct answer should be B, the last word is misspelled..."
                maxLength={500}
                rows={3}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
              <Button size="sm" onClick={submit} disabled={submitting}>
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Flag className="w-4 h-4" />}
                Submit report
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
