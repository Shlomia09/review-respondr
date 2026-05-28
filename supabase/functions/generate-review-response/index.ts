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
    const { reviewId, userLanguage } = await req.json();
    
    const uiLanguageName: Record<string, string> = {
      'he': 'Hebrew', 'en': 'English', 'es': 'Spanish',
      'de': 'German', 'ar': 'Arabic', 'ru': 'Russian'
    };
    const ownerLanguage = uiLanguageName[userLanguage] || 'English';

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

    // Get business-specific details from platform connection
    let businessContext = '';
    let businessName = 'the team';

    if (review.business_id) {
      const { data: platformConnection } = await supabase
        .from('platform_connections')
        .select('*')
        .eq('business_id', review.business_id)
        .eq('user_id', review.user_id)
        .single();

      if (platformConnection) {
        businessName = platformConnection.business_name || businessName;
        businessContext = `
Business Name: ${platformConnection.business_name}
${platformConnection.business_category ? `Category: ${platformConnection.business_category}` : ''}
${platformConnection.business_description ? `Description: ${platformConnection.business_description}` : ''}
${platformConnection.business_about ? `About: ${platformConnection.business_about}` : ''}
${platformConnection.business_phone ? `Phone: ${platformConnection.business_phone}` : ''}
${platformConnection.business_email ? `Email: ${platformConnection.business_email}` : ''}
${platformConnection.business_website ? `Website: ${platformConnection.business_website}` : ''}
${platformConnection.business_address ? `Address: ${platformConnection.business_address}` : ''}
`;
      }
    }

    // Fallback to user's general business profile if no specific business data
    if (!businessContext) {
      const { data: businessProfile } = await supabase
        .from('business_profiles')
        .select('*')
        .eq('user_id', review.user_id)
        .single();

      if (businessProfile) {
        businessName = businessProfile.business_name;
        businessContext = `
Business: ${businessProfile.business_name}
Type: ${businessProfile.business_type}
Tone: ${businessProfile.business_tone || 'professional'}
${businessProfile.business_description ? `Description: ${businessProfile.business_description}` : ''}
${businessProfile.special_instructions ? `Special Instructions: ${businessProfile.special_instructions}` : ''}
`;
      }
    }

    const sentiment = review.sentiment === 'positive' ? 'positive' : review.sentiment === 'negative' ? 'negative' : 'neutral';
    
    let systemPrompt = `You are a professional customer service representative responding to customer reviews for ${businessName}.

${businessContext}

Guidelines:
- Be authentic and empathetic
- Keep responses concise (2-3 sentences)
- Thank customers for their feedback
- For positive reviews: Express gratitude and encourage future visits
- For negative reviews: Apologize, show understanding, and offer to resolve the issue
- Maintain a professional and warm tone
- CRITICAL: Write the "response" field in the SAME language as the review (the language the customer wrote in)
- CRITICAL: Write the "attention_reason" field in ${ownerLanguage} — this is shown to the business owner who manages the system in ${ownerLanguage}, NOT to the customer
- CRITICAL: Always sign your response with "${businessName}" at the end (e.g., "Sincerely, ${businessName}" or "Best regards, ${businessName} Team")
- Never use generic placeholders - you are representing ${businessName} specifically
- Use the business details provided above to make your response more personal and relevant`;

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

    // Call Lovable AI with tool calling to detect if review requires manual attention
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
        tools: [
          {
            type: 'function',
            function: {
              name: 'generate_response_with_attention',
              description: 'Generate a review response and determine if it requires manual attention from the business owner',
              parameters: {
                type: 'object',
                properties: {
                  response: {
                    type: 'string',
                    description: 'The generated response to the review'
                  },
                  requires_manual_attention: {
                    type: 'boolean',
                    description: 'Whether this review requires manual attention (e.g., specific order issues, complaints that need investigation, refund requests)'
                  },
                  attention_reason: {
                    type: 'string',
                    description: 'Brief explanation of why manual attention is needed (if requires_manual_attention is true)'
                  },
                  attention_priority: {
                    type: 'string',
                    enum: ['low', 'medium', 'high', 'urgent'],
                    description: 'Priority level for manual attention (urgent for refunds/legal issues, high for specific complaints, medium for follow-ups, low for minor issues)'
                  }
                },
                required: ['response', 'requires_manual_attention'],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: 'function', function: { name: 'generate_response_with_attention' } }
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
    
    // Extract tool call result
    const toolCall = aiData.choices[0]?.message?.tool_calls?.[0];
    if (!toolCall || !toolCall.function?.arguments) {
      throw new Error('No response generated from AI');
    }

    const result = JSON.parse(toolCall.function.arguments);
    const generatedResponse = result.response;
    const requiresAttention = result.requires_manual_attention || false;
    const attentionReason = result.attention_reason || null;
    const attentionPriority = result.attention_priority || null;

    if (!generatedResponse) {
      throw new Error('No response generated from AI');
    }

    console.log('AI response generated successfully', { 
      requiresAttention, 
      attentionPriority 
    });

    // Save the AI response and attention flags to the review
    const { error: updateError } = await supabase
      .from('reviews')
      .update({
        ai_response: generatedResponse,
        response_status: 'generated',
        requires_manual_attention: requiresAttention,
        attention_reason: attentionReason,
        attention_priority: attentionPriority,
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
