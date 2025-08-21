-- Ensure a unique constraint exists for (user_id, platform) to support upsert
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_indexes 
    WHERE schemaname = 'public' AND indexname = 'platform_tokens_user_platform_key'
  ) THEN
    ALTER TABLE public.platform_tokens
    ADD CONSTRAINT platform_tokens_user_platform_key UNIQUE (user_id, platform);
  END IF;
END $$;