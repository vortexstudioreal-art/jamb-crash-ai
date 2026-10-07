import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Filter, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { errorLogger } from '@/services/errorLogger';

const STEPS = [
  'signup',
  'subjects_selected',
  'quiz_started',
  'paywall_seen',
  'checkout_started',
  'paid',
] as const;

export function FunnelStats() {
  const [counts, setCounts] = useState<Record<string, number> | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('funnel_events')
        .select('email, event')
        .limit(5000);
      if (error) throw error;
      const distinct = new Map<string, Set<string>>();
      for (const row of (data || []) as { email: string; event: string }[]) {
        if (!distinct.has(row.event)) distinct.set(row.event, new Set());
        distinct.get(row.event)!.add(row.email.toLowerCase());
      }
      const out: Record<string, number> = {};
      for (const s of STEPS) out[s] = distinct.get(s)?.size || 0;
      setCounts(out);
    } catch (err) {
      errorLogger.error(err, { component: 'FunnelStats', action: 'load funnel' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const signups = counts?.signup || 0;
  const paid = counts?.paid || 0;

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-primary" />
            Conversion Funnel
          </span>
          <Button variant="ghost" size="icon" onClick={() => void load()} aria-label="Refresh funnel">
            <RefreshCw className="w-4 h-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading || !counts ? (
          <p className="text-sm text-muted-foreground">Loading funnel…</p>
        ) : signups === 0 ? (
          <p className="text-sm text-muted-foreground">
            No data yet — events start flowing once users sign up on this build.
          </p>
        ) : (
          <div className="space-y-2">
            {STEPS.map((step, i) => {
              const value = counts[step] || 0;
              const pct = signups > 0 ? Math.round((value / signups) * 100) : 0;
              return (
                <div key={step} className="flex items-center gap-3 text-sm">
                  <span className="w-6 text-muted-foreground tabular-nums">{i + 1}.</span>
                  <span className="flex-1 capitalize text-foreground">{step.replace(/_/g, ' ')}</span>
                  <div className="w-32 h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-20 text-right tabular-nums text-foreground font-medium">
                    {value} <span className="text-muted-foreground font-normal">({pct}%)</span>
                  </span>
                </div>
              );
            })}
            <p className="text-xs text-muted-foreground pt-2">
              Signup → paid conversion:{' '}
              <span className="font-bold text-foreground">
                {signups > 0 ? ((paid / signups) * 100).toFixed(1) : '0.0'}%
              </span>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
