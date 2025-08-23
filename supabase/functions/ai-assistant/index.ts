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
    const { action, reviewId, reviewContent, customerName, rating, platform, businessType, targetLanguage } = await req.json();
    
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
      return await generateAIResponse(reviewId, reviewContent, customerName, rating, platform, businessType, targetLanguage, user.id, supabase);
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

async function generateAIResponse(reviewId: string, reviewContent: string, customerName: string, rating: number, platform: string, businessType: string, targetLanguage: string | undefined, userId: string, supabase: any) {
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

  const lang = (targetLanguage || 'en').toLowerCase();
  const langConfig: Record<string, { name: string; closing: string; team: string }> = {
    he: { name: 'Hebrew',  closing: 'בברכה',                    team: 'צוות' },
    ar: { name: 'Arabic',  closing: 'مع التحية',                 team: 'فريق' },
    es: { name: 'Spanish', closing: 'Saludos',                   team: 'Equipo' },
    de: { name: 'German',  closing: 'Mit freundlichen Grüßen',   team: 'Team' },
    ru: { name: 'Russian', closing: 'С уважением',               team: 'Команда' },
    en: { name: 'English', closing: 'Best regards',              team: 'Team' },
  };
  const cfg = langConfig[lang] || langConfig.en;
  const teamSignature = businessInfo.business_name
    ? `${cfg.closing}, ${cfg.team} ${businessInfo.business_name}`
    : `${cfg.closing}`;

  const systemPrompt = `You are a customer support expert who replies to customer reviews in ${cfg.name}.
Your goal is to produce professional, personal, and constructive replies tailored to the business.

Business details:
- Business name: ${businessInfo.business_name || 'Not specified'}
- Business type: ${businessInfo.business_type || businessType || 'General business'}
- Description: ${businessInfo.business_description || 'Not specified'}
- Target audience: ${businessInfo.target_audience || 'General'}
- Preferred tone: ${businessInfo.business_tone || 'Professional'}
- General instructions: ${businessInfo.special_instructions || 'None'}

Special instructions for this review:
${specificInstructions || 'None'}

Important rules:
- Always write in ${cfg.name}
- Be professional and friendly
- Thank the customer for the review
- If positive: express appreciation and invite to return
- If negative: apologize, offer a solution, and invite to a private conversation
- Match the tone to the platform (Google/Facebook/Trustpilot)
- Keep the response to 2-3 sentences max
- Do not invent details that are not in the review
- Integrate special instructions naturally
- Tailor the response to the specific business type
- ALWAYS end with "${teamSignature}"`;

  const userPrompt = `Customer name: ${customerName}
Review: "${reviewContent}"
Rating: ${rating}/5
Platform: ${platform}

Please write a professional and personal reply in ${cfg.name}, following the instructions above.`;

  console.log(`📋 Business Profile:`, JSON.stringify(businessInfo, null, 2));
  console.log(`📝 Specific Instructions:`, specificInstructions);
  console.log(`🎯 System Prompt Preview:`, systemPrompt.substring(0, 200) + '...');
  console.log(`💬 User Prompt:`, userPrompt);

  try {
    // Helper: fallback message if model returns empty
    const buildFallbackResponse = () => {
      const name = customerName || '';
      const bName = (businessInfo.business_name || '').trim();
      const isPositive = Number(rating) >= 4;
      const isNegative = Number(rating) <= 2;

      const phrases: Record<string, { thanks: (n:string)=>string; sorry: (n:string)=>string; neutral: (n:string)=>string; followPos: string; followNeg: string }> = {
        en: {
          thanks: (n) => `Thank you${n ? ', ' + n : ''}! We’re thrilled you enjoyed your experience${bName ? ' at ' + bName : ''}.`,
          sorry:  (n) => `We’re sorry to hear this${n ? ', ' + n : ''}. We aim to provide an excellent experience every time.`,
          neutral: (n) => `Thanks for your feedback${n ? ', ' + n : ''}. Your opinion matters to us.`,
          followPos: `We hope to see you again soon!`,
          followNeg: `Please contact us privately so we can make this right as soon as possible.`,
        },
        he: {
          thanks: (n) => `תודה רבה${n ? ', ' + n : ''}! שמחים שנהנית מהחוויה${bName ? ' ב' + bName : ''}.`,
          sorry:  (n) => `מצטערים לשמוע${n ? ', ' + n : ''}. חשוב לנו לספק חוויה מצוינת בכל ביקור.`,
          neutral: (n) => `תודה על המשוב${n ? ', ' + n : ''}. דעתך חשובה לנו.`,
          followPos: `נשמח לראותך שוב בקרוב!`,
          followNeg: `נשמח לשוחח בפרטי ולטפל בכך מיד.`,
        },
        es: {
          thanks: (n) => `¡Gracias${n ? ', ' + n : ''}! Nos alegra que hayas disfrutado la experiencia${bName ? ' en ' + bName : ''}.`,
          sorry:  (n) => `Lamentamos escuchar esto${n ? ', ' + n : ''}. Buscamos brindar una excelente experiencia siempre.`,
          neutral: (n) => `Gracias por tu comentario${n ? ', ' + n : ''}. Tu opinión es importante para nosotros.`,
          followPos: `¡Esperamos verte pronto de nuevo!`,
          followNeg: `Contáctanos en privado para solucionarlo lo antes posible.`,
        },
        de: {
          thanks: (n) => `Vielen Dank${n ? ', ' + n : ''}! Wir freuen uns, dass Ihnen die Erfahrung${bName ? ' bei ' + bName : ''} gefallen hat.`,
          sorry:  (n) => `Es tut uns leid, das zu hören${n ? ', ' + n : ''}. Wir möchten stets eine ausgezeichnete Erfahrung bieten.`,
          neutral: (n) => `Danke für Ihr Feedback${n ? ', ' + n : ''}. Ihre Meinung ist uns wichtig.`,
          followPos: `Wir freuen uns auf Ihren nächsten Besuch!`,
          followNeg: `Bitte kontaktieren Sie uns privat, damit wir das schnell klären können.`,
        },
        ar: {
          thanks: (n) => `شكرًا جزيلاً${n ? '، ' + n : ''}! يسعدنا أنك استمتعت بالتجربة${bName ? ' في ' + bName : ''}.`,
          sorry:  (n) => `نأسف لسماع ذلك${n ? '، ' + n : ''}. نهدف دائمًا إلى تقديم تجربة ممتازة.`,
          neutral: (n) => `شكرًا على ملاحظاتك${n ? '، ' + n : ''}. رأيك مهم لنا.`,
          followPos: `نتطلع لرؤيتك مرة أخرى قريبًا!`,
          followNeg: `يرجى التواصل معنا بشكل خاص لمعالجة الأمر بأسرع وقت.`,
        },
        ru: {
          thanks: (n) => `Спасибо${n ? ', ' + n : ''}! Мы рады, что вам понравилось${bName ? ' в ' + bName : ''}.`,
          sorry:  (n) => `Нам жаль это слышать${n ? ', ' + n : ''}. Мы стремимся всегда предоставлять отличный сервис.`,
          neutral: (n) => `Спасибо за ваш отзыв${n ? ', ' + n : ''}. Ваше мнение важно для нас.`,
          followPos: `Будем рады видеть вас снова!`,
          followNeg: `Свяжитесь с нами лично, чтобы мы могли быстро решить вопрос.`,
        },
      };

      const p = phrases[lang] || phrases.en;
      const opener = isPositive ? p.thanks(name) : isNegative ? p.sorry(name) : p.neutral(name);
      const follow = isNegative ? p.followNeg : p.followPos;
      const extra = specificInstructions ? ` (${specificInstructions})` : '';
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