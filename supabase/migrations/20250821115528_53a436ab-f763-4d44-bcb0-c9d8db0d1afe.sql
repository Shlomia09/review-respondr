-- Insert demo reviews for testing with correct platform values
INSERT INTO public.reviews (
  user_id,
  customer_name,
  content,
  rating,
  platform,
  sentiment,
  response_status,
  review_date
) VALUES
  (
    (SELECT id FROM auth.users LIMIT 1),
    'שרה כהן',
    'שירות מעולה! הצוות היה מקצועי ועזר לי במהירות. ממליצה בחום על המקום הזה.',
    5,
    'Google',
    'positive',
    'pending',
    NOW() - INTERVAL '2 days'
  ),
  (
    (SELECT id FROM auth.users LIMIT 1),
    'דוד לוי',
    'חוויה נוראה. חיכיתי שעה שלמה ובסוף קיבלתי שירות גרוע. לא אחזור לכאן.',
    1,
    'Facebook',
    'negative',
    'pending',
    NOW() - INTERVAL '5 days'
  ),
  (
    (SELECT id FROM auth.users LIMIT 1),
    'מיכל אברהם',
    'המקום בסדר, השירות היה אוקיי. לא משהו מיוחד אבל גם לא רע.',
    3,
    'Google',
    'neutral',
    'pending',
    NOW() - INTERVAL '1 day'
  ),
  (
    (SELECT id FROM auth.users LIMIT 1),
    'אבי רוזנברג',
    'פשוט מדהים! איכות מעולה, מחירים הוגנים וצוות נהדר. בהחלט אחזור.',
    5,
    'Google',
    'positive',
    'generated',
    NOW() - INTERVAL '3 days'
  ),
  (
    (SELECT id FROM auth.users LIMIT 1),
    'רחל גולדשטיין',
    'מוצר פגום, לא מה שהזמנתי. נאלצתי לחזור מספר פעמים עד שקיבלתי החלפה.',
    2,
    'Google',
    'negative',
    'pending',
    NOW() - INTERVAL '4 days'
  );

-- Add AI response to one review for demonstration
UPDATE public.reviews 
SET ai_response = 'תודה רבה על הביקורת החיובית! אנחנו מאוד שמחים לשמוע שנהנית מהשירות שלנו. הצוות שלנו עובד קשה כדי לספק חוויה מעולה לכל לקוח. נשמח לראותך שוב בקרוב!'
WHERE response_status = 'generated';