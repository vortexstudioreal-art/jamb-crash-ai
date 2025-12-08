import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { BookOpen, LogOut, Settings, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AdminBadge } from './AdminBadge';

interface DashboardHeaderProps {
  userEmail: string;
  isOwner: boolean;
  isCollaborator: boolean;
  userRole?: 'owner' | 'admin' | 'collaborator' | null;
  onSignOut: () => void;
}

export const DashboardHeader = ({ 
  userEmail, 
  isOwner, 
  isCollaborator, 
  userRole,
  onSignOut 
}: DashboardHeaderProps) => {
  const navigate = useNavigate();
  
  // Determine the effective role for badge display
  const effectiveRole = isOwner ? 'owner' : (isCollaborator ? 'collaborator' : userRole);
  const showAdminButton = isOwner || isCollaborator;

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border"
    >
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg text-foreground">JAMB 48hr</span>
        </div>

        {/* Center - Role Badge */}
        <div className="hidden md:flex items-center gap-2">
          <AdminBadge 
            role={effectiveRole} 
            linkToAdmin={false} 
          />
        </div>

        {/* Right - Actions */}
        <div className="flex items-center gap-2">
          {/* Admin Panel Button - Only for owner/collaborator */}
          {showAdminButton && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/admin')}
              className="text-primary hover:text-primary hover:bg-primary/10"
              title="Admin Panel"
            >
              <Shield className="w-5 h-5" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/settings')}
            className="text-muted-foreground hover:text-foreground"
          >
            <Settings className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onSignOut}
            className="text-muted-foreground hover:text-foreground gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sign Out</span>
          </Button>
        </div>
      </div>
    </motion.header>
  );
};
