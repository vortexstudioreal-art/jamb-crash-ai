import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Database, Sparkles, Loader2, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { errorLogger } from '@/services/errorLogger';

interface NovelRow {
  id: string;
  title: string;
  category: string | null;
  total_chapters: number | null;
  count: number;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function NovelLibraryManager() {
  const [novels, setNovels] = useState<NovelRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [enriching, setEnriching] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('novels')
        .select('id, title, category, total_chapters')
        .order('title');
      const rows: NovelRow[] = [];
      for (const n of data || []) {
        const { count } = await supabase
          .from('novel_chapters')
          .select('*', { count: 'exact', head: true })
          .eq('novel_id', n.id);
        rows.push({ ...n, count: count || 0 });
      }
      setNovels(rows);
    } catch (err) {
      errorLogger.error(err, { component: 'NovelLibraryManager', action: 'load' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const fillMissing = async () => {
    setSeeding(true);
    setStatus('Creating missing chapter slots…');
    try {
      const { data, error } = await supabase.functions.invoke('seed-novel-chapters', {
        body: {},
      });
      if (error) throw error;
      const created = (data?.results || []).reduce(
        (sum: number, r: { created: number }) => sum + r.created,
        0
      );
      toast.success(`Created ${created} missing chapter slots`);
      setStatus(`Created ${created} slots. Now run “Enrich all guides”.`);
      await load();
    } catch (err) {
      errorLogger.error(err, { component: 'NovelLibraryManager', action: 'seed' });
      toast.error(err instanceof Error ? err.message : 'Seeding failed');
      setStatus(null);
    } finally {
      setSeeding(false);
    }
  };

  const enrichAll = async () => {
    setEnriching(true);
    // 30s cap per invoke: a hung request must never freeze the queue at
    // "Queued x/19" — failures are collected and reported at the end.
    const invokeWithTimeout = async (body: Record<string, string>) => {
      const res = await Promise.race([
        supabase.functions.invoke('enrich-novel-chapters', { body }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('timeout')), 30000)
        ),
      ]);
      if (res.error) throw res.error;
    };
    try {
      const prose = novels.filter((n) => !(n.category || '').includes('poetry'));
      const poems = novels.filter((n) => (n.category || '').includes('poetry'));

      // One invoke per book, spaced 30s apart. The jobs run for minutes
      // each on the server — firing all 19 at once is what triggers
      // Groq 429s and gets jobs killed mid-run. Slow queueing = finishes.
      // The function only enriches thin chapters (<500 words): re-running
      // fills whatever a previous run missed.
      const failed: string[] = [];
      let i = 0;
      const total = prose.length + poems.length;
      for (const novel of prose) {
        i++;
        setStatus(`Queued ${i}/${total}: ${novel.title}… (pace: 30s apart)`);
        try {
          await invokeWithTimeout({ novel_title: novel.title });
        } catch {
          failed.push(novel.title);
        }
        await sleep(30000);
      }

      for (const poem of poems) {
        i++;
        setStatus(`Queued ${i}/${total}: ${poem.title}… (pace: 30s apart)`);
        try {
          await invokeWithTimeout({ enrich_all_poetry: 'true', poem_title: poem.title });
        } catch {
          failed.push(poem.title);
        }
        await sleep(30000);
      }

      if (failed.length > 0) {
        setStatus(`Queued with ${failed.length} failures: ${failed.slice(0, 4).join(', ')}${failed.length > 4 ? '…' : ''}. Retry these individually.`);
        toast.error(`${failed.length} books failed to queue — retry them`);
      } else {
        setStatus('All enrichment jobs queued — guides fill in over the next minutes. Come back and hit “Refresh counts”.');
        toast.success('Enrichment queued for the whole library 🎉');
      }
    } catch (err) {
      errorLogger.error(err, { component: 'NovelLibraryManager', action: 'enrich' });
      toast.error(err instanceof Error ? err.message : 'Enrichment failed');
      setStatus(null);
    } finally {
      setEnriching(false);
    }
  };

  const missing = novels.reduce(
    (sum, n) => sum + Math.max(0, (n.total_chapters || 0) - n.count),
    0
  );

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" />
          Novel Library
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading library…</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
            {novels.map((n) => {
              const complete = (n.total_chapters || 0) > 0 && n.count >= (n.total_chapters || 0);
              return (
                <div
                  key={n.id}
                  className="flex items-center justify-between gap-2 p-2 rounded-lg border border-border text-sm"
                >
                  <span className="truncate text-foreground">{n.title}</span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                    {complete && <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />}
                    {n.count}/{n.total_chapters || '?'}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-2">
          <Button onClick={fillMissing} disabled={seeding || enriching} variant="outline" className="flex-1">
            {seeding ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Database className="w-4 h-4 mr-2" />}
            Fill missing chapters{missing > 0 ? ` (${missing})` : ''}
          </Button>
          <Button
            onClick={enrichAll}
            disabled={seeding || enriching}
            className="flex-1 bg-gradient-to-r from-primary to-green-500 text-white"
          >
            {enriching ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
            Enrich all guides
          </Button>
        </div>

        {status && <p className="text-xs text-muted-foreground">{status}</p>}
        <Button variant="ghost" size="sm" onClick={() => void load()} disabled={loading}>
          Refresh counts
        </Button>
      </CardContent>
    </Card>
  );
}
