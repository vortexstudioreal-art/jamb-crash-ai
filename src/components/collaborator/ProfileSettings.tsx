import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { User, Sparkles, RefreshCw } from 'lucide-react';
import { AdminBadge } from '@/components/AdminBadge';

interface ProfileSettingsProps {
  userId: string;
  userEmail: string;
}

export const ProfileSettings = ({ userId, userEmail }: ProfileSettingsProps) => {
  const [displayTitle, setDisplayTitle] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDisplayTitle();
  }, [userId]);

  const fetchDisplayTitle = async () => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('display_title')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;
      setDisplayTitle(data?.display_title || '');
    } catch (error) {
      console.error('Error fetching display title:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveDisplayTitle = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('user_roles')
        .update({ display_title: displayTitle.trim() || null })
        .eq('user_id', userId);

      if (error) throw error;
      toast.success('Badge title updated! 🎨');
    } catch (error) {
      console.error('Error saving display title:', error);
      toast.error('Failed to update badge title');
    } finally {
      setSaving(false);
    }
  };

  const suggestions = [
    'JAMB Tutor',
    'Study Partner',
    'Exam Coach',
    'Academic Guide',
  ];

  if (loading) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="p-6 flex items-center justify-center">
          <RefreshCw className="w-5 h-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <User className="w-5 h-5 text-primary" />
          Badge Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="displayTitle">Custom Badge Title</Label>
          <Input
            id="displayTitle"
            placeholder="Collaborator"
            value={displayTitle}
            onChange={(e) => setDisplayTitle(e.target.value)}
            maxLength={20}
            className="bg-background"
          />
          <p className="text-xs text-muted-foreground">
            This will be shown on your badge instead of "Collaborator"
          </p>
        </div>

        {/* Suggestions */}
        <div className="flex flex-wrap gap-2">
          {suggestions.map((suggestion) => (
            <Button
              key={suggestion}
              variant="outline"
              size="sm"
              onClick={() => setDisplayTitle(suggestion)}
              className="text-xs"
            >
              {suggestion}
            </Button>
          ))}
        </div>

        {/* Preview */}
        <div className="p-4 bg-muted/50 rounded-lg">
          <p className="text-xs text-muted-foreground mb-2">Preview:</p>
          <div className="flex items-center gap-2">
            <AdminBadge 
              role="collaborator" 
              customTitle={displayTitle || undefined}
            />
          </div>
        </div>

        <Button
          onClick={saveDisplayTitle}
          disabled={saving}
          className="w-full gap-2"
        >
          {saving ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          Save Badge Title
        </Button>
      </CardContent>
    </Card>
  );
};
