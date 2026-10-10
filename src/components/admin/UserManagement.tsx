import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, Search, Crown, Shield, User, Clock, 
  CreditCard, RefreshCw, ChevronDown, Check, AlertCircle, UserMinus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { errorLogger } from '@/services/errorLogger';

interface UserData {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string | null;
  role: 'owner' | 'admin' | 'collaborator' | null;
  subscription: {
    package: string | null;
    status: string | null;
    expires_at: string | null;
  };
  trial: {
    used: boolean;
    active: boolean;
    expires_at: string | null;
  };
}

interface UserManagementProps {
  isOwner: boolean;
}

export const UserManagement = ({ isOwner }: UserManagementProps) => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingUser, setUpdatingUser] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Fetch all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, full_name, created_at')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch user roles
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      // Fetch payments
      const { data: payments, error: paymentsError } = await supabase
        .from('payments')
        .select('email, package, status, access_expires_at')
        .eq('status', 'success')
        .order('created_at', { ascending: false });

      if (paymentsError) throw paymentsError;

      // Fetch trials
      const { data: trials, error: trialsError } = await supabase
        .from('user_trials')
        .select('email, trial_used, trial_expires_at');

      if (trialsError) throw trialsError;

      // Merge data
      const userData: UserData[] = (profiles || []).map(profile => {
        const userRole = roles?.find(r => r.user_id === profile.id);
        const latestPayment = payments?.find(p => p.email === profile.email);
        const trial = trials?.find(t => t.email === profile.email);
        
        const now = new Date();
        const trialExpiry = trial?.trial_expires_at ? new Date(trial.trial_expires_at) : null;
        const isTrialActive = trialExpiry ? trialExpiry > now : false;

        return {
          id: profile.id,
          email: profile.email,
          full_name: profile.full_name,
          created_at: profile.created_at,
          role: userRole?.role as 'owner' | 'admin' | 'collaborator' | null,
          subscription: {
            package: latestPayment?.package || null,
            status: latestPayment?.status || null,
            expires_at: latestPayment?.access_expires_at || null,
          },
          trial: {
            used: trial?.trial_used || false,
            active: isTrialActive,
            expires_at: trial?.trial_expires_at || null,
          },
        };
      });

      setUsers(userData);
    } catch (error) {
      errorLogger.error(error, { component: 'UserManagement', action: 'fetch users' });
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const updateUserPlan = async (userEmail: string, newPlan: string) => {
    if (!isOwner) {
      toast.error('Only owner can update user plans');
      return;
    }

    setUpdatingUser(userEmail);
    try {
      // Server-side grant (owner-only edge function): client inserts into
      // payments are denied by RLS, so the grant must come from the server.
      const { data, error } = await supabase.functions.invoke('admin-grant', {
        body: { email: userEmail, package: newPlan },
      });
      if (error || !data?.success) {
        throw new Error(
          (data && typeof data.error === 'string' && data.error) || 'Grant failed'
        );
      }

      toast.success(`User upgraded to ${newPlan} plan!`);
      await fetchUsers();
    } catch (error) {
      errorLogger.error(error, { component: 'UserManagement', action: 'update user plan' });
      toast.error('Failed to update user plan');
    } finally {
      setUpdatingUser(null);
    }
  };

  const updateUserRole = async (userId: string, userEmail: string, newRole: 'admin' | 'collaborator' | null) => {
    if (!isOwner) {
      toast.error('Only owner can change user roles');
      return;
    }

    setUpdatingUser(userEmail);
    try {
      if (newRole === null) {
        // Remove role
        const { error } = await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', userId);

        if (error) throw error;
        toast.success('Role removed successfully');
      } else {
        // Check if role exists
        const { data: existingRole } = await supabase
          .from('user_roles')
          .select('id')
          .eq('user_id', userId)
          .maybeSingle();

        if (existingRole) {
          // Update existing role
          const { error } = await supabase
            .from('user_roles')
            .update({ role: newRole })
            .eq('user_id', userId);

          if (error) throw error;
        } else {
          // Insert new role
          const { error } = await supabase
            .from('user_roles')
            .insert({ user_id: userId, role: newRole });

          if (error) throw error;
        }
        toast.success(`User is now a ${newRole}!`);
      }

      await fetchUsers();
    } catch (error) {
      errorLogger.error(error, { component: 'UserManagement', action: 'update user role' });
      toast.error('Failed to update user role');
    } finally {
      setUpdatingUser(null);
    }
  };

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRoleIcon = (role: string | null) => {
    switch (role) {
      case 'owner': return <Crown className="w-4 h-4 text-yellow-500" />;
      case 'admin': return <Shield className="w-4 h-4 text-blue-500" />;
      case 'collaborator': return <Users className="w-4 h-4 text-slate-400" />;
      default: return <User className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getSubscriptionBadge = (user: UserData) => {
    if (user.role) {
      return (
        <Badge variant="outline" className="bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-600 border-amber-500/30">
          Admin Access
        </Badge>
      );
    }

    if (user.subscription.package) {
      const now = new Date();
      const expiry = user.subscription.expires_at ? new Date(user.subscription.expires_at) : null;
      const isExpired = expiry && expiry < now;

      if (isExpired) {
        return (
          <Badge variant="outline" className="bg-red-500/20 text-red-600 border-red-500/30">
            Expired ({user.subscription.package})
          </Badge>
        );
      }

      const colors: Record<string, string> = {
        basic: 'bg-blue-500/20 text-blue-600 border-blue-500/30',
        pro: 'bg-purple-500/20 text-purple-600 border-purple-500/30',
        premium: 'bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-600 border-amber-500/30',
      };

      return (
        <Badge variant="outline" className={colors[user.subscription.package] || 'bg-primary/20 text-primary'}>
          {user.subscription.package.charAt(0).toUpperCase() + user.subscription.package.slice(1)}
        </Badge>
      );
    }

    if (user.trial.active) {
      return (
        <Badge variant="outline" className="bg-green-500/20 text-green-600 border-green-500/30">
          <Clock className="w-3 h-3 mr-1" />
          Trial Active
        </Badge>
      );
    }

    if (user.trial.used) {
      return (
        <Badge variant="outline" className="bg-muted text-muted-foreground border-border">
          Trial Expired
        </Badge>
      );
    }

    return (
      <Badge variant="outline" className="bg-muted text-muted-foreground border-border">
        No Plan
      </Badge>
    );
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-NG', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  // Stats
  const totalUsers = users.length;
  const paidUsers = users.filter(u => u.subscription.package && !u.role).length;
  const trialUsers = users.filter(u => u.trial.active && !u.subscription.package && !u.role).length;
  const adminUsers = users.filter(u => u.role).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{totalUsers}</p>
                <p className="text-xs text-muted-foreground">Total Users</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{paidUsers}</p>
                <p className="text-xs text-muted-foreground">Paid Users</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{trialUsers}</p>
                <p className="text-xs text-muted-foreground">Active Trials</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                <Crown className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{adminUsers}</p>
                <p className="text-xs text-muted-foreground">Admins</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and User List */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              All Users
            </CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-64"
                />
              </div>
              <Button variant="outline" size="icon" onClick={fetchUsers}>
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-2 text-muted-foreground font-medium">User</th>
                  <th className="text-left py-3 px-2 text-muted-foreground font-medium">Role</th>
                  <th className="text-left py-3 px-2 text-muted-foreground font-medium">Subscription</th>
                  <th className="text-left py-3 px-2 text-muted-foreground font-medium">Joined</th>
                  {isOwner && (
                    <th className="text-right py-3 px-2 text-muted-foreground font-medium">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <motion.tr 
                    key={user.id} 
                    className="border-b border-border/50 hover:bg-muted/50"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                          {getRoleIcon(user.role)}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{user.full_name || 'No name'}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      {user.role ? (
                        <Badge variant="outline" className="capitalize">
                          {user.role}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">User</span>
                      )}
                    </td>
                    <td className="py-3 px-2">
                      {getSubscriptionBadge(user)}
                    </td>
                    <td className="py-3 px-2 text-muted-foreground">
                      {formatDate(user.created_at || '')}
                    </td>
                    {isOwner && (
                      <td className="py-3 px-2 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              disabled={updatingUser === user.email || user.role === 'owner'}
                            >
                              {updatingUser === user.email ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                              ) : (
                                <>
                                  Actions
                                  <ChevronDown className="w-4 h-4 ml-1" />
                                </>
                              )}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Change Role</DropdownMenuLabel>
                            <DropdownMenuItem 
                              onClick={() => updateUserRole(user.id, user.email, 'admin')}
                              disabled={user.role === 'admin'}
                            >
                              <Shield className="w-4 h-4 mr-2 text-blue-500" />
                              Make Admin
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => updateUserRole(user.id, user.email, 'collaborator')}
                              disabled={user.role === 'collaborator'}
                            >
                              <Users className="w-4 h-4 mr-2 text-slate-400" />
                              Make Collaborator
                            </DropdownMenuItem>
                            {user.role && user.role !== 'owner' && (
                              <DropdownMenuItem 
                                onClick={() => updateUserRole(user.id, user.email, null)}
                                className="text-red-600"
                              >
                                <UserMinus className="w-4 h-4 mr-2" />
                                Remove Role
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuLabel>Update Plan</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => updateUserPlan(user.email, 'basic')}>
                              <Check className="w-4 h-4 mr-2" />
                              Basic (1 year)
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateUserPlan(user.email, 'pro')}>
                              <Check className="w-4 h-4 mr-2" />
                              ACE (1 year)
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateUserPlan(user.email, 'premium')}>
                              <Crown className="w-4 h-4 mr-2" />
                              SCHOLAR (Forever)
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    )}
                  </motion.tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={isOwner ? 5 : 4} className="py-8 text-center text-muted-foreground">
                      <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      {searchQuery ? 'No users match your search' : 'No users found'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};