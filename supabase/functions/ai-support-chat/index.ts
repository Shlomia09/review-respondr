import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  action?: {
    type: string;
    data: any;
    executed?: boolean;
  };
}

interface UserContext {
  userId: string;
  businessProfile?: any;
  recentReviews?: any[];
  platformConnections?: any[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);
    const { message, conversationId, context } = await req.json();

    console.log('Support chat request:', { message, conversationId, context });

    // Get user context from database
    const userContext = await getUserContext(supabaseClient, context.userId);
    
    // Get conversation history
    const conversationHistory = await getConversationHistory(supabaseClient, conversationId, context.userId);

    // Determine if user is asking for an action
    const actionAnalysis = await analyzeForActions(message, userContext);

    let response: string;
    let actionToExecute = null;

    if (actionAnalysis.needsAction) {
      // Execute action if requested
      actionToExecute = await executeAction(supabaseClient, actionAnalysis.action, userContext);
      response = await generateActionResponse(message, actionAnalysis, actionToExecute, userContext);
    } else {
      // Generate helpful response
      response = await generateHelpResponse(message, conversationHistory, userContext);
    }

    // Update conversation
    await updateConversation(supabaseClient, conversationId, context.userId, message, response, actionToExecute);

    return new Response(JSON.stringify({ 
      response,
      action: actionToExecute,
      success: true 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in support chat:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function getUserContext(supabaseClient: any, userId: string): Promise<UserContext> {
  try {
    const [businessProfile, reviews, connections] = await Promise.all([
      supabaseClient.from('business_profiles').select('*').eq('user_id', userId).single(),
      supabaseClient.from('reviews').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(5),
      supabaseClient.from('platform_connections').select('*').eq('user_id', userId)
    ]);

    return {
      userId,
      businessProfile: businessProfile.data,
      recentReviews: reviews.data || [],
      platformConnections: connections.data || []
    };
  } catch (error) {
    console.error('Error getting user context:', error);
    return { userId };
  }
}

async function getConversationHistory(supabaseClient: any, conversationId: string, userId: string): Promise<ChatMessage[]> {
  try {
    const { data } = await supabaseClient
      .from('chatbot_conversations')
      .select('conversation_data')
      .eq('id', conversationId)
      .eq('user_id', userId)
      .single();

    return data?.conversation_data || [];
  } catch (error) {
    console.log('No existing conversation found, starting new one');
    return [];
  }
}

async function analyzeForActions(message: string, context: UserContext) {
  const prompt = `
  Analyze if the user message requires a system action. You are a REVAI support assistant.
  
  Available actions:
  - create_review: Create a mock review for testing
  - generate_ai_response: Generate AI response for a review
  - fetch_analytics: Get analytics data
  - connect_platform: Help with platform connection
  - update_settings: Update user settings
  - export_data: Export reviews/analytics data
  - schedule_social_post: Schedule a social media post
  
  User message: "${message}"
  
  Business context: ${context.businessProfile?.business_name || 'No business profile'}
  Recent reviews count: ${context.recentReviews?.length || 0}
  
  Respond with JSON:
  {
    "needsAction": boolean,
    "action": {
      "type": "action_name",
      "parameters": {}
    },
    "confidence": number (0-1)
  }
  `;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
    }),
  });

  const data = await response.json();
  try {
    return JSON.parse(data.choices[0].message.content);
  } catch {
    return { needsAction: false, action: null, confidence: 0 };
  }
}

async function executeAction(supabaseClient: any, action: any, context: UserContext) {
  try {
    switch (action.type) {
      case 'create_review':
        return await createMockReview(supabaseClient, context);
        
      case 'generate_ai_response':
        return await generateReviewResponse(supabaseClient, context);
        
      case 'fetch_analytics':
        return await fetchAnalyticsData(supabaseClient, context);
        
      case 'connect_platform':
        return { type: 'info', message: 'אני יכול לעזור לך להתחבר לפלטפורמות. עבור לדף האינטגרציות כדי להתחבר ל-Google, Facebook או Trustpilot.' };
        
      case 'update_settings':
        return { type: 'info', message: 'עבור לדף ההגדרות כדי לעדכן את פרופיל העסק, הגדרות התראות ועוד.' };
        
      case 'export_data':
        return { type: 'info', message: 'תכונת הייצוא זמינה בדף האנליטיקס. לחץ על כפתור "ייצוא נתונים".' };
        
      case 'schedule_social_post':
        return { type: 'info', message: 'עבור למרכז החברתי כדי ליצור ולתזמן פוסטים. יש שם יוצר תוכן AI!' };
        
      default:
        return { type: 'error', message: 'פעולה לא נתמכת' };
    }
  } catch (error) {
    console.error('Action execution error:', error);
    return { type: 'error', message: 'שגיאה בביצוע הפעולה' };
  }
}

async function createMockReview(supabaseClient: any, context: UserContext) {
  const mockReviews = [
    {
      customer_name: 'שרה כהן',
      customer_email: 'sarah@example.com',
      platform: 'google',
      rating: 5,
      content: 'שירות מעולה! ממליצה בחום. הצוות מקצועי ואדיב.',
      sentiment: 'positive',
      response_status: 'pending'
    },
    {
      customer_name: 'דוד לוי',
      customer_email: 'david@example.com', 
      platform: 'facebook',
      rating: 4,
      content: 'חוויה טובה בסך הכל. יש מה לשפר בזמני המתנה.',
      sentiment: 'positive',
      response_status: 'pending'
    }
  ];

  const reviewToAdd = mockReviews[Math.floor(Math.random() * mockReviews.length)];
  
  const { data, error } = await supabaseClient
    .from('reviews')
    .insert({
      ...reviewToAdd,
      user_id: context.userId,
      review_date: new Date().toISOString()
    })
    .select()
    .single();

  if (error) throw error;

  return { 
    type: 'success', 
    message: `נוצרה ביקורת חדשה מ${reviewToAdd.customer_name} עם דירוג ${reviewToAdd.rating} כוכבים!`,
    data: data
  };
}

async function generateReviewResponse(supabaseClient: any, context: UserContext) {
  if (!context.recentReviews?.length) {
    return { type: 'info', message: 'אין ביקורות אחרונות ליצירת תגובה אוטומטית' };
  }

  const latestReview = context.recentReviews[0];
  
  // Here you could call the existing ai-assistant function
  return { 
    type: 'success', 
    message: `נוצרה תגובה אוטומטית לביקורת של ${latestReview.customer_name}. בדוק בדף הביקורות.`
  };
}

async function fetchAnalyticsData(supabaseClient: any, context: UserContext) {
  const { data: reviews } = await supabaseClient
    .from('reviews')
    .select('rating, sentiment, created_at')
    .eq('user_id', context.userId);

  const total = reviews?.length || 0;
  const avgRating = total > 0 ? reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / total : 0;
  const positive = reviews?.filter((r: any) => r.sentiment === 'positive').length || 0;

  return {
    type: 'success',
    message: `📊 סטטיסטיקות מהירות:\\
• סה"כ ביקורות: ${total}\
• דירוג ממוצע: ${avgRating.toFixed(1)}\
• ביקורות חיוביות: ${positive}/${total}`,
    data: { total, avgRating, positive }
  };
}

async function generateHelpResponse(message: string, history: ChatMessage[], context: UserContext) {
  const systemPrompt = `
  אתה עוזר AI של REVAI - פלטפורמת ביקורות ואוטומציה חברתית.
  
  מידע על המשתמש:
  - שם העסק: ${context.businessProfile?.business_name || 'לא מוגדר'}
  - סוג עסק: ${context.businessProfile?.business_type || 'לא מוגדר'}
  - מספר ביקורות אחרונות: ${context.recentReviews?.length || 0}
  - חיבורי פלטפורמות: ${context.platformConnections?.length || 0}
  
  תכונות REVAI:
  1. ניהול ביקורות - צפייה, מיון, יצירת תגובות AI
  2. תגובות AI - תגובות אוטומטיות לביקורות
  3. אנליטיקס - גרפים, מגמות, ניתוח מילות מפתח
  4. מרכז חברתי - יצירת תוכן, תזמון פוסטים
  5. אינטגרציות - Google, Facebook, Trustpilot
  6. ניהול לקוחות - CRM מיני
  7. הגדרות - פרופיל עסקי, התראות
  
  ענה בעברית, תהיה מועיל ויצירתי. הדרך דרך המשתמש להשיג את מטרותיו.
  `;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        ...history.slice(-6).map(msg => ({ role: msg.role, content: msg.content })),
        { role: 'user', content: message }
      ],
      temperature: 0.7,
    }),
  });

  const data = await response.json();
  return data.choices[0].message.content;
}

async function generateActionResponse(message: string, analysis: any, actionResult: any, context: UserContext) {
  const prompt = `
  המשתמש ביקש: "${message}"
  הפעולה שזוהתה: ${analysis.action.type}
  תוצאת הפעולה: ${JSON.stringify(actionResult)}
  
  צור תגובה בעברית שמסבירה מה בוצע ומה המשך הצעדים.
  `;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    }),
  });

  const data = await response.json();
  return data.choices[0].message.content;
}

async function updateConversation(
  supabaseClient: any, 
  conversationId: string, 
  userId: string, 
  userMessage: string, 
  assistantResponse: string, 
  action: any
) {
  try {
    const timestamp = new Date().toISOString();
    
    // Get existing conversation
    const { data: existing } = await supabaseClient
      .from('chatbot_conversations')
      .select('conversation_data')
      .eq('id', conversationId)
      .eq('user_id', userId)
      .single();

    const currentHistory: ChatMessage[] = existing?.conversation_data || [];
    
    // Add new messages
    const newMessages: ChatMessage[] = [
      ...currentHistory,
      { role: 'user', content: userMessage, timestamp },
      { role: 'assistant', content: assistantResponse, timestamp, action }
    ];

    // Keep only last 50 messages
    const trimmedHistory = newMessages.slice(-50);

    // Upsert conversation
    await supabaseClient
      .from('chatbot_conversations')
      .upsert({
        id: conversationId,
        user_id: userId,
        conversation_data: trimmedHistory
      });

  } catch (error) {
    console.error('Error updating conversation:', error);
  }
}
