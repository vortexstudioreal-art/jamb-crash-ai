import { useState, useEffect, useCallback } from 'react';
import { Flag, CheckCircle2, XCircle, RefreshCw, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { errorLogger } from '@/services/errorLogger';
import type { Database } from '@/integrations/supabase/types';

type QuestionReportRow = Database['public']['Tables']['question_reports']['Row'];

const REASON_LABELS: Record<string, string> = {
  wrong_answer: 'Wrong answer key',
  typo: 'Typo / grammar error',
  duplicate: 'Duplicate question',
  unclear: 'Confusing or incomplete',
  image: 'Missing / broken image',
  other: 'Other',
};

const STATUS_STYLES: Record<string, string> = {
  open: 'bg-amber-500/20 text-amber-600 border-amber-500/30',
  reviewed: 'bg-emerald-500/20 text-emerald-600 border-emerald-500/30',
  dismissed: 'bg-muted text-muted-foreground border-border',
};

interface QuestionLookup {
  [id: string]: { question: string; subject: string; correct_answer: string };
}

export function QuestionReportsManager() {
  const [reports, setReports] = useState<QuestionReportRow[]>([]);
  const [questions, setQuestions] = useState<QuestionLookup>({});
  const [filter, setFilter] = useState<'all' | 'open' | 'reviewed' | 'dismissed'>('all');
  const [loading, setLoading] = useState(true);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('question_reports')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      errorLogger.error(error, { component: 'QuestionReportsManager', action: 'fetch reports' });
      toast.error('Failed to load reports');
      setLoading(false);
      return;
    }

    setReports(data || []);

    const ids = (data || []).map(r => r.question_id).filter(Boolean);
    if (ids.length > 0) {
      const { data: qData, error: qError } = await supabase
        .from('jamb_questions')
        .select('id, question, subject, correct_answer')
        .in('id', ids);

      if (!qError && qData) {
        const lookup: QuestionLookup = {};
        qData.forEach(q => {
          lookup[q.id] = q;
        });
        setQuestions(lookup);
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const updateStatus = async (id: string, status: 'reviewed' | 'dismissed') => {
    const { error } = await supabase
      .from('question_reports')
      .update({ status })
      .eq('id', id);

    if (error) {
      toast.error('Failed to update report');
      return;
    }
    toast.success(status === 'reviewed' ? 'Marked as reviewed' : 'Report dismissed');
    setReports(prev => prev.map(r => (r.id === id ? { ...r, status } : r)));
  };

  const visible = filter === 'all' ? reports : reports.filter(r => r.status === filter);
  const openCount = reports.filter(r => r.status === 'open').length;

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Flag className="w-5 h-5 text-amber-500" />
            Reported Questions
            {openCount > 0 && (
              <Badge variant="outline" className="bg-amber-500/20 text-amber-600 border-amber-500/30">
                {openCount} open
              </Badge>
            )}
          </div>
          <Button size="sm" variant="outline" onClick={fetchReports} disabled={loading} className="gap-2">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          {(['all', 'open', 'reviewed', 'dismissed'] as const).map(f => (
            <Button
              key={f}
              size="sm"
              variant={filter === f ? 'default' : 'outline'}
              onClick={() => setFilter(f)}
              className="capitalize"
            >
              {f}
              {f === 'all' && <span className="ml-1.5 text-xs opacity-70">({reports.length})</span>}
            </Button>
          ))}
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground py-8 text-center">Loading reports...</p>
        ) : visible.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">No reports in this view.</p>
        ) : (
          <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
            {visible.map(r => {
              const q = questions[r.question_id];
              return (
                <div key={r.id} className="rounded-xl border p-4 space-y-2">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className={STATUS_STYLES[r.status] || 'border-border'}>
                        {r.status}
                      </Badge>
                      <Badge variant="secondary">{REASON_LABELS[r.reason] || r.reason}</Badge>
                      {q?.subject && <Badge variant="outline" className="capitalize">{q.subject.replace('_', ' ')}</Badge>}
                    </div>
                    <div className="flex items-center gap-2">
                      {r.status === 'open' && (
                        <>
                          <Button size="sm" variant="outline" className="gap-1.5 h-8" onClick={() => updateStatus(r.id, 'reviewed')}>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                            Reviewed
                          </Button>
                          <Button size="sm" variant="outline" className="gap-1.5 h-8" onClick={() => updateStatus(r.id, 'dismissed')}>
                            <XCircle className="w-3.5 h-3.5 text-red-500" />
                            Dismiss
                          </Button>
                        </>
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-foreground font-medium leading-relaxed">
                    {q ? q.question : 'Question no longer in database'}
                  </p>
                  {q?.correct_answer && (
                    <p className="text-xs text-muted-foreground">
                      Current answer key: <span className="text-emerald-600 font-medium">{q.correct_answer}</span>
                    </p>
                  )}

                  <div className="flex items-start gap-2 text-xs text-muted-foreground">
                    <MessageSquare className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-medium text-foreground">{r.email}</span> ·{' '}
                      {new Date(r.created_at).toLocaleString()}
                      {r.notes && <p className="mt-0.5">{r.notes}</p>}
                    </div>
                  </div>

                  <p className="text-[10px] text-muted-foreground/70 break-all">
                    Question ID: {r.question_id}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
