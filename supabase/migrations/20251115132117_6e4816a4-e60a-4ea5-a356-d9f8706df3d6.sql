-- Add business_name and business_id to reviews table for filtering
ALTER TABLE public.reviews 
ADD COLUMN IF NOT EXISTS business_id text,
ADD COLUMN IF NOT EXISTS business_name text;

-- Create index for faster filtering by business
CREATE INDEX IF NOT EXISTS idx_reviews_business_id ON public.reviews(business_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_business ON public.reviews(user_id, business_id);

-- Add a unique constraint to platform_connections to allow multiple connections per platform
-- First, drop the old unique constraint if it exists
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'platform_connections_user_id_platform_key'
    ) THEN
        ALTER TABLE public.platform_connections 
        DROP CONSTRAINT platform_connections_user_id_platform_key;
    END IF;
END $$;

-- Add new unique constraint on user_id, platform, and business_id
-- This allows multiple businesses per platform per user
ALTER TABLE public.platform_connections
ADD CONSTRAINT platform_connections_user_platform_business_unique 
UNIQUE (user_id, platform, business_id);

-- Add is_active column to mark which connections are active
ALTER TABLE public.platform_connections
ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;

-- Add display_order for sorting connections
ALTER TABLE public.platform_connections
ADD COLUMN IF NOT EXISTS display_order integer DEFAULT 0;

-- Create index for active connections
CREATE INDEX IF NOT EXISTS idx_platform_connections_active 
ON public.platform_connections(user_id, platform, is_active);