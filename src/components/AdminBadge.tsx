import { Crown, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

interface AdminBadgeProps {
  role?: 'owner' | 'admin' | 'collaborator' | null;
  linkToAdmin?: boolean;
}

export const AdminBadge = ({ role = 'collaborator', linkToAdmin = false }: AdminBadgeProps) => {
  const isOwner = role === 'owner';
  const isAdmin = role === 'admin';
  
  const getBadgeStyles = () => {
    if (isOwner) return 'bg-gradient-to-r from-yellow-400 to-amber-500 text-black';
    if (isAdmin) return 'bg-gradient-to-r from-blue-400 to-indigo-500 text-white';
    // Silver badge for collaborator
    return 'bg-gradient-to-r from-gray-300 to-slate-400 text-gray-800';
  };

  const getBadgeLabel = () => {
    if (isOwner) return 'Owner';
    if (isAdmin) return 'Admin';
    return 'Collaborator';
  };

  const content = (
    <span 
      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold shadow-lg cursor-pointer transition-transform hover:scale-105 ${getBadgeStyles()}`}
    >
      {isOwner ? (
        <Crown className="w-3.5 h-3.5" />
      ) : (
        <Users className="w-3.5 h-3.5" />
      )}
      {getBadgeLabel()}
    </span>
  );

  if (linkToAdmin) {
    return <Link to="/admin">{content}</Link>;
  }

  return content;
};
