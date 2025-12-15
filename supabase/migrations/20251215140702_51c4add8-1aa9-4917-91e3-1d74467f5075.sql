-- Normalize IRS subject key to match app subject ids
UPDATE public.jamb_syllabus
SET subject = 'irs'
WHERE subject = 'Islamic Religious Studies';
