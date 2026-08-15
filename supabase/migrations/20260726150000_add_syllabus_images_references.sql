ALTER TABLE jamb_syllabus ADD COLUMN IF NOT EXISTS image_url text;
ALTER TABLE jamb_syllabus ADD COLUMN IF NOT EXISTS reference_materials jsonb DEFAULT '[]'::jsonb;
