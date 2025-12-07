import { motion } from 'framer-motion';
import { BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
interface HeaderProps {
  onGetStarted: () => void;
  hasAccess?: boolean;
}
export const Header = ({
  onGetStarted,
  hasAccess
}: HeaderProps) => {
  return <motion.header initial={{
    opacity: 0,
    y: -20
  }} animate={{
    opacity: 1,
    y: 0
  }} className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
      <div className="container flex items-center justify-between h-16">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg text-foreground">JAMB 48hr</span>
        </div>

        

        {/* Get Started always visible - scrolls to pricing */}
        
      </div>
    </motion.header>;
};