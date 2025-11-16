-- Add external platform review id to reviews for replying back to source
ALTER TABLE public.reviews
ADD COLUMN IF NOT EXISTS platform_review_id text;

-- Optional index to speed up lookups by external id
CREATE INDEX IF NOT EXISTS idx_reviews_platform_review_id
  ON public.reviews (platform, platform_review_id);

-- No RLS changes needed; existing policies still apply to user_id ownership.
