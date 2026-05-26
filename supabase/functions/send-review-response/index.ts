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
    // Create admin client for database operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Create client with user's JWT to verify authentication
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get the authenticated user from Bearer token (edge runtime has no session)
    const authHeader = req.headers.get('Authorization');
    const jwt = authHeader?.replace('Bearer ', '');
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser(jwt);

    if (userError || !user) {
      console.error('Authentication error:', userError);
      throw new Error('Unauthorized');
    }

    console.log(`✅ Authenticated user: ${user.id}`);

    const { reviewId }: SendResponseRequest = await req.json();

    console.log(`📤 Sending response for review: ${reviewId}`);

    // Get the review with all its details using admin client
    const { data: review, error: reviewError } = await supabaseAdmin
      .from('reviews')
      .select('*')
      .eq('id', reviewId)
      .eq('user_id', user.id) // Ensure user owns this review
      .single();

    if (reviewError || !review) {
      console.error('Review fetch error:', reviewError);
      throw new Error('Review not found');
    }

    console.log(`📝 Review platform: ${review.platform}, business_id: ${review.business_id}, connection_id: ${review.connection_id}, external_review_id: ${review.external_review_id}`);

    if (!review.external_review_id) {
      throw new Error('Review does not have an external_review_id - cannot send response back to platform');
    }

    // ⚠️  Facebook Recommendations cannot be replied to via the Graph API.
    // Attempting to do so returns Error Code 12 (Unsupported platform operation).
    // The business owner must respond manually through the Facebook Page Manager.
    if (
      review.platform === 'facebook' &&
      review.attention_reason === 'facebook_recommendation'
    ) {
      const pageUrl = review.review_url || `https://www.facebook.com/${review.business_id}/reviews`;
      console.warn(`⚠️  Blocked API send for Facebook Recommendation (Code 12 prevention). Review: ${reviewId}`);
      return new Response(
        JSON.stringify({
          error: 'facebook_recommendation_manual_only',
          message: 'Facebook Recommendations cannot be replied to via the API (Error Code 12). Please respond manually on Facebook.',
          page_url: pageUrl,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    // Get the platform connection to fetch access token
    // First try using connection_id if available, otherwise fall back to business_id lookup
    let connection;
    let connectionError;

    if (review.connection_id) {
      const result = await supabaseAdmin
        .from('platform_connections')
        .select('*')
        .eq('id', review.connection_id)
        .single();
      connection = result.data;
      connectionError = result.error;
    } else {
      const result = await supabaseAdmin
        .from('platform_connections')
        .select('*')
        .eq('user_id', user.id)
        .eq('platform', review.platform)
        .eq('external_business_id', review.business_id)
        .single();
      connection = result.data;
      connectionError = result.error;
    }

    if (connectionError || !connection) {
      console.error('Connection fetch error:', connectionError);
      throw new Error(`No active connection found for ${review.platform}`);
    }

    console.log(`🔗 Found connection for business: ${connection.business_name}`);

    // Resolve an encrypted access token from connections or tokens table
    let encryptedToken: string | null = connection.access_token;

    if (!encryptedToken) {
      console.warn('No access token in platform_connections, checking platform_tokens...');
      // 1) Try token for this specific business
      const { data: tokenRow, error: tokenError } = await supabaseAdmin
        .from('platform_tokens')
        .select('*')
        .eq('user_id', user.id)
        .eq('platform', review.platform)
        .eq('business_id', review.business_id)
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

      if (tokenError || !tokenRow?.access_token) {
        console.warn('No token for specific business_id. Falling back to latest user+platform token...');
        // 2) Fall back to the latest token for the user+platform (no business_id filter)
        const { data: anyTokenRow, error: tokenAnyError } = await supabaseAdmin
          .from('platform_tokens')
          .select('*')
          .eq('user_id', user.id)
          .eq('platform', review.platform)
          .order('updated_at', { ascending: false })
          .limit(1)
          .single();

        if (tokenAnyError || !anyTokenRow?.access_token) {
          console.error('Token lookup failed in platform_tokens (any):', tokenAnyError);
          throw new Error('No access token available for this platform (checked connections and tokens)');
        }

        console.log('✅ Found fallback token in platform_tokens (latest for user+platform)');
        encryptedToken = anyTokenRow.access_token;
      } else {
        console.log('✅ Found token in platform_tokens (by business_id)');
        encryptedToken = tokenRow.access_token;
      }
    } else {
      console.log('✅ Found token in platform_connections');
    }

    console.log(`🔓 Decrypting access token (with graceful fallback)...`);

    // Try to decrypt. If decrypt fails (e.g., token stored in plaintext), fall back to the raw value
    let accessToken: string;
    try {
      const { data: decryptedToken, error: decryptError } = await supabaseClient
        .rpc('decrypt_token', { encrypted_token: encryptedToken! });

      if (decryptError || !decryptedToken) {
        console.warn('Token decryption failed or returned empty. Falling back to raw token.', decryptError);
        accessToken = encryptedToken!;
      } else {
        accessToken = decryptedToken;
        console.log(`✅ Token decrypted successfully`);
      }
    } catch (e) {
      console.warn('Token decryption threw exception. Falling back to raw token.', e);
      accessToken = encryptedToken!;
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
        review.external_review_id,
        accessToken,
        responseText
      );
    } else if (review.platform === 'google') {
      throw new Error('Google Business Profile response sending not yet implemented');
    } else {
      throw new Error(`Platform ${review.platform} not supported`);
    }

    // Update review status to 'sent' using admin client
    const { error: updateError } = await supabaseAdmin
      .from('reviews')
      .update({ 
        response_status: 'sent',
        updated_at: new Date().toISOString()
      })
      .eq('id', reviewId)
      .eq('user_id', user.id); // Ensure user owns this review

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
