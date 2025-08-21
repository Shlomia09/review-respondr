-- Add test reviews for testing
INSERT INTO reviews (user_id, customer_name, content, rating, platform, sentiment, response_status) VALUES 
-- Get the first user's ID dynamically
((SELECT auth.uid() LIMIT 1), 'שרה כהן', 'השירות היה מעולה! האוכל טעים מאוד והצוות היה חמוד וזמין. בהחלט נחזור שוב!', 5, 'Google', 'positive', 'pending'),
((SELECT auth.uid() LIMIT 1), 'דוד לוי', 'זמן המתנה היה ארוך מדי, כמעט שעה. האוכל טוב אבל לא שווה את ההמתנה.', 2, 'Facebook', 'negative', 'pending'),
((SELECT auth.uid() LIMIT 1), 'רחל אברהם', 'מקום נחמד עם אווירה נעימה. המחירים סבירים והמנות גדולות.', 4, 'TripAdvisor', 'positive', 'pending'),
((SELECT auth.uid() LIMIT 1), 'יוסי מילר', 'המנה שהזמנתי הייתה קרה ולא טעימה. מאוכזב מהביקור.', 1, 'Google', 'negative', 'pending'),
((SELECT auth.uid() LIMIT 1), 'מיכל רוזנברג', 'חוויה נהדרת! המסעדה נקייה, השירות מהיר והאוכל מושלם.', 5, 'Trustpilot', 'positive', 'pending'),
((SELECT auth.uid() LIMIT 1), 'אבי נחמני', 'המוזיקה הייתה חזקה מדי, לא יכולתי לשוחח עם החברים שלי. האוכל בסדר אבל החוויה לא הייתה נעימה.', 3, 'Google', 'neutral', 'pending');