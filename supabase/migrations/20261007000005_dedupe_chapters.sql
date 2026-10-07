-- Remove duplicate chapter rows in Lion and the Jewel + Harvest of
-- Corruption (seed stubs later enriched by AI, then duplicated again by
-- the hand-written guide migration). Keeps the verified hand-written rows.
DELETE FROM public.novel_chapters
WHERE id IN (
  '1f245da2-1514-4f31-a2fd-676d7f74a9ed',
  '96909403-29b7-4829-8ce8-7753a3396d07',
  'a24c20e4-a1ea-4f16-a3f0-fac449e10bef',
  '56080bd7-f470-4dac-a992-2e709f67a445',
  '945d063a-7d7a-457e-b5fe-b971bf21a720',
  'ea56f83f-5e19-4675-8a6a-a70b62e2957e'
);

-- Prevent chapter-number duplicates per novel going forward
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'novel_chapters_novel_number_key'
  ) THEN
    ALTER TABLE public.novel_chapters
      ADD CONSTRAINT novel_chapters_novel_number_key UNIQUE (novel_id, chapter_number);
  END IF;
END
$$;
