-- Delete reviews with fallback external_review_id pattern
-- These are reviews that were synced without proper Facebook ID
DELETE FROM reviews 
WHERE external_review_id LIKE '%_2024%' 
   OR external_review_id LIKE '%_2025%'
   OR external_review_id LIKE 'fb_page_%';