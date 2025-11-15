import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { reviewId } = await req.json();
    
    if (!reviewId) {
      throw new Error('Review ID is required');
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get the review
    const { data: review, error: reviewError } = await supabase
      .from('reviews')
      .select('*')
      .eq('id', reviewId)
      .single();

    if (reviewError) throw reviewError;
    if (!review) throw new Error('Review not found');

    // Get user's business profile for context
    const { data: businessProfile } = await supabase
      .from('business_profiles')
      .select('*')
      .eq('user_id', review.user_id)
      .single();

    // Build the prompt for AI
    const businessContext = businessProfile ? `
Business: ${businessProfile.business_name}
Type: ${businessProfile.business_type}
Tone: ${businessProfile.business_tone || 'professional'}
${businessProfile.business_description ? `Description: ${businessProfile.business_description}` : ''}
${businessProfile.special_instructions ? `Special Instructions: ${businessProfile.special_instructions}` : ''}
` : '';

    const sentiment = review.sentiment === 'positive' ? 'positive' : review.sentiment === 'negative' ? 'negative' : 'neutral';
    
    let systemPrompt = `You are a professional customer service representative responding to customer reviews.

${businessContext}

Guidelines:
- Be authentic and empathetic
- Keep responses concise (2-3 sentences)
- Thank customers for their feedback
- For positive reviews: Express gratitude and encourage future visits
- For negative reviews: Apologize, show understanding, and offer to resolve the issue
- Maintain a ${businessProfile?.business_tone || 'professional'} tone
- Write in the same language as the review
- IMPORTANT: Sign the response with the business name "${businessProfile?.business_name || 'the team'}" at the end (e.g., "Sincerely, [business name]" or "Best regards, [business name] Team")
- Never use placeholders like [Your Name] or [Company Name] - always use the actual business name provided above`;

    if (review.ai_instructions) {
      systemPrompt += `\n\nAdditional Instructions: ${review.ai_instructions}`;
    }

    const userPrompt = `Customer: ${review.customer_name}
Rating: ${review.rating}/5 stars
Platform: ${review.platform}
Sentiment: ${sentiment}
Review: "${review.content}"

Generate a thoughtful response to this ${sentiment} review.`;

    console.log('Generating AI response for review:', reviewId);

    // Call Lovable AI
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }
      if (aiResponse.status === 402) {
        throw new Error('AI usage limit reached. Please add credits to continue.');
      }
      const errorText = await aiResponse.text();
      console.error('AI gateway error:', aiResponse.status, errorText);
      throw new Error('Failed to generate AI response');
    }

    const aiData = await aiResponse.json();
    const generatedResponse = aiData.choices[0]?.message?.content;

    if (!generatedResponse) {
      throw new Error('No response generated from AI');
    }

    console.log('AI response generated successfully');

    // Save the AI response to the review
    const { error: updateError } = await supabase
      .from('reviews')
      .update({
        ai_response: generatedResponse,
        response_status: 'generated',
        updated_at: new Date().toISOString()
      })
      .eq('id', reviewId);

    if (updateError) throw updateError;

    return new Response(
      JSON.stringify({ 
        success: true, 
        response: generatedResponse 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in generate-review-response:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
