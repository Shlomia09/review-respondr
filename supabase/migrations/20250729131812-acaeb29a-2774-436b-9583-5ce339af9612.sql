-- Add business_id column to platform_tokens table
ALTER TABLE platform_tokens 
ADD COLUMN business_id TEXT;