-- Add the remaining UTME subjects so past questions for them can be stored.
-- These are real JAMB UTME subjects that were missing from the enum:
--   Art, Computer Studies, French, History, Music
-- (Arabic, Hausa, Igbo, Yoruba and PHE are also UTME subjects, but their
-- values are added here too so the bank can accept them whenever content
-- for them turns up.)
--
-- ADD VALUE IF NOT EXISTS is safe to re-run.

ALTER TYPE public.jamb_subject ADD VALUE IF NOT EXISTS 'arabic';
ALTER TYPE public.jamb_subject ADD VALUE IF NOT EXISTS 'art';
ALTER TYPE public.jamb_subject ADD VALUE IF NOT EXISTS 'computer_studies';
ALTER TYPE public.jamb_subject ADD VALUE IF NOT EXISTS 'french';
ALTER TYPE public.jamb_subject ADD VALUE IF NOT EXISTS 'hausa';
ALTER TYPE public.jamb_subject ADD VALUE IF NOT EXISTS 'history';
ALTER TYPE public.jamb_subject ADD VALUE IF NOT EXISTS 'home_economics';
ALTER TYPE public.jamb_subject ADD VALUE IF NOT EXISTS 'igbo';
ALTER TYPE public.jamb_subject ADD VALUE IF NOT EXISTS 'music';
ALTER TYPE public.jamb_subject ADD VALUE IF NOT EXISTS 'physical_health_education';
ALTER TYPE public.jamb_subject ADD VALUE IF NOT EXISTS 'yoruba';
