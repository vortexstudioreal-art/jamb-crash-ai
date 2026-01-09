import { useState, useEffect } from 'react';
import { Crown, Users, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface AdminBadgeProps {
  role?: 'owner' | 'admin' | 'collaborator' | null;
  linkToAdmin?: boolean;
  customTitle?: string | null;
}

export const AdminBadge = ({ role, linkToAdmin = false, customTitle }: AdminBadgeProps) => {
  const [displayTitle, setDisplayTitle] = useState<string | null>(customTitle || null);
  
  // Fetch display_title from database for collaborators (self-updating)
  useEffect(() => {
    if (role !== 'collaborator') return;
    if (customTitle) {
      setDisplayTitle(customTitle);
      return;
    }
    
    const fetchTitle = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const { data } = await supabase
        .from('user_roles')
        .select('display_title')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (data?.display_title) {
        setDisplayTitle(data.display_title);
      }
    };
    
    fetchTitle();
  }, [role, customTitle]);
  
  // Don't render badge if no role is assigned
  if (!role) return null;
  
  const isOwner = role === 'owner';
  const isAdmin = role === 'admin';
  const isCollaborator = role === 'collaborator';
  
  const getBadgeStyles = () => {
    if (isOwner) return 'bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 text-black shadow-yellow-400/50';
    if (isAdmin) return 'bg-gradient-to-r from-blue-400 to-indigo-500 text-white shadow-blue-400/50';
    // Purple/pink badge for collaborator
    return 'bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 text-white shadow-purple-400/50';
  };

  const getBadgeLabel = () => {
    if (isOwner) return 'Owner';
    if (isAdmin) return 'Admin';
    // Use custom title for collaborators if provided, otherwise default to "Collaborator"
    return displayTitle || 'Collaborator';
  };

  const getIcon = () => {
    if (isOwner) return <Crown className="w-3.5 h-3.5" />;
    if (isAdmin) return <Shield className="w-3.5 h-3.5" />;
    return <Users className="w-3.5 h-3.5" />;
  };

  const content = (
    <span 
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold shadow-lg cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-xl ${getBadgeStyles()}`}
    >
      {getIcon()}
      {getBadgeLabel()}
    </span>
  );

  if (linkToAdmin) {
    return <Link to="/admin">{content}</Link>;
  }

  return content;
};