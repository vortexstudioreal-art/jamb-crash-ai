import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Edit2, Save, X, StickyNote, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BackButton } from '@/components/BackButton';
import { DashboardHeader } from '@/components/DashboardHeader';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface StudyNotesProps {
  userEmail: string;
  subjects: string[];
  isOwner?: boolean;
  isAdmin?: boolean;
  userRole?: string | null;
  onSignOut: () => void;
  onBack: () => void;
}

interface Note {
  id: string;
  title: string;
  content: string;
  subject: string | null;
  created_at: string;
  updated_at: string;
}

export const StudyNotes = ({ userEmail, subjects, isOwner, isAdmin, userRole, onSignOut, onBack }: StudyNotesProps) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newSubject, setNewSubject] = useState<string>('');
  const [filterSubject, setFilterSubject] = useState<string>('all');

  const loadNotes = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('user_notes')
      .select('*')
      .eq('email', userEmail)
      .order('updated_at', { ascending: false });

    if (!error && data) setNotes(data as Note[]);
    setLoading(false);
  }, [userEmail]);

  useEffect(() => {
    loadNotes();
  }, [userEmail, loadNotes]);

  const createNote = async () => {
    if (!newTitle.trim() && !newContent.trim()) {
      toast.error('Please add a title or content');
      return;
    }
    const { data, error } = await supabase
      .from('user_notes')
      .insert({
        email: userEmail,
        title: newTitle.trim() || 'Untitled Note',
        content: newContent.trim(),
        subject: newSubject || null,
      })
      .select()
      .single();

    if (error) {
      toast.error('Failed to save note');
      return;
    }
    setNotes(prev => [data as Note, ...prev]);
    setNewTitle('');
    setNewContent('');
    setNewSubject('');
    setIsCreating(false);
    toast.success('Note saved! 📝');
  };

  const updateNote = async (id: string, title: string, content: string) => {
    const { error } = await supabase
      .from('user_notes')
      .update({ title, content, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      toast.error('Failed to update');
      return;
    }
    setNotes(prev => prev.map(n => n.id === id ? { ...n, title, content, updated_at: new Date().toISOString() } : n));
    setEditingId(null);
    toast.success('Note updated!');
  };

  const deleteNote = async (id: string) => {
    const { error } = await supabase.from('user_notes').delete().eq('id', id);
    if (error) {
      toast.error('Failed to delete');
      return;
    }
    setNotes(prev => prev.filter(n => n.id !== id));
    toast.success('Note deleted');
  };

  const filtered = filterSubject === 'all' ? notes : notes.filter(n => n.subject === filterSubject);

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader
        userEmail={userEmail}
        isOwner={isOwner || false}
        isCollaborator={(isAdmin && !isOwner) || false}
        userRole={(userRole as 'owner' | 'admin' | 'collaborator' | null) || null}
        onSignOut={onSignOut}
      />
      <div className="pt-16">
        <BackButton onClick={onBack} />
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <StickyNote className="w-7 h-7 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">Study Notes</h1>
            </div>
            <Button onClick={() => setIsCreating(true)} className="gap-2" disabled={isCreating}>
              <Plus className="w-4 h-4" /> New Note
            </Button>
          </div>

          {/* Subject filter */}
          <div className="flex flex-wrap gap-2 mb-6">
            <Badge
              variant={filterSubject === 'all' ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setFilterSubject('all')}
            >
              All ({notes.length})
            </Badge>
            {subjects.map(s => {
              const count = notes.filter(n => n.subject === s).length;
              return (
                <Badge
                  key={s}
                  variant={filterSubject === s ? 'default' : 'outline'}
                  className="cursor-pointer capitalize"
                  onClick={() => setFilterSubject(s)}
                >
                  {s.replace('_', ' ')} ({count})
                </Badge>
              );
            })}
          </div>

          {/* Create form */}
          {isCreating && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="mb-6 border-primary/30">
                <CardContent className="pt-6 space-y-4">
                  <Input
                    placeholder="Note title..."
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                  />
                  <Textarea
                    placeholder="Write your notes here..."
                    value={newContent}
                    onChange={e => setNewContent(e.target.value)}
                    rows={6}
                  />
                  <div className="flex items-center gap-2">
                    <select
                      className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={newSubject}
                      onChange={e => setNewSubject(e.target.value)}
                    >
                      <option value="">No subject</option>
                      {subjects.map(s => (
                        <option key={s} value={s}>{s.replace('_', ' ')}</option>
                      ))}
                    </select>
                    <Button onClick={createNote} className="gap-2">
                      <Save className="w-4 h-4" /> Save
                    </Button>
                    <Button variant="ghost" onClick={() => { setIsCreating(false); setNewTitle(''); setNewContent(''); }}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Notes list */}
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">Loading notes...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">No notes yet. Create one to get started!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((note, i) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  isEditing={editingId === note.id}
                  onEdit={() => setEditingId(note.id)}
                  onSave={(title, content) => updateNote(note.id, title, content)}
                  onCancel={() => setEditingId(null)}
                  onDelete={() => deleteNote(note.id)}
                  delay={i * 0.05}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const NoteCard = ({ note, isEditing, onEdit, onSave, onCancel, onDelete, delay }: {
  note: Note;
  isEditing: boolean;
  onEdit: () => void;
  onSave: (title: string, content: string) => void;
  onCancel: () => void;
  onDelete: () => void;
  delay: number;
}) => {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);

  if (isEditing) {
    return (
      <Card className="border-primary/30">
        <CardContent className="pt-4 space-y-3">
          <Input value={title} onChange={e => setTitle(e.target.value)} />
          <Textarea value={content} onChange={e => setContent(e.target.value)} rows={5} />
          <div className="flex gap-2">
            <Button size="sm" onClick={() => onSave(title, content)} className="gap-1">
              <Save className="w-3 h-3" /> Save
            </Button>
            <Button size="sm" variant="ghost" onClick={onCancel}>Cancel</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
      <Card className="hover:border-primary/20 transition-colors">
        <CardContent className="pt-4">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-foreground truncate">{note.title || 'Untitled'}</h3>
                {note.subject && (
                  <Badge variant="secondary" className="text-xs capitalize shrink-0">
                    {note.subject.replace('_', ' ')}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground line-clamp-3 whitespace-pre-wrap">{note.content}</p>
              <p className="text-xs text-muted-foreground/60 mt-2">
                {new Date(note.updated_at).toLocaleDateString()}
              </p>
            </div>
            <div className="flex gap-1 ml-2 shrink-0">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onEdit}>
                <Edit2 className="w-3.5 h-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={onDelete}>
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
