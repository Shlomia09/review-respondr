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

    console.log(`📝 Review platform: ${review.platform}, business_id: ${review.business_id}`);

    // Get the platform connection to fetch access token
    const { data: connection, error: connectionError } = await supabaseAdmin
      .from('platform_connections')
      .select('*')
      .eq('user_id', user.id)
      .eq('platform', review.platform)
      .eq('business_id', review.business_id)
      .single();

    if (connectionError || !connection) {
      console.error('Connection fetch error:', connectionError);
      throw new Error(`No active connection found for ${review.platform}`);
    }

    console.log(`🔗 Found connection for business: ${connection.business_name}`);

    // Resolve an encrypted access token from connections or tokens table
    let encryptedToken: string | null = connection.access_token;

    if (!encryptedToken) {
      console.warn('No access token in platform_connections, checking platform_tokens...');
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
        console.error('Token lookup failed in platform_tokens:', tokenError);
        throw new Error('No access token available for this platform (checked connections and tokens)');
      }

      console.log('✅ Found token in platform_tokens');
      encryptedToken = tokenRow.access_token;
    } else {
      console.log('✅ Found token in platform_connections');
    }

    console.log(`🔓 Decrypting access token...`);

    const { data: decryptedToken, error: decryptError } = await supabaseClient
      .rpc('decrypt_token', { encrypted_token: encryptedToken });

    if (decryptError || !decryptedToken) {
      console.error('Token decryption error:', decryptError);
      throw new Error('Failed to decrypt access token');
    }

    console.log(`✅ Token decrypted successfully`);

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
        decryptedToken,
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
