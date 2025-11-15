-- Fix reviews.platform constraint to support all existing platforms
ALTER TABLE public.reviews DROP CONSTRAINT IF EXISTS reviews_platform_check;

ALTER TABLE public.reviews
ADD CONSTRAINT reviews_platform_check
CHECK (platform IN ('facebook', 'google', 'trustpilot', 'Amazon', 'Yelp', 'TripAdvisor', 'Facebook', 'Google'));