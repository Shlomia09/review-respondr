-- Step 1: Delete existing reviews that don't have external_review_id
-- This forces a clean slate where all future reviews must have this field
DELETE FROM public.reviews WHERE external_review_id IS NULL;

-- Step 2: Make external_review_id NOT NULL (all future inserts must provide it)
ALTER TABLE public.reviews ALTER COLUMN external_review_id SET NOT NULL;

-- Step 3: Add unique constraint to prevent duplicate reviews from same platform
-- This ensures we don't import the same review multiple times
CREATE UNIQUE INDEX IF NOT EXISTS reviews_unique_external_id 
ON public.reviews (organization_id, platform, external_review_id)
WHERE organization_id IS NOT NULL;

-- Step 4: For users without organizations (legacy data), still enforce uniqueness
CREATE UNIQUE INDEX IF NOT EXISTS reviews_unique_external_id_user 
ON public.reviews (user_id, platform, external_review_id)
WHERE organization_id IS NULL;