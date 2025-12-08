import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

// Bypass emails for admin access
const OWNER_EMAIL = 'saeedabdulbasit933@gmail.com';
const COLLABORATOR_EMAILS = [
  'loaborejim@gmail.com',
  'favourgoodnews@gmail.com',
  'onuchionwuegbusi@gmail.com',
  'muzzyothman@gmail.com',
  'muzzyothmam@gmail.com'
];
const BYPASS_EMAILS = [OWNER_EMAIL, ...COLLABORATOR_EMAILS];
const BYPASS_STORAGE_KEY = 'jamb_bypass_email';

// Helper to get bypass email from localStorage
const getBypassEmail = (): string | null => {
  const stored = localStorage.getItem(BYPASS_STORAGE_KEY);
  if (stored && BYPASS_EMAILS.includes(stored.toLowerCase())) {
    return stored.toLowerCase();
  }
  return null;
};

interface ProtectedRouteProps {
  children: ReactNode;
  requireAccess?: boolean;
  requireAdmin?: boolean;
}

export const ProtectedRoute = ({ 
  children, 
  requireAccess = false,
  requireAdmin = false 
}: ProtectedRouteProps) => {
  const { user, isLoading, hasAccess, isAdmin, isOwner } = useAuth();
  const location = useLocation();

  // Check for bypass user from localStorage
  const bypassEmail = getBypassEmail();
  const isBypassOwner = bypassEmail === OWNER_EMAIL;
  const isBypassCollaborator = COLLABORATOR_EMAILS.includes(bypassEmail || '');
  const isBypassUser = isBypassOwner || isBypassCollaborator;

  // Bypass users always have access
  if (isBypassUser) {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Owner bypasses all checks
  if (isOwner) {
    return <>{children}</>;
  }

  // Not logged in - redirect to auth
  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Requires admin access
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  // Requires paid access
  if (requireAccess && !hasAccess) {
    return <Navigate to="/" state={{ showPaywall: true }} replace />;
  }

  return <>{children}</>;
};
