import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SendResponseRequest {
  reviewId: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get the authenticated user
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const { reviewId }: SendResponseRequest = await req.json();

    console.log(`📤 Sending response for review: ${reviewId}`);

    // Get the review with all its details
    const { data: review, error: reviewError } = await supabaseClient
      .from('reviews')
      .select('*')
      .eq('id', reviewId)
      .single();

    if (reviewError || !review) {
      throw new Error('Review not found');
    }

    console.log(`📝 Review platform: ${review.platform}, business_id: ${review.business_id}`);

    // Get the platform connection to fetch access token
    const { data: connection, error: connectionError } = await supabaseClient
      .from('platform_connections')
      .select('*')
      .eq('user_id', user.id)
      .eq('platform', review.platform)
      .eq('business_id', review.business_id)
      .single();

    if (connectionError || !connection) {
      throw new Error(`No active connection found for ${review.platform}`);
    }

    console.log(`🔗 Found connection for business: ${connection.business_name}`);

    // Get the decrypted access token
    const { data: tokenData, error: tokenError } = await supabaseClient
      .rpc('get_user_connections')
      .eq('id', connection.id)
      .single();

    if (tokenError || !tokenData || !tokenData.access_token) {
      throw new Error('Failed to get access token');
    }

    // Determine which response to send (manual takes priority)
    const responseText = review.manual_response || review.ai_response;

    if (!responseText) {
      throw new Error('No response available to send');
    }

    console.log(`💬 Sending response: ${responseText.substring(0, 50)}...`);

    // Send response based on platform
    if (review.platform === 'facebook') {
      await sendFacebookResponse(
        review.business_id,
        tokenData.access_token,
        responseText
      );
    } else if (review.platform === 'google') {
      throw new Error('Google Business Profile response sending not yet implemented');
    } else {
      throw new Error(`Platform ${review.platform} not supported`);
    }

    // Update review status to 'sent'
    const { error: updateError } = await supabaseClient
      .from('reviews')
      .update({ 
        response_status: 'sent',
        updated_at: new Date().toISOString()
      })
      .eq('id', reviewId);

    if (updateError) {
      console.error('Error updating review status:', updateError);
      throw new Error('Failed to update review status');
    }

    console.log(`✅ Response sent successfully for review ${reviewId}`);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Response sent successfully'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('❌ Error sending response:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to send response'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});

async function sendFacebookResponse(
  reviewId: string,
  accessToken: string,
  responseText: string
): Promise<void> {
  const FACEBOOK_APP_SECRET = Deno.env.get('FACEBOOK_APP_SECRET');
  
  if (!FACEBOOK_APP_SECRET) {
    throw new Error('FACEBOOK_APP_SECRET not configured');
  }

  // Generate appsecret_proof for enhanced security
  const encoder = new TextEncoder();
  const keyData = encoder.encode(FACEBOOK_APP_SECRET);
  const messageData = encoder.encode(accessToken);
  
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
  const appsecretProof = Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  console.log(`🔐 Generated appsecret_proof for Facebook comment`);

  // Post comment to the review using Facebook Graph API
  const commentUrl = `https://graph.facebook.com/v18.0/${reviewId}/comments`;
  
  const commentResponse = await fetch(
    `${commentUrl}?message=${encodeURIComponent(responseText)}&access_token=${accessToken}&appsecret_proof=${appsecretProof}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  if (!commentResponse.ok) {
    const errorData = await commentResponse.text();
    console.error(`❌ Facebook API error:`, errorData);
    throw new Error(`Failed to post comment to Facebook: ${errorData}`);
  }

  const commentData = await commentResponse.json();
  console.log(`✅ Facebook comment posted successfully:`, commentData);
}
