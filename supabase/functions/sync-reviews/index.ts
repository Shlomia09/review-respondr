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
    
    const { action, platform, credentials, businessId } = requestBody;
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
        return await selectBusiness(platform, businessId, user.id, supabaseClient);
      case 'sync':
        return await handleSync(platform, user.id, supabaseClient);
      case 'disconnect':
        return await handleDisconnect(platform, user.id, supabaseClient);
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
      const googleClientId = Deno.env.get('GOOGLE_CLIENT_ID');
      if (!googleClientId) {
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
      const facebookAppId = Deno.env.get('FACEBOOK_APP_ID');
      if (!facebookAppId) {
        throw new Error('Facebook App ID not configured');
      }
      
      oauthUrl = `https://www.facebook.com/v18.0/dialog/oauth?` +
        `client_id=${facebookAppId}&` +
        `redirect_uri=${encodeURIComponent(redirectUrl)}&` +
        `scope=${encodeURIComponent('pages_show_list,pages_read_engagement')}&` +
        `state=${platform}_${userId}&` +
        `response_type=code`;
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

  // Fetch reviews from the platform
  let reviews: ReviewData[] = [];
  
  switch (platform) {
    case 'google':
      reviews = await fetchGoogleReviews(tokenData.access_token, userId);
      break;
    case 'facebook':
      reviews = await fetchFacebookReviews(tokenData.access_token, userId);
      break;
    case 'trustpilot':
      reviews = await fetchTrustpilotReviews(tokenData.access_token, userId);
      break;
    default:
      throw new Error('Unsupported platform');
  }

  // Insert new reviews into database
  const newReviews = [];
  for (const review of reviews) {
    const { data, error } = await supabase
      .from('reviews')
      .upsert({
        ...review,
        user_id: userId,
      }, {
        onConflict: 'customer_name,platform,review_date',
        ignoreDuplicates: true
      });

    if (!error) {
      newReviews.push(review);
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
  
  // Remove stored tokens
  await supabase
    .from('platform_tokens')
    .delete()
    .eq('user_id', userId)
    .eq('platform', platform);
  
  return new Response(
    JSON.stringify({ success: true, message: `Disconnected from ${platform}` }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function getBusinesses(platform: string, userId: string, supabase: any) {
  console.log(`Getting businesses for ${platform} for user ${userId}`);
  
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

  let businesses = [];
  
  if (platform === 'google') {
    businesses = await fetchGoogleBusinesses(tokenData.access_token);
  } else if (platform === 'facebook') {
    businesses = await fetchFacebookBusinesses(tokenData.access_token);
  }

  return new Response(
    JSON.stringify({ businesses }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function selectBusiness(platform: string, businessId: string, userId: string, supabase: any) {
  console.log(`Selecting business ${businessId} for ${platform} for user ${userId}`);
  
  // Update the platform_tokens record with the selected business
  const { error: updateError } = await supabase
    .from('platform_tokens')
    .update({ business_id: businessId })
    .eq('user_id', userId)
    .eq('platform', platform);

  if (updateError) {
    console.error('Error updating business selection:', updateError);
    throw new Error('Failed to select business');
  }

  return new Response(
    JSON.stringify({ success: true }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function fetchGoogleBusinesses(accessToken: string) {
  console.log('🔍 Starting fetchGoogleBusinesses...');
  console.log('🔑 Access token length:', accessToken.length);
  
  // Let's try a very simple approach first - check token permissions
  try {
    const tokenInfoResponse = await fetch(`https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${accessToken}`);
    console.log('🧪 Token info response status:', tokenInfoResponse.status);
    
    if (tokenInfoResponse.ok) {
      const tokenInfo = await tokenInfoResponse.json();
      console.log('🧪 Token scope:', tokenInfo.scope);
      console.log('🧪 Token audience:', tokenInfo.audience);
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
    const response = await fetch(`https://graph.facebook.com/v18.0/me/accounts?access_token=${accessToken}`);
    
    if (!response.ok) {
      console.error('Facebook businesses API error:', await response.text());
      return [];
    }

    const data = await response.json();
    return data.data?.map((page: any) => ({
      id: page.id,
      name: page.name,
      category: page.category || 'Business'
    })) || [];
  } catch (error) {
    console.error('Error fetching Facebook businesses:', error);
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

async function fetchFacebookReviews(accessToken: string, userId: string): Promise<ReviewData[]> {
  try {
    // Get user's pages
    const pagesResponse = await fetch(
      `https://graph.facebook.com/me/accounts?access_token=${accessToken}`
    );

    if (!pagesResponse.ok) {
      throw new Error('Failed to fetch Facebook pages');
    }

    const pagesData = await pagesResponse.json();
    const reviews: ReviewData[] = [];

    // For each page, get reviews
    for (const page of pagesData.data || []) {
      const reviewsResponse = await fetch(
        `https://graph.facebook.com/${page.id}/ratings?access_token=${page.access_token}&fields=reviewer,rating,review_text,created_time`
      );

      if (reviewsResponse.ok) {
        const reviewsData = await reviewsResponse.json();
        
        for (const review of reviewsData.data || []) {
          reviews.push({
            customer_name: review.reviewer?.name || 'Anonymous',
            platform: 'facebook',
            rating: review.rating || 5,
            content: review.review_text || '',
            sentiment: review.rating >= 4 ? 'positive' : review.rating <= 2 ? 'negative' : 'neutral',
            review_date: review.created_time,
            user_id: userId,
          });
        }
      }
    }

    return reviews;
  } catch (error) {
    console.error('Error fetching Facebook reviews:', error);
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
  const platformStatuses = [];
  
  for (const platform of platforms) {
    try {
      // Check if user has valid tokens stored for this platform
      const { data: tokenData } = await supabase
        .from('platform_tokens')
        .select('*')
        .eq('user_id', userId)
        .eq('platform', platform)
        .single();

      const connected = tokenData && tokenData.access_token && new Date(tokenData.expires_at) > new Date();
      
      // If connected, try to get review count
      let reviewCount = 0;
      if (connected) {
        const { data: reviews } = await supabase
          .from('reviews')
          .select('id', { count: 'exact' })
          .eq('user_id', userId)
          .eq('platform', platform);
        
        reviewCount = reviews?.length || 0;
      }
      
      platformStatuses.push({
        platform,
        connected,
        reviewCount: connected ? reviewCount : undefined
      });
    } catch (error) {
      console.error(`Error checking ${platform} connection:`, error);
      platformStatuses.push({
        platform,
        connected: false
      });
    }
  }

  return new Response(
    JSON.stringify({ platforms: platformStatuses }),
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