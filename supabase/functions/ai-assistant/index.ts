import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, reviewId, reviewContent, customerName, rating, platform, businessType } = await req.json();
    
    // Get JWT token from Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    // Create Supabase client with service role for admin operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify the JWT token
    const jwt = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(jwt);
    
    if (authError || !user) {
      console.error('Authentication error:', authError);
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`🔄 Processing ${action} for user: ${user.id}`);

    if (action === 'generate_response') {
      return await generateAIResponse(reviewId, reviewContent, customerName, rating, platform, businessType, user.id, supabase);
    } else if (action === 'analyze_sentiment') {
      return await analyzeSentiment(reviewContent, reviewId, user.id, supabase);
    } else {
      throw new Error('Invalid action');
    }

  } catch (error) {
    console.error('Error in ai-assistant function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function generateAIResponse(reviewId: string, reviewContent: string, customerName: string, rating: number, platform: string, businessType: string, userId: string, supabase: any) {
  console.log(`🤖 Generating AI response for review: ${reviewId}`);
  
  // Get business profile and any specific instructions
  const { data: businessProfile } = await supabase
    .from('business_profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  // Get review-specific instructions
  const { data: reviewData } = await supabase
    .from('reviews')
    .select('ai_instructions')
    .eq('id', reviewId)
    .single();

  const businessInfo = businessProfile || {};
  const specificInstructions = reviewData?.ai_instructions || '';

  const systemPrompt = `אתה מומחה בשירות לקוחות ומגיב על ביקורות לקוחות בעברית. 
  המטרה שלך היא ליצור תגובות מקצועיות, אישיות ובונות.
  
  פרטי העסק:
  - שם העסק: ${businessInfo.business_name || 'לא צוין'}
  - סוג העסק: ${businessInfo.business_type || businessType || 'עסק כללי'}
  - תיאור העסק: ${businessInfo.business_description || 'לא צוין'}
  - קהל היעד: ${businessInfo.target_audience || 'כללי'}
  - טון התגובות: ${businessInfo.business_tone || 'מקצועי'}
  - הוראות כלליות: ${businessInfo.special_instructions || 'אין'}
  
  הוראות מיוחדות לביקורת הזו:
  ${specificInstructions || 'אין הוראות מיוחדות'}
  
  כללים חשובים:
  - תמיד כתוב בעברית
  - היה מקצועי ונעים
  - הודה על הביקורת
  - אם הביקורת חיובית - הבע הערכה והזמן את הלקוח לחזור
  - אם הביקורת שלילית - התנצל, הצע פתרון והזמן לשיחה פרטית
  - התאם את הטון לפלטפורמה (גוגל/פייסבוק)
  - שמור על אורך של 2-3 משפטים מקסימום
  - אל תמציא פרטים שלא קיימים בביקורת
  - שלב את ההוראות המיוחדות באופן טבעי
  - התאם את התגובה לסוג העסק הספציפי
  - **חשוב מאוד**: סיים תמיד את התגובה עם "בברכה, ${businessInfo.business_name ? `צוות ${businessInfo.business_name}` : 'צוות העסק'}"
  
  פלטפורמה: ${platform}
  דירוג: ${rating}/5`;

  const userPrompt = `שם הלקוח: ${customerName}
  הביקורת: "${reviewContent}"
  
  אנא כתב תגובה מקצועית ואישית לביקורת זו המתאימה לעסק שלי ולהוראות שקיבלת.`;

  console.log(`📋 Business Profile:`, JSON.stringify(businessInfo, null, 2));
  console.log(`📝 Specific Instructions:`, specificInstructions);
  console.log(`🎯 System Prompt Preview:`, systemPrompt.substring(0, 200) + '...');
  console.log(`💬 User Prompt:`, userPrompt);

  try {
    // Helper: fallback message if model returns empty
    const buildFallbackResponse = () => {
      const name = customerName || 'הלקוח/ה';
      const bName = (businessInfo.business_name || '').trim();
      const tone = (businessInfo.business_tone || 'מקצועי').toLowerCase();
      const isPositive = Number(rating) >= 4;
      const isNegative = Number(rating) <= 2;

      const opener = isPositive
        ? `תודה רבה, ${name}! שמחים מאוד שנהנית מהחוויה אצלנו${bName ? ' ב' + bName : ''}.`
        : isNegative
        ? `מצטערים לשמוע, ${name}. חשוב לנו לספק חוויה מצוינת בכל ביקור.`
        : `תודה על המשוב, ${name}. דעתך חשובה לנו.`;

      const follow = isNegative
        ? `נשמח להבין יותר ולטפל בכך מיד. אפשר לפנות אלינו בהודעה פרטית או בטלפון, ונמצא פתרון מתאים.`
        : `נשמח לראותך שוב בקרוב! אם יש עוד משהו שנוכל לשפר, נודה לשיתוף.`;

      const extra = specificInstructions
        ? ` (${specificInstructions})`
        : '';

      return `${opener} ${follow}${extra}`.trim();
    };

    // First attempt: GPT‑5 (recommended) with correct params
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-2025-08-07',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_completion_tokens: 300
      }),
    });

    let aiResponse = '';

    if (response.ok) {
      const data = await response.json();
      aiResponse = (data?.choices?.[0]?.message?.content || '').trim();
      console.log(`🔍 Raw OpenAI response:`, JSON.stringify(data, null, 2));
      console.log(`📤 Extracted AI response: "${aiResponse}"`);
    } else {
      const error = await response.text();
      console.error('OpenAI API error (gpt-5):', error);
    }

    // Second attempt: legacy model if first is empty
    if (!aiResponse) {
      console.log('⚠️ Empty response from gpt-5, retrying with gpt-4o-mini');
      const response2 = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          max_tokens: 300,
          temperature: 0.7
        }),
      });

      if (response2.ok) {
        const data2 = await response2.json();
        aiResponse = (data2?.choices?.[0]?.message?.content || '').trim();
      } else {
        const error2 = await response2.text();
        console.error('OpenAI API error (gpt-4o-mini):', error2);
      }
    }

    // Final fallback: deterministic template
    if (!aiResponse) {
      aiResponse = buildFallbackResponse();
      console.log('🧩 Using fallback response');
    }

    console.log(`✅ Generated AI response (preview): ${aiResponse.substring(0, 100)}...`);

    // Update the review with the AI response
    const { error: updateError } = await supabase
      .from('reviews')
      .update({ 
        ai_response: aiResponse,
        response_status: 'generated'
      })
      .eq('id', reviewId)
      .eq('user_id', userId);

    if (updateError) {
      console.error('Error updating review:', updateError);
      throw new Error('Failed to save AI response');
    }

    console.log(`💾 Successfully saved AI response for review: ${reviewId}`);

    return new Response(JSON.stringify({ 
      success: true, 
      ai_response: aiResponse,
      reviewId: reviewId
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error generating AI response:', error);
    throw error;
  }
}

async function analyzeSentiment(reviewContent: string, reviewId: string, userId: string, supabase: any) {
  console.log(`📊 Analyzing sentiment for review: ${reviewId}`);

  const systemPrompt = `אתה מומחה בניתוח סנטימנט של ביקורות לקוחות בעברית.
  המטרה שלך היא לקבוע את הסנטימנט של הביקורת בצורה מדויקת.
  
  חזור עם המילה המדויקת בלבד:
  - "positive" - לביקורות חיוביות (4-5 כוכבים או תוכן חיובי)
  - "negative" - לביקורות שליליות (1-2 כוכבים או תוכן שלילי)  
  - "neutral" - לביקורות ניטרליות (3 כוכבים או תוכן מעורב)
  
  חזור רק עם המילה באנגלית, ללא הסברים נוספים.`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-nano-2025-08-07',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `נתח את הסנטימנט של הביקורת הזו: "${reviewContent}"` }
        ],
        max_completion_tokens: 10
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API error:', error);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const sentiment = data.choices[0].message.content.trim().toLowerCase();

    console.log(`✅ Analyzed sentiment: ${sentiment}`);

    // Update the review with the sentiment
    const { error: updateError } = await supabase
      .from('reviews')
      .update({ sentiment })
      .eq('id', reviewId)
      .eq('user_id', userId);

    if (updateError) {
      console.error('Error updating sentiment:', updateError);
      throw new Error('Failed to save sentiment analysis');
    }

    return new Response(JSON.stringify({ 
      success: true, 
      sentiment 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error analyzing sentiment:', error);
    throw error;
  }
}