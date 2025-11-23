-- Clear all Facebook reviews so they will be re-synced with correct single IDs
DELETE FROM public.reviews WHERE platform = 'facebook';