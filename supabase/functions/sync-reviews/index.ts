import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ReviewData {
  customer_name: string;
  customer_email?: string;
  platform: string;
  rating: number;
  content: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  review_date: string;
  user_id: string;
  external_review_id: string;  // Required: platform's unique review ID
  business_id?: string;
  business_name?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the authorization header from the request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Authorization header is required');
    }

    // Create Supabase client with service role for admin operations
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Verify the JWT token and get user
    const jwt = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(jwt);
    
    if (userError || !user) {
      console.error('Authentication error:', userError);
      throw new Error('Invalid authentication token');
    }

    console.log('Authenticated user:', user.id);

    const requestBody = await req.json();
    console.log('Request body:', JSON.stringify(requestBody));
    
    const { action, platform, credentials, businessId, businessName, connectionId } = requestBody;
    console.log('Action received:', action);

    switch (action) {
      case 'connect':
        return await handleConnect(platform, credentials, user.id, supabaseClient);
      case 'get_oauth_url':
        return await getOAuthUrl(platform, user.id);
      case 'check_connection':
        return await checkConnection(platform, user.id, supabaseClient);
      case 'check_all_connections':
        console.log('Handling check_all_connections action');
        return await checkAllConnections(user.id, supabaseClient);
      case 'get_businesses':
        return await getBusinesses(platform, user.id, supabaseClient);
      case 'select_business':
        return await selectBusiness(platform, businessId, businessName, user.id, supabaseClient);
      case 'sync':
        return await handleSync(platform, user.id, supabaseClient);
      case 'sync_by_connection':
        return await handleSyncByConnection(connectionId, platform, user.id, supabaseClient);
      case 'sync_all_platform':
        return await handleSyncAllPlatform(platform, user.id, supabaseClient);
      case 'disconnect':
        return await handleDisconnect(platform, user.id, supabaseClient);
      case 'disconnect_account':
        return await handleDisconnectAccount(connectionId, user.id, supabaseClient);
      default:
        console.error('Invalid action received:', action);
        throw new Error(`Invalid action: ${action}`);
    }

  } catch (error) {
    console.error('Error in sync-reviews function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function getOAuthUrl(platform: string, userId: string) {
  console.log('🔗 Getting OAuth URL for platform:', platform, 'user:', userId);
  
  const baseUrl = Deno.env.get('SUPABASE_URL');
  const redirectUrl = `${baseUrl}/functions/v1/oauth-callback`;
  
  console.log('📍 Using redirect URL:', redirectUrl);
  
  let oauthUrl = '';
  
  switch (platform) {
    case 'google':
      const googleClientId = (Deno.env.get('GOOGLE_CLIENT_ID') || '').trim();
      if (!googleClientId || googleClientId.length === 0) {
        console.error('❌ Google Client ID not found in environment');
        throw new Error('Google Client ID not configured');
      }
      
      console.log('🔑 Google Client ID found');
      
      console.log('🔑 Google Client ID found');
      
      // Updated scopes for Google Business Profile API (expanded for compatibility)
      const scopes = [
        'https://www.googleapis.com/auth/business.manage',
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile',
        'openid',
        // Legacy scope for some accounts/projects
        'https://www.googleapis.com/auth/plus.business.manage'
      ].join(' ');
      
      oauthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${googleClientId}&` +
        `redirect_uri=${encodeURIComponent(redirectUrl)}&` +
        `response_type=code&` +
        `scope=${encodeURIComponent(scopes)}&` +
        `access_type=offline&` +
        `prompt=consent&` +
        `state=${platform}_${userId}`;
      
      console.log('🎯 Generated Google OAuth URL');
      break;
      
    case 'facebook':
      // Trim whitespace from environment variables
      const facebookAppId = (Deno.env.get('FACEBOOK_APP_ID') || Deno.env.get('FB_APP_ID') || Deno.env.get('FACEBOOK_APPID') || '').trim();
      console.log('🔍 Facebook App ID check:', facebookAppId ? `Found: ${facebookAppId.substring(0, 5)}...` : 'NOT FOUND');
      console.log('🔍 Available env vars:', Object.keys(Deno.env.toObject()).filter(k => k.toLowerCase().includes('facebook')));
      
      if (!facebookAppId || facebookAppId.length === 0) {
        console.error('❌ FACEBOOK_APP_ID missing or empty in Edge Function env.');
        throw new Error('Facebook App ID not configured (set FACEBOOK_APP_ID in Supabase Edge Function secrets)');
      }
      
      console.log('🎯 Generating Facebook OAuth URL with App ID:', facebookAppId);
      
      // Request necessary scopes for listing pages and reading page reviews
      const fbScopes = [
        'public_profile',
        'pages_show_list',
        'business_management',
        // Needed to obtain a Page access token and read reviews/ratings
        'pages_manage_metadata',
        'pages_read_user_content',
        'pages_read_engagement'
      ].join(',');
      
      oauthUrl = `https://www.facebook.com/v18.0/dialog/oauth?` +
        `client_id=${facebookAppId}&` +
        `redirect_uri=${encodeURIComponent(redirectUrl)}&` +
        `scope=${encodeURIComponent(fbScopes)}&` +
        `auth_type=rerequest&` +
        `state=${platform}_${userId}&` +
        `response_type=code`;
        
      console.log('✅ Facebook OAuth URL generated with extended scopes:', fbScopes);
      break;
      
    default:
      throw new Error('Unsupported platform for OAuth');
  }

  return new Response(
    JSON.stringify({ oauth_url: oauthUrl }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function checkConnection(platform: string, userId: string, supabase: any) {
  // Check if user has valid tokens stored for this platform
  const { data: tokenData } = await supabase
    .from('platform_tokens')
    .select('*')
    .eq('user_id', userId)
    .eq('platform', platform)
    .single();

  const connected = tokenData && tokenData.access_token && new Date(tokenData.expires_at) > new Date();

  return new Response(
    JSON.stringify({ connected }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function handleConnect(platform: string, credentials: string, userId: string, supabase: any) {
  console.log(`Connecting to ${platform} for user ${userId}`);
  
  // Test the connection based on platform
  let isValid = false;
  
  switch (platform) {
    case 'google':
      isValid = await testGoogleConnection(credentials);
      break;
    case 'facebook':
      isValid = await testFacebookConnection(credentials);
      break;
    case 'trustpilot':
      isValid = await testTrustpilotConnection(credentials);
      break;
    default:
      throw new Error('Unsupported platform');
  }

  if (!isValid) {
    throw new Error('Invalid credentials or connection failed');
  }

  // Store encrypted credentials (in a real implementation, you'd encrypt these)
  console.log(`Successfully connected to ${platform}`);

  return new Response(
    JSON.stringify({ success: true, message: `Connected to ${platform}` }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function handleSync(platform: string, userId: string, supabase: any) {
  console.log(`Syncing reviews from ${platform} for user ${userId}`);
  
  // Get stored tokens for the platform
  const { data: tokenData } = await supabase
    .from('platform_tokens')
    .select('*')
    .eq('user_id', userId)
    .eq('platform', platform)
    .single();

  if (!tokenData || !tokenData.access_token) {
    throw new Error('Platform not connected. Please connect first.');
  }

  console.log('🔑 Token found, business_id:', tokenData.business_id);

  // Fetch reviews from the platform
  let reviews: ReviewData[] = [];
  
  switch (platform) {
    case 'google':
      reviews = await fetchGoogleReviews(tokenData.access_token, userId);
      break;
    case 'facebook':
      reviews = await fetchFacebookReviews(tokenData.access_token, userId, tokenData.business_id, supabase);
      break;
    case 'trustpilot':
      reviews = await fetchTrustpilotReviews(tokenData.access_token, userId);
      break;
    default:
      throw new Error('Unsupported platform');
  }

  // Insert new reviews into database with business info
  const newReviews = [];
  for (const review of reviews) {
    // Check if review already exists using external_review_id
    const { data: existsData, error: existsErr } = await supabase
      .from('reviews')
      .select('id')
      .eq('user_id', userId)
      .eq('platform', review.platform)
      .eq('external_review_id', review.external_review_id)
      .limit(1);

    if (existsErr) {
      console.error('Existence check failed:', existsErr);
    }

    if (!existsData || existsData.length === 0) {
      const { customer_name, ...reviewData } = review;

      const { error: insertErr } = await supabase
        .from('reviews')
        .insert({
          ...reviewData,
          author_name: customer_name,
          user_id: userId,
          business_id: tokenData.business_id,
        });

      if (insertErr) {
        console.error('Insert review failed:', insertErr);
      } else {
        newReviews.push(review);
      }
    }
  }

  console.log(`Imported ${newReviews.length} new reviews from ${platform}`);

  return new Response(
    JSON.stringify({ 
      success: true, 
      newReviews: newReviews.length,
      reviewCount: reviews.length
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function handleDisconnect(platform: string, userId: string, supabase: any) {
  console.log(`Disconnecting from ${platform} for user ${userId}`);
  
  // Remove ALL stored tokens and connections for this platform
  await supabase
    .from('platform_tokens')
    .delete()
    .eq('user_id', userId)
    .eq('platform', platform);
  
  await supabase
    .from('platform_connections')
    .delete()
    .eq('user_id', userId)
    .eq('platform', platform);
  
  return new Response(
    JSON.stringify({ success: true, message: `Disconnected from ${platform}` }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function handleDisconnectAccount(connectionId: string, userId: string, supabase: any) {
  console.log(`Disconnecting account ${connectionId} for user ${userId}`);
  
  // Get connection details
  const { data: connection } = await supabase
    .from('platform_connections')
    .select('*')
    .eq('id', connectionId)
    .eq('user_id', userId)
    .single();

  if (!connection) {
    throw new Error('Connection not found');
  }

  // Delete the specific connection
  await supabase
    .from('platform_connections')
    .delete()
    .eq('id', connectionId)
    .eq('user_id', userId);

  // Also delete matching platform_token
  await supabase
    .from('platform_tokens')
    .delete()
    .eq('user_id', userId)
    .eq('platform', connection.platform)
    .eq('business_id', connection.business_id);
  
  return new Response(
    JSON.stringify({ success: true }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function handleSyncByConnection(connectionId: string, platform: string, userId: string, supabase: any) {
  console.log(`Syncing reviews for connection ${connectionId}, platform ${platform}, user ${userId}`);
  
  // Get connection details including business_id
  const { data: connection } = await supabase
    .from('platform_connections')
    .select('*')
    .eq('id', connectionId)
    .eq('user_id', userId)
    .single();

  if (!connection) {
    throw new Error('Connection not found');
  }

  // Get matching platform_token
  // For Facebook, the same token can access all pages, so don't filter by business_id
  const tokenQuery = supabase
    .from('platform_tokens')
    .select('*')
    .eq('user_id', userId)
    .eq('platform', platform);
  
  // Only Google requires business_id filtering
  if (platform === 'google') {
    tokenQuery.eq('business_id', connection.business_id);
  }
  
  const { data: tokenData } = await tokenQuery.single();

  if (!tokenData || !tokenData.access_token) {
    throw new Error('Token not found for this connection');
  }

  console.log(`🔑 Token found for business ${connection.business_name} (${connection.business_id})`);

  // Fetch reviews
  let reviews: ReviewData[] = [];
  
  switch (platform) {
    case 'google':
      reviews = await fetchGoogleReviews(tokenData.access_token, userId);
      break;
  case 'facebook':
    // Use the connection's external_business_id (page id)
    reviews = await fetchFacebookReviews(tokenData.access_token, userId, connection.external_business_id, supabase);
    break;
    case 'trustpilot':
      reviews = await fetchTrustpilotReviews(tokenData.access_token, userId);
      break;
    default:
      throw new Error('Unsupported platform');
  }

  // Insert new reviews with business info - use unique index to handle duplicates
  const newReviews = [];
  for (const review of reviews) {
    // Check if review already exists using external_review_id (much more reliable)
    const { data: existsData, error: existsErr } = await supabase
      .from('reviews')
      .select('id')
      .eq('user_id', userId)
      .eq('platform', review.platform)
      .eq('external_review_id', review.external_review_id)
      .limit(1);

    if (existsErr) {
      console.error('Existence check failed:', existsErr);
    }

    if (!existsData || existsData.length === 0) {
      const { customer_name, ...reviewData } = review;

      const { error: insertErr } = await supabase
        .from('reviews')
        .insert({
          ...reviewData,
          author_name: customer_name,
          user_id: userId,
          business_id: connection.business_id,
          business_name: connection.business_name,
          connection_id: connection.id,
        });

      if (insertErr) {
        console.error('Insert review failed:', insertErr);
      } else {
        newReviews.push(review);
      }
    }
  }

  // Update last_sync timestamp
  await supabase
    .from('platform_connections')
    .update({ last_sync: new Date().toISOString() })
    .eq('id', connectionId);

  console.log(`Imported ${newReviews.length} new reviews for ${connection.business_name}`);

  return new Response(
    JSON.stringify({ 
      success: true, 
      newReviews: newReviews.length,
      reviewCount: reviews.length
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function handleSyncAllPlatform(platform: string, userId: string, supabase: any) {
  console.log(`Syncing all ${platform} accounts for user ${userId}`);
  
  // Get all connections for this platform
  const { data: connections } = await supabase
    .from('platform_connections')
    .select('*')
    .eq('user_id', userId)
    .eq('platform', platform)
    .eq('is_active', true);

  if (!connections || connections.length === 0) {
    throw new Error('No active connections found for this platform');
  }

  let totalNewReviews = 0;
  let totalReviews = 0;

  // Sync each connection
  for (const connection of connections) {
    try {
      const { data: tokenData } = await supabase
        .from('platform_tokens')
        .select('*')
        .eq('user_id', userId)
        .eq('platform', platform)
        .eq('business_id', connection.business_id)
        .single();

      if (!tokenData) continue;

      // Fetch reviews
      let reviews: ReviewData[] = [];
      
      switch (platform) {
        case 'google':
          reviews = await fetchGoogleReviews(tokenData.access_token, userId);
          break;
        case 'facebook':
          reviews = await fetchFacebookReviews(tokenData.access_token, userId, tokenData.business_id, supabase);
          break;
        case 'trustpilot':
          reviews = await fetchTrustpilotReviews(tokenData.access_token, userId);
          break;
      }

      // Insert reviews using external_review_id for dedup
      for (const review of reviews) {
        const { data: existsData, error: existsErr } = await supabase
          .from('reviews')
          .select('id')
          .eq('user_id', userId)
          .eq('platform', review.platform)
          .eq('external_review_id', review.external_review_id)
          .limit(1);

        if (existsErr) {
          console.error('Existence check failed:', existsErr);
          continue;
        }

        if (!existsData || existsData.length === 0) {
          const { customer_name, ...reviewData } = review;

          const { error: insertErr } = await supabase
            .from('reviews')
            .insert({
              ...reviewData,
              author_name: customer_name,
              user_id: userId,
              business_id: connection.business_id,
              business_name: connection.business_name,
              connection_id: connection.id,
            });

          if (insertErr) {
            console.error('Insert review failed:', insertErr);
          } else {
            totalNewReviews++;
          }
        }
      }

      totalReviews += reviews.length;

      // Update last_sync
      await supabase
        .from('platform_connections')
        .update({ last_sync: new Date().toISOString() })
        .eq('id', connection.id);

    } catch (error) {
      console.error(`Error syncing ${connection.business_name}:`, error);
    }
  }

  console.log(`Synced all ${platform} accounts: ${totalNewReviews}/${totalReviews} reviews`);

  return new Response(
    JSON.stringify({ 
      success: true, 
      newReviews: totalNewReviews,
      reviewCount: totalReviews
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}


async function getBusinesses(platform: string, userId: string, supabase: any) {
  console.log(`📝 Getting businesses for ${platform} for user ${userId}`);
  
  try {
    // Get stored tokens for the platform
    const { data: tokenData, error: tokenError } = await supabase
      .from('platform_tokens')
      .select('*')
      .eq('user_id', userId)
      .eq('platform', platform)
      .maybeSingle();

    console.log('📝 Token query result:', { tokenData, tokenError });

    if (tokenError) {
      console.error('❌ Error fetching tokens:', tokenError);
      throw new Error(`Database error: ${tokenError.message}`);
    }

    if (!tokenData || !tokenData.access_token) {
      console.log('❌ No token found for platform');
      throw new Error('Platform not connected. Please connect first.');
    }

    console.log('✅ Token found, expires at:', tokenData.expires_at);
    
    // Check if token is expired
    const now = new Date();
    const expiresAt = new Date(tokenData.expires_at);
    if (expiresAt <= now) {
      console.log('❌ Token expired:', { now: now.toISOString(), expires: expiresAt.toISOString() });
      throw new Error('Token expired. Please reconnect to the platform.');
    }

    let businesses = [];
    
    if (platform === 'google') {
      console.log('📞 Calling fetchGoogleBusinesses...');
      try {
        businesses = await fetchGoogleBusinesses(tokenData.access_token);
        console.log('📊 Businesses returned from Google:', businesses.length, JSON.stringify(businesses, null, 2));
      } catch (googleError) {
        console.error('❌ Google API Error:', googleError.message);
        throw new Error(`Google API failed: ${googleError.message}`);
      }
    } else if (platform === 'facebook') {
      console.log('📞 Calling fetchFacebookBusinesses...');
      try {
        businesses = await fetchFacebookBusinesses(tokenData.access_token);
        console.log('📊 Businesses returned from Facebook:', businesses.length);
      } catch (facebookError) {
        console.error('❌ Facebook API Error:', facebookError.message);
        throw new Error(`Facebook API failed: ${facebookError.message}`);
      }
    }

    return new Response(
      JSON.stringify({ businesses }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('❌ Error in getBusinesses:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        businesses: [],
        debug: `Failed to get businesses for ${platform}` 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
}

async function selectBusiness(platform: string, businessId: string, businessName: string | undefined, userId: string, supabase: any) {
  console.log(`Selecting business ${businessId} (${businessName || 'no-name'}) for ${platform} for user ${userId}`);
  
  try {
    // Try to find an existing connection by external_business_id
    const { data: existing } = await supabase
      .from('platform_connections')
      .select('id')
      .eq('user_id', userId)
      .eq('platform', platform)
      .eq('external_business_id', businessId)
      .maybeSingle();

    let connectionId: string | null = null;

    if (existing) {
      const { data: updated, error: updateError } = await supabase
        .from('platform_connections')
        .update({ 
          business_name: businessName || null, 
          is_active: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
        .select('id')
        .single();
      if (updateError) throw updateError;
      connectionId = updated?.id || existing.id;
    } else {
      const { data: inserted, error: insertError } = await supabase
        .from('platform_connections')
        .insert({ 
          user_id: userId, 
          platform, 
          external_business_id: businessId,
          business_name: businessName || null, 
          is_active: true,
          connected_at: new Date().toISOString(), 
          created_at: new Date().toISOString(), 
          updated_at: new Date().toISOString() 
        })
        .select('id')
        .single();
      if (insertError) throw insertError;
      connectionId = inserted?.id || null;
    }

    return new Response(
      JSON.stringify({ success: true, connectionId }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (e) {
    console.error('⚠️ Could not upsert platform_connections with name:', e);
    return new Response(
      JSON.stringify({ error: 'Failed to create/update connection' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function fetchGoogleBusinesses(accessToken: string) {
  console.log('🔍 Starting fetchGoogleBusinesses...');
  console.log('🔑 Access token length:', accessToken?.length);

  // First check if APIs are enabled and working
  try {
    const tokenInfoResponse = await fetch(`https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${accessToken}`);
    console.log('🧪 Token info response status:', tokenInfoResponse.status);
    
    if (tokenInfoResponse.ok) {
      const tokenInfo = await tokenInfoResponse.json();
      console.log('🧪 Token scope:', tokenInfo.scope);
      console.log('🧪 Token audience:', tokenInfo.audience);
      console.log('🧪 Token expires_in:', tokenInfo.expires_in);
    } else {
      const errorText = await tokenInfoResponse.text();
      console.error('🧪 Token info error:', errorText);
    }
  } catch (e) {
    console.error('Token info check failed:', e);
  }
  
  // Try the Google My Business API v4.9 (legacy but more stable)
  try {
    console.log('📞 Trying Google My Business API v4.9...');
    const accountsResponse = await fetch('https://mybusiness.googleapis.com/v4/accounts', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('📊 GMB API Response Status:', accountsResponse.status);
    
    if (accountsResponse.ok) {
      const accountsData = await accountsResponse.json();
      console.log('📊 GMB API Accounts:', JSON.stringify(accountsData, null, 2));
      
      const businesses = [];
      
      if (accountsData.accounts && accountsData.accounts.length > 0) {
        for (const account of accountsData.accounts) {
          // Get locations for each account
          const locationsResponse = await fetch(`https://mybusiness.googleapis.com/v4/${account.name}/locations`, {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          });
          
          if (locationsResponse.ok) {
            const locationsData = await locationsResponse.json();
            
            if (locationsData.locations && locationsData.locations.length > 0) {
              for (const location of locationsData.locations) {
                businesses.push({
                  id: location.name,
                  name: location.locationName || location.name,
                  address: location.address?.addressLines?.join(', ') || 'כתובת לא זמינה'
                });
              }
            }
          }
        }
      }
      
      if (businesses.length > 0) {
        console.log(`✅ Found ${businesses.length} businesses via GMB API v4.9`);
        return businesses;
      }
    }
  } catch (error) {
    console.error('❌ Error with GMB API v4.9:', error);
  }
  
  // No businesses found via GMB v4.9, trying newer APIs...
  // Continue to try Account Management + Business Information APIs below
  
  
  try {
    // Try simple accounts listing first  
    console.log('📞 Calling accounts API...');
    const accountsResponse = await fetch('https://mybusinessaccountmanagement.googleapis.com/v1/accounts', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('📊 Accounts Response Status:', accountsResponse.status);
    console.log('📊 Accounts Response Headers:', JSON.stringify([...accountsResponse.headers.entries()]));
    
    if (!accountsResponse.ok) {
      const errorText = await accountsResponse.text();
      console.error('❌ Accounts API error status:', accountsResponse.status);
      console.error('❌ Accounts API error body:', errorText);
      
      if (accountsResponse.status === 429) {
        try {
          const errorData = JSON.parse(errorText);
          if (errorData.error?.details?.[0]?.metadata?.quota_limit_value === "0") {
            throw new Error('🚫 Google My Business API is not enabled in your Google Cloud project.\n\n📋 To fix this:\n\n1. Go to console.cloud.google.com\n2. Select your project (project_number:1454990250) \n3. Go to "APIs & Services" → "Library"\n4. Search for "Google My Business API" and enable it\n5. Go to "APIs & Services" → "Quotas" \n6. Search for "My Business" quotas and increase limits\n7. Make sure billing is enabled for your project\n\n💡 After fixing, disconnect Google and reconnect to try again.');
          }
        } catch (parseError) {
          // If we can't parse the error, show the general message
        }
        throw new Error('Google API quota exceeded. Enable Google My Business API and set up billing in Google Cloud Console.');
      }
      
      console.log('🔄 Trying Business Profile API instead...');
      return await fetchGoogleBusinessProfileAPI(accessToken);
    }

    const accountsData = await accountsResponse.json();
    console.log('📊 Raw Accounts Data:', JSON.stringify(accountsData, null, 2));
    
    if (!accountsData.accounts || accountsData.accounts.length === 0) {
      console.log('⚠️ No accounts found in response');
      console.log('🔄 Trying Business Profile API instead...');
      return await fetchGoogleBusinessProfileAPI(accessToken);
    }
    
    const businesses = [];

    for (const account of accountsData.accounts) {
      console.log(`📍 Processing account: ${account.name}`);
      
      // Try to get locations for this account
      try {
        const locationUrl = `https://mybusinessbusinessinformation.googleapis.com/v1/${account.name}/locations`;
        console.log(`📞 Calling locations URL: ${locationUrl}`);
        
        const locationsResponse = await fetch(locationUrl, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        console.log(`📊 Locations Response Status for ${account.name}:`, locationsResponse.status);

        if (locationsResponse.ok) {
          const locationsData = await locationsResponse.json();
          console.log(`📊 Locations Data for ${account.name}:`, JSON.stringify(locationsData, null, 2));
          
          if (locationsData.locations && locationsData.locations.length > 0) {
            for (const location of locationsData.locations) {
              businesses.push({
                id: location.name,
                name: location.title || location.displayName || location.name,
                address: location.storefrontAddress?.addressLines?.join(', ') || 'No address',
                account: account.accountName || account.name
              });
              console.log(`✅ Added business: ${location.title || location.displayName || location.name}`);
            }
          } else {
            console.log(`⚠️ No locations found for account: ${account.name}`);
          }
        } else {
          const locErrorText = await locationsResponse.text();
          console.error(`❌ Locations API error for ${account.name}:`, locErrorText);
        }
      } catch (locError) {
        console.error(`❌ Error fetching locations for ${account.name}:`, locError);
      }
    }

    console.log(`✅ Total businesses found: ${businesses.length}`);
    if (businesses.length === 0) {
      try {
        console.log('🔎 No businesses from per-account listing, trying aggregated accounts/-/locations ...');
        const aggResp = await fetch('https://mybusinessbusinessinformation.googleapis.com/v1/accounts/-/locations?readMask=name,title,displayName,storefrontAddress', {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });
        console.log('📊 Aggregated locations status:', aggResp.status);
        if (aggResp.ok) {
          const aggData = await aggResp.json();
          for (const location of aggData.locations || []) {
            businesses.push({
              id: location.name,
              name: location.title || location.displayName || location.name,
              address: location.storefrontAddress?.addressLines?.join(', ') || 'No address'
            });
          }
          console.log(`✅ Aggregated added ${businesses.length} businesses`);
        } else {
          const aggErr = await aggResp.text();
          console.error('❌ Aggregated locations error:', aggErr);
        }
      } catch (e) {
        console.error('❌ Error calling aggregated locations:', e);
      }
    }
    if (businesses.length === 0) {
      console.log('🔄 Still empty, trying Business Profile API as final fallback...');
      return await fetchGoogleBusinessProfileAPI(accessToken);
    }
    return businesses;
  } catch (error) {
    console.error('❌ Error in fetchGoogleBusinesses:', error);
    console.log('🔄 Trying Business Profile API as fallback...');
    return await fetchGoogleBusinessProfileAPI(accessToken);
  }
}

// Google Business Profile API (newest API)
async function fetchGoogleBusinessProfileAPI(accessToken: string) {
  try {
    console.log('📞 Using Google Business Profile API...');
    
    // Try to get locations directly using the newer API
    const locationsResponse = await fetch('https://mybusinessbusinessinformation.googleapis.com/v1/locations:search', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // Empty filter to return all accessible locations
        // Some projects may require specifying a parent; if so, the fallback below will handle it
      })
    });

    console.log('📊 Business Profile API Response Status:', locationsResponse.status);

    if (!locationsResponse.ok) {
      const errorText = await locationsResponse.text();
      console.error('❌ Business Profile API error:', errorText);
      
      // Check if this is a quota issue
      if (locationsResponse.status === 429) {
        console.log('⚠️ Google API quota exceeded - this is normal during development');
        throw new Error('Google API quota exceeded. This is a temporary limitation during development. Please try again later or contact support for production quota increase.');
      }
      
      console.log('🔄 Trying fallback method...');
      return await fetchGoogleBusinessesOldAPI(accessToken);
    }

    const locationsData = await locationsResponse.json();
    console.log('📊 Business Profile API Data:', JSON.stringify(locationsData, null, 2));
    
    const businesses = [];

    if (locationsData.locations && locationsData.locations.length > 0) {
      for (const location of locationsData.locations) {
        businesses.push({
          id: location.name,
          name: location.title || location.displayName || location.name,
          address: location.storefrontAddress?.addressLines?.join(', ') || 'No address'
        });
        console.log(`✅ Added business from Profile API: ${location.title || location.displayName || location.name}`);
      }
    } else {
      console.log('⚠️ No locations found in Business Profile API response');
    }

    console.log(`✅ Business Profile API found businesses: ${businesses.length}`);
    return businesses;
  } catch (error) {
    console.error('❌ Error with Business Profile API:', error);
    console.log('🔄 Trying fallback method...');
    return await fetchGoogleBusinessesOldAPI(accessToken);
  }
}

async function fetchGoogleBusinessesNewAPI(accessToken: string) {
  try {
    console.log('📞 Using new Google Business Profile API...');
    
    // First try to get user's business accounts
    const accountsResponse = await fetch('https://businessprofileperformance.googleapis.com/v1/accounts', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('📊 New API Accounts Response Status:', accountsResponse.status);

    if (!accountsResponse.ok) {
      const errorText = await accountsResponse.text();
      console.error('❌ New API Accounts error:', errorText);
      return [];
    }

    const accountsData = await accountsResponse.json();
    console.log('📊 New API Accounts Data:', JSON.stringify(accountsData, null, 2));
    
    const businesses = [];

    if (accountsData.accounts) {
      for (const account of accountsData.accounts) {
        // Get locations for this account
        const locationsResponse = await fetch(`${account.name}/locations`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (locationsResponse.ok) {
          const locationsData = await locationsResponse.json();
          if (locationsData.locations) {
            for (const location of locationsData.locations) {
              businesses.push({
                id: location.name,
                name: location.title || location.displayName || location.name,
                address: location.storefrontAddress?.addressLines?.join(', ') || 'No address'
              });
            }
          }
        }
      }
    }

    console.log('✅ New API found businesses:', businesses.length);
    return businesses;
  } catch (error) {
    console.error('❌ Error fetching Google businesses:', error);
    // Fallback to old API
    console.log('🔄 Trying fallback method due to error...');
    return await fetchGoogleBusinessesOldAPI(accessToken);
  }
}

// Fallback function using old API
async function fetchGoogleBusinessesOldAPI(accessToken: string) {
  try {
    console.log('📞 Using old My Business Account Management API...');
    const response = await fetch('https://mybusinessaccountmanagement.googleapis.com/v1/accounts', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('📊 Old API Response Status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Old API error status:', response.status);
      console.error('❌ Old API error body:', errorText);
      return [];
    }

    const data = await response.json();
    console.log('📊 Old API Response Data:', JSON.stringify(data, null, 2));
    const businesses = [];

    if (data.accounts) {
      for (const account of data.accounts) {
        // Get locations for each account
        const locationsResponse = await fetch(`https://mybusinessbusinessinformation.googleapis.com/v1/${account.name}/locations`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (locationsResponse.ok) {
          const locationsData = await locationsResponse.json();
          if (locationsData.locations) {
            for (const location of locationsData.locations) {
              businesses.push({
                id: location.name,
                name: location.title || location.name,
                address: location.storefrontAddress?.addressLines?.join(', ') || 'No address',
                account: account.accountName || account.name
              });
            }
          }
        }
      }
    }

    console.log('✅ Old API found businesses:', businesses.length);
    return businesses;
  } catch (error) {
    console.error('❌ Error with old API:', error);
    return [];
  }
}

async function fetchFacebookBusinesses(accessToken: string) {
  try {
    // Get Facebook App Secret from environment
    const appSecret = Deno.env.get('FACEBOOK_APP_SECRET')?.trim();
    if (!appSecret) {
      console.error('❌ FACEBOOK_APP_SECRET not found');
      return [];
    }

    // Generate appsecret_proof required for server-side API calls
    const encoder = new TextEncoder();
    const keyData = encoder.encode(appSecret);
    const messageData = encoder.encode(accessToken);
    
    const key = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    const signature = await crypto.subtle.sign('HMAC', key, messageData);
    const appsecretProof = Array.from(new Uint8Array(signature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    console.log('🔐 Generated appsecret_proof for Facebook API');

    // 1) Pages the person manages directly
    let personPages: any[] = [];
    let nextUrl = `https://graph.facebook.com/v18.0/me/accounts?fields=id,name,category&access_token=${accessToken}&appsecret_proof=${appsecretProof}&limit=100`;

    while (nextUrl) {
      const response = await fetch(nextUrl);
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Facebook me/accounts error:', errorText);
        break;
      }
      const data = await response.json();
      console.log(`✅ Facebook API response (me/accounts): ${data.data?.length || 0} pages`);
      if (data.data && data.data.length > 0) {
        personPages = personPages.concat(data.data);
      }
      nextUrl = data.paging?.next || null;
      if (nextUrl) console.log('📄 Fetching next page (me/accounts)...');
    }

    // 2) Pages available via Business Manager (owned or client pages)
    let bmPages: any[] = [];
    try {
      let bizNext = `https://graph.facebook.com/v18.0/me/businesses?access_token=${accessToken}&appsecret_proof=${appsecretProof}&limit=100`;
      const businessIds: string[] = [];
      while (bizNext) {
        const bizRes = await fetch(bizNext);
        if (!bizRes.ok) {
          const txt = await bizRes.text();
          console.warn('⚠️ me/businesses error (likely missing business_management):', txt);
          break;
        }
        const bizData = await bizRes.json();
        for (const b of bizData.data || []) businessIds.push(b.id);
        bizNext = bizData.paging?.next || null;
      }

      for (const bizId of businessIds) {
        for (const edge of ['owned_pages','client_pages']) {
          const pagesUrl = `https://graph.facebook.com/v18.0/${bizId}/${edge}?fields=id,name,category&access_token=${accessToken}&appsecret_proof=${appsecretProof}&limit=100`;
          let edgeNext: string | null = pagesUrl;
          while (edgeNext) {
            const pRes = await fetch(edgeNext);
            if (!pRes.ok) {
              const txt = await pRes.text();
              console.warn(`⚠️ ${edge} fetch error for business ${bizId}:`, txt);
              break;
            }
            const pData = await pRes.json();
            bmPages = bmPages.concat(pData.data || []);
            edgeNext = pData.paging?.next || null;
          }
        }
      }
      console.log(`✅ Business Manager pages loaded: ${bmPages.length}`);
    } catch (bmErr) {
      console.warn('⚠️ Business Manager fallback failed:', bmErr);
    }

    // Deduplicate by id
    const map = new Map<string, any>();
    for (const p of [...personPages, ...bmPages]) {
      if (p && p.id && !map.has(p.id)) map.set(p.id, p);
    }
    const allPages = Array.from(map.values());

    console.log(`✅ Total Facebook pages found (merged): ${allPages.length}`);
    console.log('📋 Page details:', JSON.stringify(allPages.map(p => ({ id: p.id, name: p.name, category: p.category })), null, 2));

    return allPages.map((page: any) => ({
      id: page.id,
      name: page.name,
      category: page.category || 'Business'
    }));
  } catch (error) {
    console.error('❌ Error fetching Facebook businesses:', error);
    return [];
  }
}

// Platform-specific review fetchers

// Real platform-specific review fetchers
async function fetchGoogleReviews(accessToken: string, userId: string): Promise<ReviewData[]> {
  try {
    // First, get the business accounts
    const accountsResponse = await fetch(
      'https://mybusinessaccountmanagement.googleapis.com/v1/accounts',
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!accountsResponse.ok) {
      throw new Error('Failed to fetch Google business accounts');
    }

    const accountsData = await accountsResponse.json();
    const reviews: ReviewData[] = [];

    // For each account, get locations and their reviews
    for (const account of accountsData.accounts || []) {
      const locationsResponse = await fetch(
        `https://mybusinessbusinessinformation.googleapis.com/v1/${account.name}/locations`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (locationsResponse.ok) {
        const locationsData = await locationsResponse.json();
        
        for (const location of locationsData.locations || []) {
          const reviewsResponse = await fetch(
            `https://mybusiness.googleapis.com/v4/${location.name}/reviews`,
            {
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
              }
            }
          );

          if (reviewsResponse.ok) {
            const reviewsData = await reviewsResponse.json();
            
            for (const review of reviewsData.reviews || []) {
              reviews.push({
                customer_name: review.reviewer?.displayName || 'Anonymous',
                platform: 'google',
                rating: parseInt(review.starRating || '5'),
                content: review.comment || '',
                sentiment: review.starRating >= 4 ? 'positive' : review.starRating <= 2 ? 'negative' : 'neutral',
                review_date: review.createTime,
                user_id: userId,
                external_review_id: review.reviewId || review.name || `google_${Date.now()}_${Math.random()}`,
              });
            }
          }
        }
      }
    }

    return reviews;
  } catch (error) {
    console.error('Error fetching Google reviews:', error);
    return [];
  }
}

async function fetchFacebookReviews(accessToken: string, userId: string, businessId: string | undefined, supabase: any): Promise<ReviewData[]> {
  try {
    console.log('🔍 Starting Facebook reviews fetch for user:', userId);
    console.log('📄 Business ID:', businessId || 'Not specified');
    
    // Get Facebook App Secret from environment
    const appSecret = Deno.env.get('FACEBOOK_APP_SECRET')?.trim();
    if (!appSecret) {
      console.error('❌ FACEBOOK_APP_SECRET not found');
      return [];
    }

    // Generate appsecret_proof
    const encoder = new TextEncoder();
    const keyData = encoder.encode(appSecret);
    const messageData = encoder.encode(accessToken);
    
    const key = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    const signature = await crypto.subtle.sign('HMAC', key, messageData);
    const appsecretProof = Array.from(new Uint8Array(signature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    console.log('🔐 Generated appsecret_proof');

    const reviews: ReviewData[] = [];
    
    // If we have a specific business ID, only get reviews for that page
    if (businessId) {
      console.log(`📞 Fetching reviews for specific page: ${businessId}`);
      
      // Try to get page access token first
      const pageTokenUrl = `https://graph.facebook.com/${businessId}?fields=access_token&access_token=${accessToken}&appsecret_proof=${appsecretProof}`;
      console.log('🔗 Requesting page token...');
      const pageTokenResponse = await fetch(pageTokenUrl);

      let pageAccessToken = accessToken;
      if (pageTokenResponse.ok) {
        const pageTokenData = await pageTokenResponse.json();
        if (pageTokenData.access_token) {
          pageAccessToken = pageTokenData.access_token;
          console.log('✅ Got page-specific access token');
        }
      }

      // Fallback: search in me/accounts for this page's token
      if (pageAccessToken === accessToken) {
        console.log('⚠️ Could not get page token directly, trying me/accounts fallback');
        const accountsResp = await fetch(`https://graph.facebook.com/me/accounts?fields=id,access_token&access_token=${accessToken}&appsecret_proof=${appsecretProof}`);
        if (accountsResp.ok) {
          const accountsData = await accountsResp.json();
          const matched = (accountsData.data || []).find((p: any) => p.id === businessId);
          if (matched?.access_token) {
            pageAccessToken = matched.access_token;
            console.log('✅ Found page token via me/accounts');
          } else {
            console.log('⚠️ No page token found in me/accounts for this page');
          }
        } else {
          const errText = await accountsResp.text();
          console.log('⚠️ me/accounts fallback failed:', errText);
        }
      }
      
      // Generate appsecret_proof for page token
      const pageMessageData = encoder.encode(pageAccessToken);
      const pageSignature = await crypto.subtle.sign('HMAC', key, pageMessageData);
      const pageAppsecretProof = Array.from(new Uint8Array(pageSignature))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
      
      // Fetch page information to get business details
      console.log(`📋 Fetching page details for business: ${businessId}`);
      const pageInfoResponse = await fetch(
        `https://graph.facebook.com/${businessId}?access_token=${pageAccessToken}&appsecret_proof=${pageAppsecretProof}&fields=name,about,category,description,phone,emails,website,location`
      );

      let pageInfo = null;
      if (pageInfoResponse.ok) {
        pageInfo = await pageInfoResponse.json();
        console.log(`✅ Got page info for business ${businessId}`);

        // Update platform_connections with business details
        const { error: updateError } = await supabase
          .from('platform_connections')
          .update({
            business_description: pageInfo.description || pageInfo.about || null,
            business_category: pageInfo.category || null,
            business_phone: pageInfo.phone || null,
            business_email: pageInfo.emails?.[0] || null,
            business_website: pageInfo.website || null,
            business_address: pageInfo.location ? 
              `${pageInfo.location.street || ''}, ${pageInfo.location.city || ''}, ${pageInfo.location.country || ''}`.trim() : null,
            business_about: pageInfo.about || null,
          })
          .eq('platform', 'facebook')
          .eq('external_business_id', businessId)
          .eq('user_id', userId);

        if (updateError) {
          console.error('Error updating business details:', updateError);
        } else {
          console.log(`✅ Updated business details for business ${businessId}`);
        }
      }
      
      // Try endpoint to get reviews (ratings endpoint only; /reviews is deprecated/unsupported)
      const endpoints = [
        `https://graph.facebook.com/${businessId}/ratings?fields=id,reviewer,rating,review_text,created_time,recommendation_type,open_graph_story`
      ];
      
      for (const endpoint of endpoints) {
        console.log(`📞 Trying endpoint: ${endpoint}`);
        const reviewsResponse = await fetch(
          `${endpoint}&access_token=${pageAccessToken}&appsecret_proof=${pageAppsecretProof}`
        );

        console.log(`📊 Response status: ${reviewsResponse.status}`);
        
        if (reviewsResponse.ok) {
          const reviewsData = await reviewsResponse.json();
          console.log(`📊 Reviews data:`, JSON.stringify(reviewsData, null, 2));
          
          if (reviewsData.data && reviewsData.data.length > 0) {
            console.log(`✅ Found ${reviewsData.data.length} reviews`);
            
            for (const review of reviewsData.data) {
              // Determine rating from Facebook data
              let rating = 3; // Default neutral
              if (review.rating) {
                rating = review.rating;
              } else if (review.recommendation_type) {
                // Map recommendation_type to rating
                if (review.recommendation_type === 'positive' || review.recommendation_type === 'recommend') {
                  rating = 5;
                } else if (review.recommendation_type === 'negative' || review.recommendation_type.includes("doesn't recommend")) {
                  rating = 1;
                }
              }

              // Determine sentiment based on actual rating
              const sentiment = rating >= 4 ? 'positive' : rating <= 2 ? 'negative' : 'neutral';

              // Use the review ID or story ID directly (Facebook recognizes these as objects)
              const externalReviewId = review.id || review.open_graph_story?.id;
              
              if (!externalReviewId) {
                console.warn(`⚠️ Review missing ID, skipping:`, review);
                continue;
              }

              reviews.push({
                customer_name: review.reviewer?.name || 'Anonymous',
                platform: 'facebook',
                rating: rating,
                content: review.review_text || '',
                sentiment: sentiment,
                review_date: review.created_time,
                user_id: userId,
                business_id: businessId,
                business_name: pageInfo?.name || null,
                external_review_id: externalReviewId,
              });
            }
            break; // Found reviews, stop trying other endpoints
          } else {
            console.log(`⚠️ Endpoint returned no reviews`);
          }
        } else {
          const errorText = await reviewsResponse.text();
          console.error(`❌ Endpoint failed: ${errorText}`);
          try {
            const errJson = JSON.parse(errorText);
            const code = errJson?.error?.code;
            if (code === 283) {
              throw new Error('FACEBOOK_MISSING_PERMISSIONS: The app needs pages_read_user_content (and pages_read_engagement). Please reconnect Facebook and approve all requested permissions.');
            }
          } catch (_) {
            // ignore JSON parse failure
          }
        }
      }
    } else {
      // Legacy: Get all pages if no specific business ID
      console.log('📞 No business ID specified, fetching all pages...');
      
      const pagesResponse = await fetch(
        `https://graph.facebook.com/me/accounts?access_token=${accessToken}&appsecret_proof=${appsecretProof}`
      );

      if (!pagesResponse.ok) {
        throw new Error('Failed to fetch Facebook pages');
      }

      const pagesData = await pagesResponse.json();
      console.log(`📊 Found ${pagesData.data?.length || 0} pages`);

      // For each page, get reviews
      for (const page of pagesData.data || []) {
        console.log(`📄 Processing page: ${page.name} (${page.id})`);
        
        // First, fetch page details to get business information
        console.log(`📋 Fetching page details for: ${page.name}`);
        
        // Generate appsecret_proof for page token
        const pageMessageData = encoder.encode(page.access_token);
        const pageSignature = await crypto.subtle.sign('HMAC', key, pageMessageData);
        const pageAppsecretProof = Array.from(new Uint8Array(pageSignature))
          .map(b => b.toString(16).padStart(2, '0'))
          .join('');

        // Fetch page information including business details
        const pageInfoResponse = await fetch(
          `https://graph.facebook.com/${page.id}?access_token=${page.access_token}&appsecret_proof=${pageAppsecretProof}&fields=name,about,category,description,phone,emails,website,location`
        );

        let pageInfo = null;
        if (pageInfoResponse.ok) {
          pageInfo = await pageInfoResponse.json();
          console.log(`✅ Got page info for ${page.name}`);

          // Update platform_connections with business details
          const { error: updateError } = await supabase
            .from('platform_connections')
            .update({
              business_description: pageInfo.description || pageInfo.about || null,
              business_category: pageInfo.category || null,
              business_phone: pageInfo.phone || null,
              business_email: pageInfo.emails?.[0] || null,
              business_website: pageInfo.website || null,
              business_address: pageInfo.location ? 
                `${pageInfo.location.street || ''}, ${pageInfo.location.city || ''}, ${pageInfo.location.country || ''}`.trim() : null,
              business_about: pageInfo.about || null,
            })
            .eq('platform', 'facebook')
            .eq('external_business_id', page.id)
            .eq('user_id', userId);

          if (updateError) {
            console.error('Error updating business details:', updateError);
          } else {
            console.log(`✅ Updated business details for ${page.name}`);
          }
        }

        // Now fetch ratings for this page
        const reviewsResponse = await fetch(
          `https://graph.facebook.com/${page.id}/ratings?access_token=${page.access_token}&appsecret_proof=${pageAppsecretProof}&fields=reviewer,rating,review_text,created_time,recommendation_type`
        );

        if (reviewsResponse.ok) {
          const reviewsData = await reviewsResponse.json();
          console.log(`📊 Page ${page.name} has ${reviewsData.data?.length || 0} reviews`);
          
          for (const review of reviewsData.data || []) {
            // Determine rating from Facebook data
            let rating = 3; // Default neutral
            if (review.rating) {
              rating = review.rating;
            } else if (review.recommendation_type) {
              // Map recommendation_type to rating
              if (review.recommendation_type === 'positive' || review.recommendation_type === 'recommend') {
                rating = 5;
              } else if (review.recommendation_type === 'negative' || review.recommendation_type.includes("doesn't recommend")) {
                rating = 1;
              }
            }

            // Determine sentiment based on actual rating
            const sentiment = rating >= 4 ? 'positive' : rating <= 2 ? 'negative' : 'neutral';

            // Use the review ID or story ID directly (Facebook recognizes these as objects)
            const externalReviewId = review.id || review.open_graph_story?.id;
            
            if (!externalReviewId) {
              console.warn(`⚠️ Review missing ID, skipping:`, review);
              continue;
            }

            reviews.push({
              customer_name: review.reviewer?.name || 'Anonymous',
              platform: 'facebook',
              rating: rating,
              content: review.review_text || '',
              sentiment: sentiment,
              review_date: review.created_time,
              user_id: userId,
              business_id: page.id,
              business_name: pageInfo?.name || page.name || null,
              external_review_id: externalReviewId,
            });
          }
        } else {
          const errorText = await reviewsResponse.text();
          console.error(`❌ Page ratings fetch failed: ${errorText}`);
          try {
            const errJson = JSON.parse(errorText);
            const code = errJson?.error?.code;
            if (code === 283) {
              throw new Error('FACEBOOK_MISSING_PERMISSIONS: The app needs pages_read_user_content (and pages_read_engagement). Please reconnect Facebook and approve all requested permissions.');
            }
          } catch (_) {
            // ignore JSON parse failure
          }
        }
      }
    }

    console.log(`✅ Total reviews fetched: ${reviews.length}`);
    return reviews;
  } catch (error) {
    console.error('❌ Error fetching Facebook reviews:', error);
    return [];
  }
}

async function fetchTrustpilotReviews(apiKey: string, userId: string): Promise<ReviewData[]> {
  try {
    // This would require proper Trustpilot API implementation
    // For now, returning empty array as Trustpilot API is more complex
    console.log('Trustpilot API integration would be implemented here');
    return [];
  } catch (error) {
    console.error('Error fetching Trustpilot reviews:', error);
    return [];
  }
}

// Add missing closing braces for any unclosed functions
async function checkAllConnections(userId: string, supabase: any) {
  console.log(`Checking all platform connections for user ${userId}`);
  
  const platforms = ['google', 'facebook', 'trustpilot'];
  const allConnections = [];
  
  for (const platform of platforms) {
    try {
      // Get ALL connections for this platform (not just one)
      const { data: connections, error } = await supabase
        .from('platform_connections')
        .select('*')
        .eq('user_id', userId)
        .eq('platform', platform)
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) {
        console.error(`Error fetching ${platform} connections:`, error);
        continue;
      }

      if (connections && connections.length > 0) {
        for (const conn of connections) {
          // Get review count for this specific connection
          const { data: reviews } = await supabase
            .from('reviews')
            .select('id', { count: 'exact' })
            .eq('user_id', userId)
            .eq('platform', platform)
            .eq('connection_id', conn.id);

          allConnections.push({
            id: conn.id,
            platform,
            connected: true,
            reviewCount: reviews?.length || 0,
            businessId: conn.external_business_id,
            businessName: conn.business_name,
            lastSync: conn.last_sync_at,
          });
        }
      } else {
        // Platform not connected at all - show as disconnected
        allConnections.push({
          platform,
          connected: false,
          reviewCount: 0
        });
      }
    } catch (error) {
      console.error(`Error checking ${platform} connections:`, error);
      allConnections.push({
        platform,
        connected: false
      });
    }
  }

  return new Response(
    JSON.stringify({ connections: allConnections }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function testGoogleConnection(credentials: string): Promise<boolean> {
  // Placeholder for Google connection testing
  return true;
}

async function testFacebookConnection(credentials: string): Promise<boolean> {
  // Placeholder for Facebook connection testing  
  return true;
}

async function testTrustpilotConnection(credentials: string): Promise<boolean> {
  // Placeholder for Trustpilot connection testing
  return true;
}