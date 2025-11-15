-- Add fields to track reviews that require manual attention
ALTER TABLE reviews 
ADD COLUMN requires_manual_attention BOOLEAN DEFAULT FALSE,
ADD COLUMN attention_reason TEXT,
ADD COLUMN attention_priority TEXT CHECK (attention_priority IN ('low', 'medium', 'high', 'urgent'));

-- Create index for filtering reviews that need attention
CREATE INDEX idx_reviews_requires_attention ON reviews(requires_manual_attention) WHERE requires_manual_attention = TRUE;