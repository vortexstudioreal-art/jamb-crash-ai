import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Upload, ExternalLink, Trash2, FileText, BookOpen, Plus, Link as LinkIcon, Loader2 } from 'lucide-react';

interface NovelRow {
  id: string;
  title: string;
  author: string;
  full_book_pdf_url: string | null;
  full_book_pdf_path: string | null;
}

interface SubjectBookRow {
  id: string;
  subject: string;
  title: string;
  author: string | null;
  pdf_url: string | null;
  pdf_path: string | null;
  is_active: boolean;
}

const SUBJECTS = [
  'English Language', 'Mathematics', 'Physics', 'Chemistry', 'Biology',
  'Literature in English', 'Government', 'Economics', 'Geography', 'History',
  'Christian Religious Studies', 'Islamic Religious Studies', 'Commerce',
  'Accounting', 'Agricultural Science',
];

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 60) || 'book';

export const BookPdfManager = () => {
  const [novels, setNovels] = useState<NovelRow[]>([]);
  const [subjectBooks, setSubjectBooks] = useState<SubjectBookRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingFor, setUploadingFor] = useState<string | null>(null);

  // Subject-book create form
  const [newSubject, setNewSubject] = useState<string>('Mathematics');
  const [newTitle, setNewTitle] = useState('');
  const [newAuthor, setNewAuthor] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    const [{ data: n }, { data: sb }] = await Promise.all([
      supabase.from('novels').select('id,title,author,full_book_pdf_url,full_book_pdf_path').order('title'),
      supabase.from('subject_books').select('id,subject,title,author,pdf_url,pdf_path,is_active').order('subject'),
    ]);
    setNovels((n as NovelRow[]) || []);
    setSubjectBooks((sb as SubjectBookRow[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const uploadFile = async (
    file: File,
    folder: 'novels' | 'subjects',
    keyHint: string,
  ): Promise<string | null> => {
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      toast.error('Only PDF files allowed');
      return null;
    }
    if (file.size > 50 * 1024 * 1024) {
      toast.error('Max 50 MB');
      return null;
    }
    const path = `${folder}/${slugify(keyHint)}-${Date.now()}.pdf`;
    const { error } = await supabase.storage.from('book-pdfs').upload(path, file, {
      contentType: 'application/pdf',
      upsert: false,
    });
    if (error) {
      toast.error('Upload failed: ' + error.message);
      return null;
    }
    return path;
  };

  const handleNovelUpload = async (novel: NovelRow, file: File) => {
    setUploadingFor(novel.id);
    const path = await uploadFile(file, 'novels', novel.title);
    if (path) {
      const { error } = await supabase
        .from('novels')
        .update({ full_book_pdf_path: path, full_book_pdf_url: null })
        .eq('id', novel.id);
      if (error) toast.error(error.message);
      else { toast.success('PDF uploaded'); fetchAll(); }
    }
    setUploadingFor(null);
  };

  const handleNovelUrl = async (novel: NovelRow) => {
    const url = window.prompt('Paste public PDF URL for: ' + novel.title, novel.full_book_pdf_url || '');
    if (url === null) return;
    const trimmed = url.trim();
    const { error } = await supabase
      .from('novels')
      .update({ full_book_pdf_url: trimmed || null })
      .eq('id', novel.id);
    if (error) toast.error(error.message);
    else { toast.success(trimmed ? 'URL saved' : 'URL cleared'); fetchAll(); }
  };

  const handleNovelClear = async (novel: NovelRow) => {
    if (!window.confirm('Remove the full-book PDF link for ' + novel.title + '?')) return;
    if (novel.full_book_pdf_path) {
      await supabase.storage.from('book-pdfs').remove([novel.full_book_pdf_path]);
    }
    const { error } = await supabase
      .from('novels')
      .update({ full_book_pdf_path: null, full_book_pdf_url: null })
      .eq('id', novel.id);
    if (error) toast.error(error.message);
    else { toast.success('Cleared'); fetchAll(); }
  };

  const createSubjectBook = async (file?: File) => {
    if (!newTitle.trim()) { toast.error('Title required'); return; }
    if (!file && !newUrl.trim()) { toast.error('Upload a PDF or paste a URL'); return; }
    setCreating(true);
    let pdf_path: string | null = null;
    if (file) {
      pdf_path = await uploadFile(file, 'subjects', `${newSubject}-${newTitle}`);
      if (!pdf_path) { setCreating(false); return; }
    }
    const { error } = await supabase.from('subject_books').insert({
      subject: newSubject,
      title: newTitle.trim(),
      author: newAuthor.trim() || null,
      pdf_url: file ? null : newUrl.trim(),
      pdf_path,
      is_active: true,
    });
    if (error) toast.error(error.message);
    else {
      toast.success('Book added');
      setNewTitle(''); setNewAuthor(''); setNewUrl('');
      fetchAll();
    }
    setCreating(false);
  };

  const toggleActive = async (book: SubjectBookRow) => {
    const { error } = await supabase
      .from('subject_books')
      .update({ is_active: !book.is_active })
      .eq('id', book.id);
    if (error) toast.error(error.message); else fetchAll();
  };

  const deleteSubjectBook = async (book: SubjectBookRow) => {
    if (!window.confirm('Delete ' + book.title + '?')) return;
    if (book.pdf_path) {
      await supabase.storage.from('book-pdfs').remove([book.pdf_path]);
    }
    const { error } = await supabase.from('subject_books').delete().eq('id', book.id);
    if (error) toast.error(error.message); else { toast.success('Deleted'); fetchAll(); }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" />
          Book PDFs
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 rounded-md border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-300">
          ⚠️ Only upload PDFs you legally own or that are public-domain (e.g. archive.org). Most current JAMB prescribed novels are still in copyright.
        </div>

        <Tabs defaultValue="novels">
          <TabsList>
            <TabsTrigger value="novels">Novels ({novels.length})</TabsTrigger>
            <TabsTrigger value="subjects">Subject Books ({subjectBooks.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="novels" className="space-y-2">
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading…</p>
            ) : novels.length === 0 ? (
              <p className="text-sm text-muted-foreground">No novels yet.</p>
            ) : (
              novels.map((n) => <NovelRowItem
                key={n.id}
                novel={n}
                uploading={uploadingFor === n.id}
                onUpload={(f) => handleNovelUpload(n, f)}
                onUrl={() => handleNovelUrl(n)}
                onClear={() => handleNovelClear(n)}
              />)
            )}
          </TabsContent>

          <TabsContent value="subjects" className="space-y-4">
            <div className="rounded-lg border bg-muted/30 p-3 space-y-2">
              <p className="text-sm font-medium flex items-center gap-2">
                <Plus className="w-4 h-4" /> Add subject book
              </p>
              <div className="grid sm:grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">Subject</Label>
                  <Select value={newSubject} onValueChange={setNewSubject}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {SUBJECTS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Title</Label>
                  <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="e.g. New General Mathematics SS1" />
                </div>
                <div>
                  <Label className="text-xs">Author (optional)</Label>
                  <Input value={newAuthor} onChange={(e) => setNewAuthor(e.target.value)} placeholder="M.F. Macrae" />
                </div>
                <div>
                  <Label className="text-xs">External PDF URL (optional)</Label>
                  <Input value={newUrl} onChange={(e) => setNewUrl(e.target.value)} placeholder="https://archive.org/...pdf" />
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                <label>
                  <input
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    disabled={creating}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) createSubjectBook(f);
                      e.target.value = '';
                    }}
                  />
                  <Button asChild size="sm" disabled={creating}>
                    <span><Upload className="w-4 h-4 mr-2" />Upload PDF & save</span>
                  </Button>
                </label>
                <Button size="sm" variant="outline" onClick={() => createSubjectBook()} disabled={creating}>
                  {creating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <LinkIcon className="w-4 h-4 mr-2" />}
                  Save URL only
                </Button>
              </div>
            </div>

            {loading ? (
              <p className="text-sm text-muted-foreground">Loading…</p>
            ) : subjectBooks.length === 0 ? (
              <p className="text-sm text-muted-foreground">No subject books yet.</p>
            ) : (
              <div className="space-y-2">
                {subjectBooks.map((b) => (
                  <div key={b.id} className="flex items-center justify-between gap-2 rounded-md border bg-card p-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="secondary" className="text-xs">{b.subject}</Badge>
                        {!b.is_active && <Badge variant="outline" className="text-xs">Hidden</Badge>}
                        {b.pdf_path && <Badge className="text-xs">Uploaded</Badge>}
                        {b.pdf_url && <Badge variant="outline" className="text-xs">External URL</Badge>}
                      </div>
                      <p className="font-medium truncate">{b.title}</p>
                      {b.author && <p className="text-xs text-muted-foreground truncate">{b.author}</p>}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button size="sm" variant="ghost" onClick={() => toggleActive(b)}>
                        {b.is_active ? 'Hide' : 'Show'}
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => deleteSubjectBook(b)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

const NovelRowItem = ({
  novel, uploading, onUpload, onUrl, onClear,
}: {
  novel: NovelRow;
  uploading: boolean;
  onUpload: (f: File) => void;
  onUrl: () => void;
  onClear: () => void;
}) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const has = !!(novel.full_book_pdf_path || novel.full_book_pdf_url);
  return (
    <div className="flex items-center justify-between gap-2 rounded-md border bg-card p-3">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          {novel.full_book_pdf_path && <Badge className="text-xs">Uploaded</Badge>}
          {novel.full_book_pdf_url && <Badge variant="outline" className="text-xs">External URL</Badge>}
          {!has && <Badge variant="outline" className="text-xs">No PDF</Badge>}
        </div>
        <p className="font-medium truncate">{novel.title}</p>
        <p className="text-xs text-muted-foreground truncate">{novel.author}</p>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <input
          ref={fileRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onUpload(f);
            e.target.value = '';
          }}
        />
        <Button size="sm" variant="outline" disabled={uploading} onClick={() => fileRef.current?.click()}>
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
        </Button>
        <Button size="sm" variant="outline" onClick={onUrl}>
          <LinkIcon className="w-4 h-4" />
        </Button>
        {has && (
          <Button size="sm" variant="ghost" onClick={onClear}>
            <Trash2 className="w-4 h-4 text-destructive" />
          </Button>
        )}
      </div>
    </div>
  );
};