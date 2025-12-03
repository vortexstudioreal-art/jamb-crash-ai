import { Crown, Users } from 'lucide-react';

interface AdminBadgeProps {
  role?: 'owner' | 'collaborator' | null;
}

export const AdminBadge = ({ role = 'collaborator' }: AdminBadgeProps) => {
  const isOwner = role === 'owner';
  
  return (
    <span 
      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold shadow-lg ${
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
};
