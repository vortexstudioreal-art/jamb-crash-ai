import { startTransition } from 'react';import {
  Home, BookOpen, Sparkles, Trophy, User,
  Target, Zap, Play, Settings, LogOut, Shield
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DashboardTab } from '@/components/BottomNav';
import { GoogleAdSense } from '@/components/GoogleAdSense';

type QuickStartStep = 'quiz' | 'mock' | 'study-plan';

interface DesktopSidebarProps {
  active: DashboardTab;
  onChange: (tab: DashboardTab) => void;
  userName?: string;
  userEmail?: string;
  isOwner: boolean;
  isAdmin: boolean;
  userRole?: 'owner' | 'admin' | 'collaborator' | null;
  onSignOut: () => void;
  onNavigate?: (path: string) => void;
  onQuickStart?: (step: QuickStartStep) => void;
  hasAccess?: boolean;
}

const mainNav: { id: DashboardTab; label: string; Icon: typeof Home; description: string }[] = [
  { id: 'home', label: 'Dashboard', Icon: Home, description: 'Overview & quick actions' },
  { id: 'study', label: 'Study Hub', Icon: BookOpen, description: 'Subjects & materials' },
  { id: 'ai', label: 'AI Tutor', Icon: Sparkles, description: 'Ask anything' },
  { id: 'community', label: 'Community', Icon: Trophy, description: 'Leaderboard & chat' },
  { id: 'profile', label: 'Profile', Icon: User, description: 'Account & stats' },
];

export const DesktopSidebar = ({
  active,
  onChange,
  userName,
  userEmail,
  isOwner,
  isAdmin,
  userRole,
  onSignOut,
  onNavigate,
  onQuickStart,
  
}: DesktopSidebarProps) => {
  const displayName = userName?.split(' ')[0] || 'Champion';
  const initials = displayName.charAt(0).toUpperCase();
  const effectiveRole = isOwner ? 'owner' : userRole;

  return (
    <aside className="hidden md:flex flex-col w-[260px] lg:w-[280px] h-screen overflow-hidden border-r border-border bg-card/50 backdrop-blur-xl fixed left-0 top-0 z-40">
      {/* Logo & Brand */}
      <div className="px-5 py-5 border-b border-border shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
            <BookOpen className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-foreground leading-tight">Jamb Crash AI</h1>
            <p className="text-[11px] text-muted-foreground leading-tight">Your exam prep companion</p>
          </div>
        </div>
      </div>

      {/* User Card */}
      <div className="px-4 py-4 border-b border-border shrink-0">
        <div className="flex items-center gap-3 p-2 rounded-xl bg-muted/50">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-foreground truncate">{displayName}</p>
            <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
          </div>
          {effectiveRole && effectiveRole !== 'collaborator' && (
            <span className={cn(
              "px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide",
              effectiveRole === 'owner' && "bg-amber-500/20 text-amber-500",
              effectiveRole === 'admin' && "bg-blue-500/20 text-blue-500"
            )}>
              {effectiveRole}
            </span>
          )}
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 min-h-0 px-3 py-4 space-y-1 overflow-y-auto overscroll-contain sidebar-scroll [scrollbar-width:thin]">
        <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Navigation</p>
        {mainNav.map(({ id, label, Icon, description }) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => startTransition(() => onChange(id))}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200",
                isActive 
                  ? "bg-primary/10 text-primary shadow-sm" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <div className={cn(
                "w-9 h-9 rounded-lg flex items-center justify-center transition-colors shrink-0",
                isActive ? "bg-primary/20" : "bg-muted"
              )}>
                <Icon className={cn("w-4.5 h-4.5", isActive && "drop-shadow-[0_0_6px_hsl(var(--primary)/0.6)]")} />
              </div>
              <div className="min-w-0">
                <p className={cn("text-sm font-medium leading-tight", isActive && "font-semibold")}>{label}</p>
                <p className="text-[11px] text-muted-foreground leading-tight truncate">{description}</p>
              </div>
            </button>
          );
        })}

        {/* Quick Actions */}
        <p className="px-3 mt-5 mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Quick Start</p>
        <div className="grid grid-cols-2 gap-2 px-1">
          <button
            onClick={() => {
              onChange('home');
              onQuickStart?.('quiz');
            }}
            className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-border hover:border-primary/50 hover:bg-primary/5 transition-all"
          >
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Play className="w-4 h-4 text-primary" />
            </div>
            <span className="text-[11px] font-medium text-foreground">Full Quiz</span>
          </button>
          <button
            onClick={() => {
              onChange('home');
              onQuickStart?.('quiz');
            }}
            className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-border hover:border-yellow-500/50 hover:bg-yellow-500/5 transition-all"
          >
            <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center">
              <Zap className="w-4 h-4 text-yellow-500" />
            </div>
            <span className="text-[11px] font-medium text-foreground">Mini Quiz</span>
          </button>
          <button
            onClick={() => {
              onChange('home');
              onQuickStart?.('mock');
            }}
            className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-border hover:border-amber-500/50 hover:bg-amber-500/5 transition-all"
          >
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <Target className="w-4 h-4 text-amber-500" />
            </div>
            <span className="text-[11px] font-medium text-foreground">Mock CBT</span>
          </button>
          <button
            onClick={() => {
              onChange('home');
              onQuickStart?.('study-plan');
            }}
            className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-border hover:border-green-500/50 hover:bg-green-500/5 transition-all"
          >
            <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
              <Target className="w-4 h-4 text-green-500" />
            </div>
            <span className="text-[11px] font-medium text-foreground">Study Plan</span>
          </button>
        </div>
      </nav>

      {/* AdSense — Sidebar */}
      <div className="px-3 py-3 shrink-0">
        <GoogleAdSense className="rounded-xl overflow-hidden" />
      </div>

      {/* Bottom Actions */}
      <div className="px-3 py-3 border-t border-border space-y-1 shrink-0">
        {isAdmin && (
          <button
            onClick={() => onNavigate?.('/admin')}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <Shield className="w-4 h-4" />
            <span className="text-sm">Admin Panel</span>
          </button>
        )}
        <button
          onClick={() => onNavigate?.('/settings')}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <Settings className="w-4 h-4" />
          <span className="text-sm">Settings</span>
        </button>
        <button
          onClick={onSignOut}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-sm">Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
