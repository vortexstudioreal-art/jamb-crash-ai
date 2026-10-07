import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Plus, ArrowLeft, Send, Trash2, ImagePlus, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { checkClean, aliasFor } from '@/lib/moderation';
import { errorLogger } from '@/services/errorLogger';
import { cn } from '@/lib/utils';

interface BoardThread {
  id: string;
  subject: string;
  title: string;
  body: string;
  image_url: string | null;
  alias: string;
  reply_count: number;
  created_at: string;
}

interface BoardReply {
  id: string;
  thread_id: string;
  body: string;
  image_url: string | null;
  alias: string;
  created_at: string;
}

interface StudyBoardProps {
  userEmail: string;
  isAdmin: boolean;
  subjects: string[];
}

const SUBJECTS = ['general', 'english', 'mathematics', 'physics', 'chemistry', 'biology', 'literature', 'government', 'economics', 'crs', 'irs', 'geography', 'accounting', 'commerce', 'agricultural_science'];

const timeAgo = (iso: string): string => {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' });
};

export const StudyBoard = ({ userEmail, isAdmin, subjects }: StudyBoardProps) => {
  const [threads, setThreads] = useState<BoardThread[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [replies, setReplies] = useState<BoardReply[]>([]);
  const [loadingThread, setLoadingThread] = useState(false);
  const [showComposer, setShowComposer] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [threadSubject, setThreadSubject] = useState('general');
  const [image, setImage] = useState<File | null>(null);
  const [posting, setPosting] = useState(false);
  const [replyBody, setReplyBody] = useState('');
  const [replying, setReplying] = useState(false);

  const visibleSubjects = SUBJECTS.filter(
    (s) => s === 'general' || subjects.map((x) => x.toLowerCase()).includes(s)
  );

  const fetchThreads = useCallback(async () => {
    try {
      let q = supabase
        .from('board_threads')
        .select('id, subject, title, body, image_url, alias, reply_count, created_at')
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })
        .limit(50);
      if (filter !== 'all') q = q.eq('subject', filter);
      const { data, error } = await q;
      if (error) throw error;
      setThreads((data || []) as BoardThread[]);
    } catch (err) {
      errorLogger.error(err, { component: 'StudyBoard', action: 'fetch threads' });
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    setLoading(true);
    void fetchThreads();
  }, [fetchThreads]);

  // Live updates: any insert/delete refreshes the list
  useEffect(() => {
    const channel = supabase
      .channel('board-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'board_threads' }, () => fetchThreads())
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'board_replies' }, (payload) => {
        const row = payload.new as BoardReply;
        setReplies((prev) => (row.thread_id === selectedId ? [...prev, row] : prev));
        setThreads((prev) => prev.map((t) => (t.id === row.thread_id ? { ...t, reply_count: t.reply_count + 1 } : t)));
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchThreads, selectedId]);

  const openThread = async (id: string) => {
    setSelectedId(id);
    setLoadingThread(true);
    try {
      const { data, error } = await supabase
        .from('board_replies')
        .select('id, thread_id, body, image_url, alias, created_at')
        .eq('thread_id', id)
        .eq('is_deleted', false)
        .order('created_at', { ascending: true });
      if (error) throw error;
      setReplies((data || []) as BoardReply[]);
    } catch (err) {
      errorLogger.error(err, { component: 'StudyBoard', action: 'fetch replies' });
    } finally {
      setLoadingThread(false);
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image too large — 5MB max');
      return null;
    }
    const path = `${userEmail.toLowerCase()}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]+/g, '-')}`;
    const { error } = await supabase.storage.from('board-uploads').upload(path, file);
    if (error) {
      errorLogger.error(error, { component: 'StudyBoard', action: 'upload image' });
      toast.error('Image upload failed');
      return null;
    }
    return supabase.storage.from('board-uploads').getPublicUrl(path).data.publicUrl;
  };

  const postThread = async () => {
    if (!title.trim() || !body.trim()) {
      toast.error('Give your thread a title and details');
      return;
    }
    for (const text of [title, body]) {
      const check = checkClean(text);
      if (!check.ok) {
        toast.error(check.reason || 'Keep it clean ✌️');
        return;
      }
    }
    setPosting(true);
    try {
      let imageUrl: string | null = null;
      if (image) {
        imageUrl = await uploadImage(image);
        if (!imageUrl) {
          setPosting(false);
          return;
        }
      }
      const { error } = await supabase.from('board_threads').insert({
        subject: threadSubject,
        title: title.trim().slice(0, 120),
        body: body.trim().slice(0, 2000),
        image_url: imageUrl,
        alias: aliasFor(userEmail),
        email: userEmail.toLowerCase(),
      });
      if (error) throw error;
      toast.success('Posted anonymously 🎉');
      setTitle('');
      setBody('');
      setImage(null);
      setShowComposer(false);
      void fetchThreads();
    } catch (err) {
      errorLogger.error(err, { component: 'StudyBoard', action: 'post thread' });
      toast.error('Could not post. Try again.');
    } finally {
      setPosting(false);
    }
  };

  const postReply = async (threadId: string) => {
    if (!replyBody.trim()) return;
    const check = checkClean(replyBody);
    if (!check.ok) {
      toast.error(check.reason || 'Keep it clean ✌️');
      return;
    }
    setReplying(true);
    try {
      const { error } = await supabase.from('board_replies').insert({
        thread_id: threadId,
        body: replyBody.trim().slice(0, 1000),
        image_url: null,
        alias: aliasFor(userEmail),
        email: userEmail.toLowerCase(),
      });
      if (error) throw error;
      setReplyBody('');
    } catch (err) {
      errorLogger.error(err, { component: 'StudyBoard', action: 'post reply' });
      toast.error('Could not reply. Try again.');
    } finally {
      setReplying(false);
    }
  };

  const deleteThread = async (id: string) => {
    if (!window.confirm('Delete this thread and all its replies?')) return;
    const { error } = await supabase.from('board_threads').update({ is_deleted: true }).eq('id', id);
    if (error) {
      toast.error('Delete failed');
      return;
    }
    setThreads((prev) => prev.filter((t) => t.id !== id));
    if (selectedId === id) setSelectedId(null);
    toast.success('Thread deleted');
  };

  const deleteReply = async (id: string) => {
    if (!window.confirm('Delete this reply?')) return;
    const { error } = await supabase.from('board_replies').update({ is_deleted: true }).eq('id', id);
    if (error) {
      toast.error('Delete failed');
      return;
    }
    setReplies((prev) => prev.filter((r) => r.id !== id));
    toast.success('Reply deleted');
  };

  const selected = threads.find((t) => t.id === selectedId) || null;

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-primary" />
          <h3 className="font-bold text-foreground">Study Board</h3>
        </div>
        {!selected && (
          <Button size="sm" onClick={() => setShowComposer((v) => !v)} className="gap-1">
            <Plus className="w-4 h-4" />
            New Thread
          </Button>
        )}
      </div>
      <p className="text-xs text-muted-foreground mb-4">
        Anonymous Q&A — post JAMB questions, get help. Keep it clean; admins remove anything shady.
      </p>

      {selected ? (
        <div>
          <button
            onClick={() => setSelectedId(null)}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-3"
          >
            <ArrowLeft className="w-4 h-4" />
            All threads
          </button>
          <div className="rounded-xl border border-border p-4 mb-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <Badge variant="secondary" className="capitalize mb-1">{selected.subject.replace('_', ' ')}</Badge>
                <h4 className="font-bold text-foreground">{selected.title}</h4>
                <p className="text-xs text-muted-foreground mt-0.5">{selected.alias} · {timeAgo(selected.created_at)}</p>
              </div>
              {isAdmin && (
                <Button size="icon" variant="ghost" onClick={() => void deleteThread(selected.id)} aria-label="Delete thread">
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              )}
            </div>
            <p className="text-sm text-foreground mt-2 whitespace-pre-wrap">{selected.body}</p>
            {selected.image_url && (
              <img src={selected.image_url} alt="Thread attachment" className="mt-3 max-w-full rounded-lg border border-border max-h-80" />
            )}
          </div>

          {loadingThread ? (
            <p className="text-sm text-muted-foreground py-4 text-center">Loading replies…</p>
          ) : (
            <div className="space-y-2 mb-3">
              {replies.map((r) => (
                <div key={r.id} className="rounded-xl bg-muted/40 border border-border/60 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs text-muted-foreground">{r.alias} · {timeAgo(r.created_at)}</p>
                    {isAdmin && (
                      <button onClick={() => void deleteReply(r.id)} aria-label="Delete reply" className="text-muted-foreground hover:text-destructive">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-foreground mt-1 whitespace-pre-wrap">{r.body}</p>
                </div>
              ))}
              {replies.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-3">No replies yet — be the first to help 👇</p>
              )}
            </div>
          )}

          <div className="flex gap-2">
            <Input
              value={replyBody}
              onChange={(e) => setReplyBody(e.target.value)}
              placeholder={`Reply as ${aliasFor(userEmail)}…`}
              maxLength={1000}
              onKeyDown={(e) => {
                if (e.key === 'Enter') void postReply(selected.id);
              }}
            />
            <Button size="icon" onClick={() => void postReply(selected.id)} disabled={replying || !replyBody.trim()} aria-label="Send reply">
              {replying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      ) : (
        <div>
          {showComposer && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-primary/30 bg-primary/5 p-4 mb-4 space-y-3">
              <div className="flex gap-2">
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Thread title (e.g. Osmosis vs diffusion?)"
                  maxLength={120}
                  className="flex-1"
                />
                <select
                  value={threadSubject}
                  onChange={(e) => setThreadSubject(e.target.value)}
                  className="rounded-md border border-input bg-background px-2 text-sm"
                  aria-label="Subject"
                >
                  {visibleSubjects.map((s) => (
                    <option key={s} value={s} className="capitalize">{s.replace('_', ' ')}</option>
                  ))}
                </select>
              </div>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Explain the question or what you're stuck on…"
                maxLength={2000}
                rows={3}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1 text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                  <ImagePlus className="w-4 h-4" />
                  {image ? image.name.slice(0, 24) : 'Add image (optional, 5MB max)'}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => setImage(e.target.files?.[0] || null)}
                  />
                </label>
                {image && (
                  <button onClick={() => setImage(null)} aria-label="Remove image" className="text-muted-foreground hover:text-destructive">
                    <X className="w-4 h-4" />
                  </button>
                )}
                <div className="flex-1" />
                <Button size="sm" onClick={postThread} disabled={posting}>
                  {posting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Post'}
                </Button>
              </div>
            </motion.div>
          )}

          <div className="flex gap-1.5 overflow-x-auto pb-2 mb-3">
            {['all', ...visibleSubjects].map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={cn(
                  'px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap border transition-colors capitalize',
                  filter === s
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-border text-muted-foreground hover:text-foreground'
                )}
              >
                {s.replace('_', ' ')}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="space-y-2">
              <div className="h-16 rounded-xl bg-muted/50 animate-pulse" />
              <div className="h-16 rounded-xl bg-muted/50 animate-pulse" />
            </div>
          ) : threads.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              No threads yet{filter !== 'all' ? ` for ${filter.replace('_', ' ')}` : ''} — start the first one 👆
            </p>
          ) : (
            <div className="space-y-2">
              {threads.map((t) => (
                <button
                  key={t.id}
                  onClick={() => void openThread(t.id)}
                  className="w-full text-left rounded-xl border border-border p-3 hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-foreground truncate">{t.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {t.alias} · {timeAgo(t.created_at)} · 💬 {t.reply_count}
                      </p>
                    </div>
                    <Badge variant="secondary" className="capitalize shrink-0">{t.subject.replace('_', ' ')}</Badge>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
