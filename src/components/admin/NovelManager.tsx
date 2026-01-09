import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { BookOpen, RefreshCw, Save, X, Edit2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface Novel {
  id: string;
  title: string;
  author: string;
  total_chapters: number | null;
  year: number | null;
  description: string | null;
  cover_image_url: string | null;
  category: string;
  difficulty_level: string | null;
}

export const NovelManager = () => {
  const [novels, setNovels] = useState<Novel[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingNovel, setEditingNovel] = useState<Novel | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchNovels();
  }, []);

  const fetchNovels = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('novels')
        .select('*')
        .order('title');

      if (error) throw error;
      setNovels(data || []);
    } catch (error) {
      console.error('Error fetching novels:', error);
      toast.error('Failed to load novels');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editingNovel) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('novels')
        .update({
          title: editingNovel.title,
          author: editingNovel.author,
          total_chapters: editingNovel.total_chapters,
          year: editingNovel.year,
          description: editingNovel.description,
          cover_image_url: editingNovel.cover_image_url,
          difficulty_level: editingNovel.difficulty_level,
        })
        .eq('id', editingNovel.id);

      if (error) throw error;

      toast.success('Novel updated successfully! 📚');
      setEditingNovel(null);
      fetchNovels();
    } catch (error) {
      console.error('Error updating novel:', error);
      toast.error('Failed to update novel');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" />
          Manage JAMB Novels ({novels.length})
        </h2>
        <Button variant="outline" size="sm" onClick={fetchNovels}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {novels.map((novel) => (
          <Card key={novel.id} className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-base line-clamp-1">{novel.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">by {novel.author}</p>
              <div className="flex gap-4 text-sm">
                <span className="text-muted-foreground">
                  Chapters: <span className="text-foreground font-medium">{novel.total_chapters || 'N/A'}</span>
                </span>
                <span className="text-muted-foreground">
                  Year: <span className="text-foreground font-medium">{novel.year || 'N/A'}</span>
                </span>
              </div>
              <div className="pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingNovel(novel)}
                  className="w-full gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit Info
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Modal */}
      <Dialog open={!!editingNovel} onOpenChange={() => setEditingNovel(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit2 className="w-5 h-5 text-primary" />
              Edit Novel
            </DialogTitle>
          </DialogHeader>

          {editingNovel && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={editingNovel.title}
                  onChange={(e) => setEditingNovel({ ...editingNovel, title: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="author">Author</Label>
                <Input
                  id="author"
                  value={editingNovel.author}
                  onChange={(e) => setEditingNovel({ ...editingNovel, author: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="chapters">Total Chapters</Label>
                  <Input
                    id="chapters"
                    type="number"
                    value={editingNovel.total_chapters || ''}
                    onChange={(e) => setEditingNovel({ 
                      ...editingNovel, 
                      total_chapters: e.target.value ? parseInt(e.target.value) : null 
                    })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="year">Publication Year</Label>
                  <Input
                    id="year"
                    type="number"
                    value={editingNovel.year || ''}
                    onChange={(e) => setEditingNovel({ 
                      ...editingNovel, 
                      year: e.target.value ? parseInt(e.target.value) : null 
                    })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="difficulty">Difficulty Level</Label>
                <Input
                  id="difficulty"
                  value={editingNovel.difficulty_level || ''}
                  onChange={(e) => setEditingNovel({ ...editingNovel, difficulty_level: e.target.value })}
                  placeholder="e.g., Intermediate"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={editingNovel.description || ''}
                  onChange={(e) => setEditingNovel({ ...editingNovel, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cover">Cover Image URL</Label>
                <Input
                  id="cover"
                  value={editingNovel.cover_image_url || ''}
                  onChange={(e) => setEditingNovel({ ...editingNovel, cover_image_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setEditingNovel(null)}
                  className="flex-1 gap-2"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 gap-2"
                >
                  {saving ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};