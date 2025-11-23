-- Clear facebook reviews so they will be re-synced with composite {page-id}_{story-id} IDs
DELETE FROM public.reviews WHERE platform = 'facebook';