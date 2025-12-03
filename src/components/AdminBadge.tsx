import { Crown, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

interface AdminBadgeProps {
  role?: 'owner' | 'collaborator' | null;
  linkToAdmin?: boolean;
}

export const AdminBadge = ({ role = 'collaborator', linkToAdmin = false }: AdminBadgeProps) => {
  const isOwner = role === 'owner';
  
  const content = (
    <span 
      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold shadow-lg cursor-pointer transition-transform hover:scale-105 ${
        isOwner 
          ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-black' 
          : 'bg-gradient-to-r from-amber-300 to-yellow-400 text-black'
      }`}
    >
      {isOwner ? (
        <>
          <Crown className="w-3.5 h-3.5" />
          Owner
        </>
      ) : (
        <>
          <Users className="w-3.5 h-3.5" />
          Collaborator
        </>
      )}
    </span>
  );

  if (linkToAdmin) {
    return <Link to="/admin">{content}</Link>;
  }

  return content;
};
