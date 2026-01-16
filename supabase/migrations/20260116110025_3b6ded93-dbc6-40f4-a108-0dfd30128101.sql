-- Create efficient rank update function to replace the JavaScript loop
CREATE OR REPLACE FUNCTION recalculate_leaderboard_ranks()
RETURNS void AS $$
BEGIN
  -- Update all ranks in a single efficient query using ROW_NUMBER
  UPDATE leaderboard_scores 
  SET rank = subquery.new_rank
  FROM (
    SELECT id, ROW_NUMBER() OVER (ORDER BY total_score DESC) as new_rank
    FROM leaderboard_scores
  ) subquery
  WHERE leaderboard_scores.id = subquery.id
  AND (leaderboard_scores.rank IS NULL OR leaderboard_scores.rank != subquery.new_rank);
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Add topics column to jamb_questions for high-yield topic tagging
ALTER TABLE jamb_questions ADD COLUMN IF NOT EXISTS topics TEXT[];

-- Create index for efficient topic queries
CREATE INDEX IF NOT EXISTS idx_jamb_questions_topics ON jamb_questions USING GIN(topics);

-- Create topic frequency view for High-Yield Questions feature
CREATE OR REPLACE VIEW topic_frequency AS
SELECT 
  unnest(topics) as topic,
  subject,
  COUNT(*) as question_count,
  COUNT(DISTINCT year) as years_appeared,
  MIN(year) as first_year,
  MAX(year) as last_year
FROM jamb_questions
WHERE topics IS NOT NULL AND array_length(topics, 1) > 0
GROUP BY unnest(topics), subject
ORDER BY question_count DESC;