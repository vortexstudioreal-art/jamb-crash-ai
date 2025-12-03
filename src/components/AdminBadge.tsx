import { Shield } from 'lucide-react';

export const AdminBadge = () => {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-semibold">
      <Shield className="w-3 h-3" />
      Admin
    </span>
  );
};
