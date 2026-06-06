import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

const DEFAULT_DATE = new Date('2027-04-24T08:00:00Z');

export const useExamDate = () => {
  const [examDate, setExamDate] = useState<Date>(DEFAULT_DATE);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', 'jamb_exam_date')
        .maybeSingle();
      if (!cancelled && data?.value) {
        const raw = typeof data.value === 'string' ? data.value : (data.value as any);
        const parsed = new Date(raw);
        if (!isNaN(parsed.getTime())) setExamDate(parsed);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return { examDate, year: examDate.getFullYear() };
};
