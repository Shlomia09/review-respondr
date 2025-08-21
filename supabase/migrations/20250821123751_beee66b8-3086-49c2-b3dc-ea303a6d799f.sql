-- Add test reviews for testing (with correct platform names from constraint)
INSERT INTO reviews (user_id, customer_name, content, rating, platform, sentiment, response_status) VALUES 
-- Use hardcoded user ID for testing
('419a902c-763f-4316-878e-616529fa155e', 'שרה כהן', 'השירות היה מעולה! האוכל טעים מאוד והצוות היה חמוד וזמין. בהחלט נחזור שוב!', 5, 'Google', 'positive', 'pending'),
('419a902c-763f-4316-878e-616529fa155e', 'דוד לוי', 'זמן המתנה היה ארוך מדי, כמעט שעה. האוכל טוב אבל לא שווה את ההמתנה.', 2, 'Facebook', 'negative', 'pending'),
('419a902c-763f-4316-878e-616529fa155e', 'רחל אברהם', 'מקום נחמד עם אווירה נעימה. המחירים סבירים והמנות גדולות.', 4, 'TripAdvisor', 'positive', 'pending'),
('419a902c-763f-4316-878e-616529fa155e', 'יוסי מילר', 'המנה שהזמנתי הייתה קרה ולא טעימה. מאוכזב מהביקור.', 1, 'Google', 'negative', 'pending'),
('419a902c-763f-4316-878e-616529fa155e', 'מיכל רוזנברג', 'חוויה נהדרת! המסעדה נקייה, השירות מהיר והאוכל מושלם.', 5, 'Yelp', 'positive', 'pending'),
('419a902c-763f-4316-878e-616529fa155e', 'אבי נחמני', 'המוזיקה הייתה חזקה מדי, לא יכולתי לשוחח עם החברים שלי. האוכל בסדר אבל החוויה לא הייתה נעימה.', 3, 'Google', 'neutral', 'pending'),
('419a902c-763f-4316-878e-616529fa155e', 'נועה שמיר', 'המוצר הגיע מהר והיה בדיוק מה שהזמנתי. קונה שוב!', 5, 'Amazon', 'positive', 'pending');