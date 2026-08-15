import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

// Fallback if app_settings has not been seeded yet
const DEFAULT_UTME_DATE = new Date('2027-04-24T08:00:00');

export const CountdownTimer = () => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [examDate, setExamDate] = useState<Date>(DEFAULT_UTME_DATE);
  const [hasPassed, setHasPassed] = useState(false);

  // Fetch admin-editable exam date from app_settings
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', 'jamb_exam_date')
        .maybeSingle();
      if (!cancelled && data?.value) {
        const raw = String(data.value);
        const parsed = new Date(raw);
        if (!isNaN(parsed.getTime())) setExamDate(parsed);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = examDate.getTime() - new Date().getTime();

      if (difference > 0) {
        setHasPassed(false);
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        // Clamp — never show negative
        setHasPassed(true);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [examDate]);

  const timeUnits = [
    { label: 'Days', value: timeLeft.days },
    { label: 'Hours', value: timeLeft.hours },
    { label: 'Mins', value: timeLeft.minutes },
    { label: 'Secs', value: timeLeft.seconds },
  ];

  if (hasPassed) {
    return (
      <div className="text-center py-4">
        <p className="text-lg md:text-2xl font-semibold text-foreground">
          🎓 JAMB UTME is here — best of luck!
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          A new countdown will start once the next exam date is set.
        </p>
      </div>
    );
  }

  return (
    <div className="flex justify-center gap-3 md:gap-6">
      {timeUnits.map((unit, index) => (
        <motion.div
          key={unit.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="flex flex-col items-center"
        >
          <div className="card-elevated min-w-[70px] md:min-w-[100px] py-4 md:py-6 text-center">
            <span className="countdown-digit text-4xl md:text-6xl">
              {String(unit.value).padStart(2, '0')}
            </span>
          </div>
          <span className="mt-2 text-sm md:text-base font-medium text-muted-foreground">
            {unit.label}
          </span>
        </motion.div>
      ))}
    </div>
  );
};
