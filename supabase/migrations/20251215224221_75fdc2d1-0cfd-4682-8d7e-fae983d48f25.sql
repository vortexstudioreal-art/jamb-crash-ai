-- Add selected_course_id column to user_study_preferences
ALTER TABLE user_study_preferences 
ADD COLUMN IF NOT EXISTS selected_course_id TEXT;