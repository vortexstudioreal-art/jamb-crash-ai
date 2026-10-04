import { motion } from 'framer-motion';
import { BookOpen, User, Key } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  onGetStarted: () => void;
  hasAccess?: boolean;
}

export const Header = ({ onGetStarted }: HeaderProps) => {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate('/auth');
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50"
    >
      <div className="container flex items-center justify-between h-16">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg text-foreground">Jamb Crash AI</span>
        </div>

        <nav className="hidden md:flex items-center gap-8">
          <a href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Pricing
          </a>
          <a href="#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            How It Works
          </a>
        </nav>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => navigate('/redeem-pin')} className="gap-1">
            <Key className="w-4 h-4" />
            <span className="hidden sm:inline">Redeem PIN</span>
          </Button>
          <Button variant="outline" size="sm" onClick={handleLogin}>
            <User className="w-4 h-4 mr-1" />
            Login
          </Button>
          <Button variant="default" size="sm" onClick={onGetStarted}>
            View Plans
          </Button>
        </div>
      </div>
    </motion.header>
  );
};
