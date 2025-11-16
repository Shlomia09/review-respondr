-- ============================================
-- REVAI FOUNDATION REBUILD - FIXED
-- Multi-tenant SaaS with organizations
-- ============================================

-- 1. Create organizations table
CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- 2. Create organization_members table
CREATE TABLE IF NOT EXISTS public.organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT CHECK (role IN ('owner', 'admin', 'member')) DEFAULT 'member',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(organization_id, user_id)
);

ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;

-- 3. Add RLS policies
DROP POLICY IF EXISTS "Users can view their organizations" ON public.organizations;
CREATE POLICY "Users can view their organizations"
  ON public.organizations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_members
      WHERE organization_id = organizations.id
      AND user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can view their memberships" ON public.organization_members;
CREATE POLICY "Users can view their memberships"
  ON public.organization_members FOR SELECT
  USING (user_id = auth.uid());

-- 4. Helper function
CREATE OR REPLACE FUNCTION public.get_user_organization_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT organization_id
  FROM public.organization_members
  WHERE user_id = auth.uid()
  LIMIT 1
$$;

-- 5. Add organization_id to platform_connections
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'platform_connections' AND column_name = 'organization_id') THEN
    ALTER TABLE public.platform_connections ADD COLUMN organization_id UUID REFERENCES public.organizations(id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'platform_connections' AND column_name = 'display_name') THEN
    ALTER TABLE public.platform_connections ADD COLUMN display_name TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'platform_connections' AND column_name = 'external_business_id') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'platform_connections' AND column_name = 'business_id') THEN
      ALTER TABLE public.platform_connections RENAME COLUMN business_id TO external_business_id;
    ELSE
      ALTER TABLE public.platform_connections ADD COLUMN external_business_id TEXT;
    END IF;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'platform_connections' AND column_name = 'token_expires_at') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'platform_connections' AND column_name = 'expires_at') THEN
      ALTER TABLE public.platform_connections RENAME COLUMN expires_at TO token_expires_at;
    ELSE
      ALTER TABLE public.platform_connections ADD COLUMN token_expires_at TIMESTAMPTZ;
    END IF;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'platform_connections' AND column_name = 'scopes') THEN
    ALTER TABLE public.platform_connections ADD COLUMN scopes TEXT[];
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'platform_connections' AND column_name = 'status') THEN
    ALTER TABLE public.platform_connections ADD COLUMN status TEXT CHECK (status IN ('connected', 'expired', 'error')) DEFAULT 'connected';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'platform_connections' AND column_name = 'last_sync_at') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'platform_connections' AND column_name = 'last_sync') THEN
      ALTER TABLE public.platform_connections RENAME COLUMN last_sync TO last_sync_at;
    ELSE
      ALTER TABLE public.platform_connections ADD COLUMN last_sync_at TIMESTAMPTZ;
    END IF;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'platform_connections' AND column_name = 'settings') THEN
    ALTER TABLE public.platform_connections ADD COLUMN settings JSONB DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- Update platform_connections RLS
DROP POLICY IF EXISTS "Users can view their own platform connections" ON public.platform_connections;
DROP POLICY IF EXISTS "Users view own org connections" ON public.platform_connections;
CREATE POLICY "Users view own org connections"
  ON public.platform_connections FOR SELECT
  USING (organization_id = public.get_user_organization_id() OR user_id = auth.uid());

DROP POLICY IF EXISTS "Users can create their own platform connections" ON public.platform_connections;
DROP POLICY IF EXISTS "Users create org connections" ON public.platform_connections;
CREATE POLICY "Users create org connections"
  ON public.platform_connections FOR INSERT
  WITH CHECK (organization_id = public.get_user_organization_id() OR user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own platform connections" ON public.platform_connections;
DROP POLICY IF EXISTS "Users update org connections" ON public.platform_connections;
CREATE POLICY "Users update org connections"
  ON public.platform_connections FOR UPDATE
  USING (organization_id = public.get_user_organization_id() OR user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete their own platform connections" ON public.platform_connections;
DROP POLICY IF EXISTS "Users delete org connections" ON public.platform_connections;
CREATE POLICY "Users delete org connections"
  ON public.platform_connections FOR DELETE
  USING (organization_id = public.get_user_organization_id() OR user_id = auth.uid());

-- 6. Add organization_id to reviews
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'reviews' AND column_name = 'organization_id') THEN
    ALTER TABLE public.reviews ADD COLUMN organization_id UUID REFERENCES public.organizations(id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'reviews' AND column_name = 'connection_id') THEN
    ALTER TABLE public.reviews ADD COLUMN connection_id UUID REFERENCES public.platform_connections(id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'reviews' AND column_name = 'external_review_id') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'reviews' AND column_name = 'platform_review_id') THEN
      ALTER TABLE public.reviews RENAME COLUMN platform_review_id TO external_review_id;
    ELSE
      ALTER TABLE public.reviews ADD COLUMN external_review_id TEXT;
    END IF;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'reviews' AND column_name = 'author_name') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'reviews' AND column_name = 'customer_name') THEN
      ALTER TABLE public.reviews RENAME COLUMN customer_name TO author_name;
    ELSE
      ALTER TABLE public.reviews ADD COLUMN author_name TEXT;
    END IF;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'reviews' AND column_name = 'author_id') THEN
    ALTER TABLE public.reviews ADD COLUMN author_id TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'reviews' AND column_name = 'title') THEN
    ALTER TABLE public.reviews ADD COLUMN title TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'reviews' AND column_name = 'review_url') THEN
    ALTER TABLE public.reviews ADD COLUMN review_url TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'reviews' AND column_name = 'ai_suggested_reply') THEN
    ALTER TABLE public.reviews ADD COLUMN ai_suggested_reply TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'reviews' AND column_name = 'ai_model') THEN
    ALTER TABLE public.reviews ADD COLUMN ai_model TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'reviews' AND column_name = 'ai_generated_at') THEN
    ALTER TABLE public.reviews ADD COLUMN ai_generated_at TIMESTAMPTZ;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'reviews' AND column_name = 'approved_reply') THEN
    ALTER TABLE public.reviews ADD COLUMN approved_reply TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'reviews' AND column_name = 'approved_by') THEN
    ALTER TABLE public.reviews ADD COLUMN approved_by UUID;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'reviews' AND column_name = 'approved_at') THEN
    ALTER TABLE public.reviews ADD COLUMN approved_at TIMESTAMPTZ;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'reviews' AND column_name = 'send_attempts') THEN
    ALTER TABLE public.reviews ADD COLUMN send_attempts INT DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'reviews' AND column_name = 'last_send_at') THEN
    ALTER TABLE public.reviews ADD COLUMN last_send_at TIMESTAMPTZ;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'reviews' AND column_name = 'last_send_status') THEN
    ALTER TABLE public.reviews ADD COLUMN last_send_status TEXT CHECK (last_send_status IN ('pending', 'success', 'failed')) DEFAULT 'pending';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'reviews' AND column_name = 'last_send_error') THEN
    ALTER TABLE public.reviews ADD COLUMN last_send_error TEXT;
  END IF;
END $$;

-- Create unique index for de-duplication
DROP INDEX IF EXISTS idx_reviews_dedup;
CREATE UNIQUE INDEX idx_reviews_dedup 
  ON public.reviews(organization_id, platform, external_review_id)
  WHERE organization_id IS NOT NULL AND external_review_id IS NOT NULL;

-- Update reviews RLS
DROP POLICY IF EXISTS "Users can view their own reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users view org reviews" ON public.reviews;
CREATE POLICY "Users view org reviews"
  ON public.reviews FOR SELECT
  USING (organization_id = public.get_user_organization_id() OR user_id = auth.uid());

DROP POLICY IF EXISTS "Users can create their own reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users create org reviews" ON public.reviews;
CREATE POLICY "Users create org reviews"
  ON public.reviews FOR INSERT
  WITH CHECK (organization_id = public.get_user_organization_id() OR user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users update org reviews" ON public.reviews;
CREATE POLICY "Users update org reviews"
  ON public.reviews FOR UPDATE
  USING (organization_id = public.get_user_organization_id() OR user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete their own reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users delete org reviews" ON public.reviews;
CREATE POLICY "Users delete org reviews"
  ON public.reviews FOR DELETE
  USING (organization_id = public.get_user_organization_id() OR user_id = auth.uid());

-- 7. Create jobs_outbox table
CREATE TABLE IF NOT EXISTS public.jobs_outbox (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  review_id UUID REFERENCES public.reviews(id) ON DELETE CASCADE,
  job_type TEXT CHECK (job_type IN ('post_reply')) NOT NULL,
  payload JSONB NOT NULL,
  idempotency_key TEXT UNIQUE,
  state TEXT CHECK (state IN ('queued', 'processing', 'success', 'failed')) DEFAULT 'queued',
  attempts INT DEFAULT 0,
  last_error TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.jobs_outbox ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view org jobs" ON public.jobs_outbox;
CREATE POLICY "Users view org jobs"
  ON public.jobs_outbox FOR SELECT
  USING (organization_id = public.get_user_organization_id());

DROP POLICY IF EXISTS "Users create org jobs" ON public.jobs_outbox;
CREATE POLICY "Users create org jobs"
  ON public.jobs_outbox FOR INSERT
  WITH CHECK (organization_id = public.get_user_organization_id());

DROP POLICY IF EXISTS "Users update org jobs" ON public.jobs_outbox;
CREATE POLICY "Users update org jobs"
  ON public.jobs_outbox FOR UPDATE
  USING (organization_id = public.get_user_organization_id());

-- 8. Create audit_logs table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID,
  entity TEXT,
  entity_id UUID,
  action TEXT,
  meta JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view org audit logs" ON public.audit_logs;
CREATE POLICY "Users view org audit logs"
  ON public.audit_logs FOR SELECT
  USING (organization_id = public.get_user_organization_id());

DROP POLICY IF EXISTS "Users create org audit logs" ON public.audit_logs;
CREATE POLICY "Users create org audit logs"
  ON public.audit_logs FOR INSERT
  WITH CHECK (organization_id = public.get_user_organization_id());

-- 9. Create trigger for auto-creating organization
CREATE OR REPLACE FUNCTION public.on_auth_user_created_org()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_org_id UUID;
BEGIN
  INSERT INTO public.organizations (name)
  VALUES (COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email) || '''s Organization')
  RETURNING id INTO new_org_id;
  
  INSERT INTO public.organization_members (organization_id, user_id, role)
  VALUES (new_org_id, NEW.id, 'owner');
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_org_trigger ON auth.users;
CREATE TRIGGER on_auth_user_created_org_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.on_auth_user_created_org();

-- 10. Migrate existing data
DO $$
DECLARE
  user_record RECORD;
  org_id UUID;
BEGIN
  FOR user_record IN 
    SELECT DISTINCT u.id, u.email, u.raw_user_meta_data
    FROM auth.users u
    LEFT JOIN public.organization_members om ON om.user_id = u.id
    WHERE om.id IS NULL
  LOOP
    INSERT INTO public.organizations (name)
    VALUES (COALESCE(user_record.raw_user_meta_data->>'full_name', user_record.email) || '''s Organization')
    RETURNING id INTO org_id;
    
    INSERT INTO public.organization_members (organization_id, user_id, role)
    VALUES (org_id, user_record.id, 'owner');
    
    UPDATE public.platform_connections
    SET organization_id = org_id
    WHERE user_id = user_record.id AND organization_id IS NULL;
    
    UPDATE public.reviews
    SET organization_id = org_id
    WHERE user_id = user_record.id AND organization_id IS NULL;
  END LOOP;
END $$;