import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users } from 'lucide-react';

export const LiveCounter = () => {
  const [count, setCount] = useState(2847);

  useEffect(() => {
    // Simulate live counter updates
    const interval = setInterval(() => {
      setCount(prev => prev + Math.floor(Math.random() * 3));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="inline-flex items-center gap-3 px-5 py-3 rounded-full bg-card border border-border shadow-card"
    >
      <div className="badge-live">
        <Users className="w-4 h-4" />
        <span className="font-semibold">{count.toLocaleString()}</span>
      </div>
      <span className="text-sm text-muted-foreground">students preparing right now</span>
    </motion.div>
  );
};
