import { Crown, Users, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

interface AdminBadgeProps {
  role?: 'owner' | 'admin' | 'collaborator' | null;
  linkToAdmin?: boolean;
}

export const AdminBadge = ({ role = 'collaborator', linkToAdmin = false }: AdminBadgeProps) => {
  const isOwner = role === 'owner';
  const isAdmin = role === 'admin';
  const isCollaborator = role === 'collaborator';
  
  const getBadgeStyles = () => {
    if (isOwner) return 'bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 text-black shadow-yellow-400/50';
    if (isAdmin) return 'bg-gradient-to-r from-blue-400 to-indigo-500 text-white shadow-blue-400/50';
    // Silver badge for collaborator
    return 'bg-gradient-to-r from-gray-300 via-slate-400 to-gray-500 text-gray-900 shadow-gray-400/50';
  };

  const getBadgeLabel = () => {
    if (isOwner) return 'Owner';
    if (isAdmin) return 'Admin';
    return 'Collaborator';
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
