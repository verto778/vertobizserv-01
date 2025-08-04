
-- Add remarks column to candidates table
ALTER TABLE candidates 
ADD COLUMN remarks TEXT;

-- Add comment to describe the column
COMMENT ON COLUMN candidates.remarks IS 'Optional comments or notes about the candidate';
