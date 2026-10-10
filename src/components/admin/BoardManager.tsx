import { useState, useEffect, useCallback } from 'react';
import { MessageSquare, Trash2, RotateCcw, RefreshCw, Search, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { errorLogger } from '@/services/errorLogger';

interface BoardThreadRow {
  id: string;
  subject: string;
  title: string;
  body: string;
  alias: string;
  email: string;
  reply_count: number;
  is_deleted: boolean;
  created_at: string;
}

interface BoardReplyRow {
  id: string;
  thread_id: string;
  body: string;
  alias: string;
  email: string;
  is_deleted: boolean;
  created_at: string;
}

export const BoardManager = () => {
  const [threads, setThreads] = useState<BoardThreadRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showDeleted, setShowDeleted] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [replies, setReplies] = useState<BoardReplyRow[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);

  const fetchThreads = useCallback(async () => {
    setLoading(true);
    try {
      let q = supabase
        .from('board_threads')
        .select('id, subject, title, body, alias, email, reply_count, is_deleted, created_at')
        .order('created_at', { ascending: false })
        .limit(100);
      if (!showDeleted) q = q.eq('is_deleted', false);
      const { data, error } = await q;
      if (error) throw error;
      setThreads((data || []) as BoardThreadRow[]);
    } catch (err) {
      errorLogger.error(err, { component: 'BoardManager', action: 'fetch threads' });
      toast.error('Failed to load board threads');
    } finally {
      setLoading(false);
    }
  }, [showDeleted]);

  useEffect(() => {
    void fetchThreads();
  }, [fetchThreads]);

  const openThread = async (id: string) => {
    setSelectedId(id);
    try {
      const { data, error } = await supabase
        .from('board_replies')
        .select('id, thread_id, body, alias, email, is_deleted, created_at')
        .eq('thread_id', id)
        .order('created_at', { ascending: true });
      if (error) throw error;
      setReplies((data || []) as BoardReplyRow[]);
    } catch (err) {
      errorLogger.error(err, { component: 'BoardManager', action: 'fetch replies' });
    }
  };

  const setThreadDeleted = async (id: string, deleted: boolean) => {
    if (!window.confirm(deleted ? 'Delete this thread and hide its replies?' : 'Restore this thread?')) return;
    setBusyId(id);
    try {
      const { error } = await supabase.from('board_threads').update({ is_deleted: deleted }).eq('id', id);
      if (error) throw error;
      setThreads((prev) =>
        showDeleted
          ? prev.map((t) => (t.id === id ? { ...t, is_deleted: deleted } : t))
          : prev.filter((t) => t.id !== id)
      );
      if (deleted && selectedId === id) setSelectedId(null);
      toast.success(deleted ? 'Thread deleted' : 'Thread restored');
    } catch {
      toast.error('Action failed');
    } finally {
      setBusyId(null);
    }
  };

  const setReplyDeleted = async (id: string, deleted: boolean) => {
    if (!window.confirm(deleted ? 'Delete this reply?' : 'Restore this reply?')) return;
    setBusyId(id);
    try {
      const { error } = await supabase.from('board_replies').update({ is_deleted: deleted }).eq('id', id);
      if (error) throw error;
      setReplies((prev) =>
        prev.map((r) => (r.id === id ? { ...r, is_deleted: deleted } : r))
      );
      toast.success(deleted ? 'Reply deleted' : 'Reply restored');
    } catch {
      toast.error('Action failed');
    } finally {
      setBusyId(null);
    }
  };

  const filtered = threads.filter((t) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      t.title.toLowerCase().includes(q) ||
      t.body.toLowerCase().includes(q) ||
      t.alias.toLowerCase().includes(q) ||
      t.email.toLowerCase().includes(q)
    );
  });

  const selected = threads.find((t) => t.id === selectedId) || null;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" />
              Study Board ({filtered.length})
            </CardTitle>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search title, body, alias, email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 w-64"
                />
              </div>
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <Switch checked={showDeleted} onCheckedChange={setShowDeleted} />
                Deleted
              </label>
              <Button variant="outline" size="icon" onClick={() => void fetchThreads()}>
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">No threads found</p>
          ) : (
            <div className="space-y-2 max-h-[420px] overflow-y-auto">
              {filtered.map((t) => (
                <div
                  key={t.id}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                    selectedId === t.id ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'
                  } ${t.is_deleted ? 'opacity-60' : ''}`}
                >
                  <button onClick={() => void openThread(t.id)} className="flex-1 text-left min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-foreground truncate">{t.title}</span>
                      <Badge variant="outline" className="text-xs capitalize">{t.subject}</Badge>
                      {t.is_deleted && <Badge variant="destructive" className="text-xs">deleted</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {t.alias} · {t.email} · {t.reply_count} replies · {new Date(t.created_at).toLocaleDateString('en-NG')}
                    </p>
                  </button>
                  <ChevronRight
                    className="w-4 h-4 text-muted-foreground shrink-0 cursor-pointer"
                    onClick={() => void openThread(t.id)}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={busyId === t.id}
                    onClick={() => void setThreadDeleted(t.id, !t.is_deleted)}
                    aria-label={t.is_deleted ? 'Restore thread' : 'Delete thread'}
                  >
                    {t.is_deleted ? <RotateCcw className="w-4 h-4" /> : <Trash2 className="w-4 h-4 text-destructive" />}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {selected && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Replies · {selected.title}</CardTitle>
          </CardHeader>
          <CardContent>
            {replies.length === 0 ? (
              <p className="text-sm text-muted-foreground">No replies yet</p>
            ) : (
              <div className="space-y-2">
                {replies.map((r) => (
                  <div
                    key={r.id}
                    className={`flex items-start gap-3 p-3 rounded-xl border border-border ${r.is_deleted ? 'opacity-60' : ''}`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground break-words">{r.body}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {r.alias} · {r.email} {r.is_deleted && '· deleted'}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={busyId === r.id}
                      onClick={() => void setReplyDeleted(r.id, !r.is_deleted)}
                      aria-label={r.is_deleted ? 'Restore reply' : 'Delete reply'}
                    >
                      {r.is_deleted ? <RotateCcw className="w-4 h-4" /> : <Trash2 className="w-4 h-4 text-destructive" />}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
