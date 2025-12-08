import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

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

  // Owner bypasses all checks (verified server-side via user_roles table)
  if (isOwner) {
    return <>{children}</>;
  }

  // Not logged in - redirect to auth
  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Requires admin access (verified server-side)
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  // Requires paid access (verified server-side)
  if (requireAccess && !hasAccess) {
    return <Navigate to="/" state={{ showPaywall: true }} replace />;
  }

  return <>{children}</>;
};
