-- Check what values are allowed for platform
SELECT conname, contype, pg_get_constraintdef(oid) as definition
FROM pg_constraint 
WHERE conrelid = 'public.reviews'::regclass;