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

    const { action, platform, credentials, businessId } = await req.json();

    switch (action) {
      case 'connect':
        return await handleConnect(platform, credentials, user.id, supabaseClient);
      case 'get_oauth_url':
        return await getOAuthUrl(platform, user.id);
      case 'check_connection':
        return await checkConnection(platform, user.id, supabaseClient);
      case 'get_businesses':
        return await getBusinesses(platform, user.id, supabaseClient);
      case 'select_business':
        return await selectBusiness(platform, businessId, user.id, supabaseClient);
      case 'sync':
        return await handleSync(platform, user.id, supabaseClient);
      case 'disconnect':
        return await handleDisconnect(platform, user.id, supabaseClient);
      default:
        throw new Error('Invalid action');
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
  const baseUrl = Deno.env.get('SUPABASE_URL');
  const redirectUrl = `${baseUrl}/functions/v1/oauth-callback`;
  
  let oauthUrl = '';
  
  switch (platform) {
    case 'google':
      const googleClientId = Deno.env.get('GOOGLE_CLIENT_ID');
      if (!googleClientId) {
        throw new Error('Google Client ID not configured');
      }
      
      // Updated scopes for Google My Business API
      const scopes = [
        'https://www.googleapis.com/auth/plus.business.manage',
        'https://www.googleapis.com/auth/business.manage'
      ].join(' ');
      
      oauthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${googleClientId}&` +
        `redirect_uri=${encodeURIComponent(redirectUrl)}&` +
        `response_type=code&` +
        `scope=${encodeURIComponent(scopes)}&` +
        `state=${platform}_${userId}&` +
        `access_type=offline&` +
        `prompt=consent`;
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
  try {
    const response = await fetch('https://mybusinessaccountmanagement.googleapis.com/v1/accounts', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('Google businesses API error:', await response.text());
      return [];
    }

    const data = await response.json();
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

    return businesses;
  } catch (error) {
    console.error('Error fetching Google businesses:', error);
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

// Platform-specific connection testers
async function testGoogleConnection(apiKey: string): Promise<boolean> {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=0,0&radius=1000&key=${apiKey}`
    );
    return response.ok;
  } catch (error) {
    console.error('Google connection test failed:', error);
    return false;
  }
}

async function testFacebookConnection(accessToken: string): Promise<boolean> {
  try {
    const response = await fetch(
      `https://graph.facebook.com/me?access_token=${accessToken}`
    );
    return response.ok;
  } catch (error) {
    console.error('Facebook connection test failed:', error);
    return false;
  }
}

async function testTrustpilotConnection(apiKey: string): Promise<boolean> {
  try {
    const response = await fetch(
      `https://api.trustpilot.com/v1/business-units?apikey=${apiKey}`,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`
        }
      }
    );
    return response.ok;
  } catch (error) {
    console.error('Trustpilot connection test failed:', error);
    return false;
  }
}

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