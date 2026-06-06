import { motion } from 'framer-motion';
import { ArrowRight, Zap, Clock, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CountdownTimer } from './CountdownTimer';
import { useExamDate } from '@/hooks/useExamDate';
import { LiveCounter } from './LiveCounter';

interface HeroSectionProps {
  onGetStarted: () => void;
  hasAccess?: boolean;
  onSeeHowItWorks: () => void;
}

export const HeroSection = ({ onGetStarted, hasAccess, onSeeHowItWorks }: HeroSectionProps) => {
  const { year } = useExamDate();
  return (
    <section className="relative min-h-screen gradient-hero overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23008751' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }} />

      <div className="container relative pt-8 pb-16 md:pt-16 md:pb-24">
        {/* Live counter */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex justify-center mb-8"
        >
          <LiveCounter />
        </motion.div>

        {/* Main content */}
        <div className="text-center max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent text-accent-foreground text-sm font-medium mb-6"
          >
            <Zap className="w-4 h-4" />
            AI-Powered JAMB Preparation
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight"
          >
            Master JAMB in{' '}
            <span className="text-gradient">48 Hours</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto"
          >
            Upload your past questions, get AI-analyzed topics, personalized timetable, 
            and daily WhatsApp reminders. Score 300+ guaranteed.
          </motion.p>

          {/* CTA Buttons - Always visible, scrolls to pricing */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
          >
            <Button variant="hero" size="xl" onClick={onGetStarted}>
              Start Preparing Now
              <ArrowRight className="w-5 h-5" />
            </Button>
            <Button variant="outline" size="xl" onClick={onSeeHowItWorks}>
              See How It Works
            </Button>
          </motion.div>

          {/* Countdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <p className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wide">
              Time Until UTME 2026
            </p>
            <CountdownTimer />
          </motion.div>
        </div>

        {/* Features strip */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="mt-16 md:mt-24 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6"
        >
          {[
            { icon: BookOpen, title: '300+ Hot Questions', desc: 'Most likely to appear' },
            { icon: Clock, title: 'Personal Timetable', desc: 'Based on your schedule' },
            { icon: Zap, title: 'Daily Reminders', desc: 'Via WhatsApp' },
          ].map((feature, index) => (
            <div
              key={index}
              className="flex items-center gap-4 p-4 rounded-xl bg-card/50 border border-border/50"
            >
              <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center flex-shrink-0">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.desc}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
