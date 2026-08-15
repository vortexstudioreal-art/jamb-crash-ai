import { motion } from 'framer-motion';
import { startTransition } from 'react';
import { Home, BookOpen, Sparkles, Trophy, User } from 'lucide-react';
import { cn } from '@/lib/utils';

export type DashboardTab = 'home' | 'study' | 'ai' | 'community' | 'profile';

const items: { id: DashboardTab; label: string; Icon: typeof Home }[] = [
  { id: 'home', label: 'Home', Icon: Home },
  { id: 'study', label: 'Study', Icon: BookOpen },
  { id: 'ai', label: 'AI', Icon: Sparkles },
  { id: 'community', label: 'Community', Icon: Trophy },
  { id: 'profile', label: 'Profile', Icon: User },
];

interface BottomNavProps {
  active: DashboardTab;
  onChange: (tab: DashboardTab) => void;
}

export const BottomNav = ({ active, onChange }: BottomNavProps) => {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/95 backdrop-blur-lg md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      aria-label="Primary"
    >
      <div className="max-w-3xl mx-auto grid grid-cols-5 h-16">
        {items.map(({ id, label, Icon }) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => startTransition(() => onChange(id))}
              className={cn(
                'relative flex flex-col items-center justify-center gap-1 transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              {isActive && (
                <motion.span
                  layoutId="bottomnav-active"
                  className="absolute top-0 h-0.5 w-10 rounded-full bg-primary"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <Icon className={cn('w-5 h-5', isActive && 'drop-shadow-[0_0_6px_hsl(var(--primary)/0.6)]')} />
              <span className="text-[11px] font-medium leading-none">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};