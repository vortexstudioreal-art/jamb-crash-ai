import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ClipboardCheck, RotateCcw, PartyPopper } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';

interface ChecklistItem {
  id: string;
  group: string;
  text: string;
}

const ITEMS: ChecklistItem[] = [
  { id: 'slip', group: 'Before exam day', text: 'Reprint your JAMB exam slip — confirm centre, date & time' },
  { id: 'centre', group: 'Before exam day', text: 'Locate your CBT centre ahead of time (do a test trip)' },
  { id: 'pencils', group: 'Before exam day', text: 'Pack HB pencils, eraser & sharpener (for rough work sign-in)' },
  { id: 'sleep', group: 'Before exam day', text: 'Sleep early — a rested brain recalls 2× more' },
  { id: 'prohibited', group: 'Before exam day', text: 'Leave phones, calculators, bags & wristwatches at home (banned)' },
  { id: 'early', group: 'Exam day', text: 'Arrive at least 1 hour early for accreditation' },
  { id: 'biometric', group: 'Exam day', text: 'Complete biometric verification calmly — it starts your clock only after login' },
  { id: 'instructions', group: 'Exam day', text: 'Read on-screen instructions before touching question 1' },
  { id: 'strategy', group: 'Exam day', text: 'Attempt Use of English first, then strongest → weakest subject' },
  { id: 'timing', group: 'Exam day', text: 'Budget ~1 min per question; never spend 3+ min on one — flag & move' },
  { id: 'all', group: 'Exam day', text: 'Answer EVERYTHING — no negative marking, blanks score zero' },
  { id: 'review', group: 'Exam day', text: 'Reserve the last 10 minutes to review flagged questions' },
];

const STORAGE_KEY = 'jamb_exam_checklist_v1';

// Next UTME date — TODO(admin): update when JAMB officially announces.
// The checklist only appears in the run-up so it doesn't clutter the home
// tab for most of the year.
const NEXT_JAMB_UTME = '2027-04-19';
const EXAM_WINDOW_DAYS = 14;

export const ExamDayChecklist = () => {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [open, setOpen] = useState(false);

  const daysLeft = Math.ceil(
    (new Date(NEXT_JAMB_UTME).getTime() - Date.now()) / 86400000,
  );
  // Outside exam season (or the day after) — stay out of the way.
  if (daysLeft > EXAM_WINDOW_DAYS || daysLeft < -1) return null;

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setChecked(JSON.parse(raw));
    } catch {
      // corrupted cache — start fresh
    }
  }, []);

  const toggle = (id: string) => {
    setChecked((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // storage full/blocked — checklist just won't persist
      }
      return next;
    });
  };

  const reset = () => {
    setChecked({});
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  const done = ITEMS.filter((i) => checked[i.id]).length;
  const pct = Math.round((done / ITEMS.length) * 100);
  const complete = done === ITEMS.length;
  const groups = [...new Set(ITEMS.map((i) => i.group))];

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full p-5 flex items-center gap-4 text-left"
      >
        <div className="w-12 h-12 rounded-full bg-green-500/15 flex items-center justify-center shrink-0">
          {complete ? (
            <PartyPopper className="w-6 h-6 text-green-500" />
          ) : (
            <ClipboardCheck className="w-6 h-6 text-green-600" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-foreground">
            {complete ? 'Exam-day ready! 🎉' : 'Exam-Day Checklist'}
          </h3>
          <p className="text-sm text-muted-foreground">
            {complete
              ? `Done — ${daysLeft <= 0 ? 'good luck today!' : 'go crush it!'}`
              : `${done}/${ITEMS.length} ready · ${daysLeft <= 0 ? 'exam is here!' : `${daysLeft}d to UTME`}`}
          </p>
        </div>
        <span className="text-xs font-bold text-primary">{pct}%</span>
      </button>
      <div className="px-5 pb-1">
        <Progress value={pct} className="h-1.5" />
      </div>
      {open && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="px-5 pb-5 pt-3 space-y-4"
        >
          {groups.map((g) => (
            <div key={g}>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">{g}</p>
              <div className="space-y-2">
                {ITEMS.filter((i) => i.group === g).map((item) => (
                  <label
                    key={item.id}
                    className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-muted/50 cursor-pointer transition-colors"
                  >
                    <Checkbox
                      checked={!!checked[item.id]}
                      onCheckedChange={() => toggle(item.id)}
                      className="mt-0.5"
                    />
                    <span
                      className={`text-sm ${
                        checked[item.id] ? 'line-through text-muted-foreground' : 'text-foreground'
                      }`}
                    >
                      {item.text}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ))}
          {done > 0 && (
            <button
              onClick={reset}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mx-auto"
            >
              <RotateCcw className="w-3 h-3" /> Reset checklist
            </button>
          )}
        </motion.div>
      )}
    </div>
  );
};
