-- Add business details fields to platform_connections table
ALTER TABLE platform_connections
ADD COLUMN IF NOT EXISTS business_description TEXT,
ADD COLUMN IF NOT EXISTS business_category TEXT,
ADD COLUMN IF NOT EXISTS business_phone TEXT,
ADD COLUMN IF NOT EXISTS business_email TEXT,
ADD COLUMN IF NOT EXISTS business_website TEXT,
ADD COLUMN IF NOT EXISTS business_address TEXT,
ADD COLUMN IF NOT EXISTS business_about TEXT;

-- Add comment explaining the purpose
COMMENT ON COLUMN platform_connections.business_description IS 'Business description from platform (Facebook About, Google description, etc.)';
COMMENT ON COLUMN platform_connections.business_category IS 'Business category/type from platform';
COMMENT ON COLUMN platform_connections.business_about IS 'Extended business information from platform';