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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    // Get the authorization header from the request
    const authHeader = req.headers.get('Authorization');
    if (authHeader) {
      supabaseClient.auth.setSession({
        access_token: authHeader.replace('Bearer ', ''),
        refresh_token: '',
      });
    }

    const { action, platform, credentials } = await req.json();

    // Get current user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      throw new Error('Authentication required');
    }

    switch (action) {
      case 'connect':
        return await handleConnect(platform, credentials, user.id, supabaseClient);
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
  // For now, we'll just simulate successful connection
  console.log(`Successfully connected to ${platform}`);

  return new Response(
    JSON.stringify({ success: true, message: `Connected to ${platform}` }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function handleSync(platform: string, userId: string, supabase: any) {
  console.log(`Syncing reviews from ${platform} for user ${userId}`);
  
  // Fetch reviews from the platform
  let reviews: ReviewData[] = [];
  
  switch (platform) {
    case 'google':
      reviews = await fetchGoogleReviews(userId);
      break;
    case 'facebook':
      reviews = await fetchFacebookReviews(userId);
      break;
    case 'trustpilot':
      reviews = await fetchTrustpilotReviews(userId);
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
  
  // In a real implementation, you'd remove stored credentials
  // For now, we'll just simulate successful disconnection
  
  return new Response(
    JSON.stringify({ success: true, message: `Disconnected from ${platform}` }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// Platform-specific connection testers
async function testGoogleConnection(apiKey: string): Promise<boolean> {
  try {
    // Test Google Places API with a simple request
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
    // Test Facebook Graph API with a simple request
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
    // Test Trustpilot API with a simple request
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

// Platform-specific review fetchers (mock implementations)
async function fetchGoogleReviews(userId: string): Promise<ReviewData[]> {
  // Mock Google Reviews data
  return [
    {
      customer_name: "John Smith",
      customer_email: "john@example.com",
      platform: "google",
      rating: 5,
      content: "Excellent service! Highly recommended.",
      sentiment: "positive",
      review_date: new Date().toISOString(),
      user_id: userId,
    },
    {
      customer_name: "Sarah Johnson",
      platform: "google",
      rating: 4,
      content: "Good experience overall, will come back.",
      sentiment: "positive",
      review_date: new Date(Date.now() - 86400000).toISOString(), // Yesterday
      user_id: userId,
    }
  ];
}

async function fetchFacebookReviews(userId: string): Promise<ReviewData[]> {
  // Mock Facebook Reviews data
  return [
    {
      customer_name: "Mike Wilson",
      platform: "facebook",
      rating: 5,
      content: "Amazing customer service and quality products!",
      sentiment: "positive",
      review_date: new Date().toISOString(),
      user_id: userId,
    }
  ];
}

async function fetchTrustpilotReviews(userId: string): Promise<ReviewData[]> {
  // Mock Trustpilot Reviews data
  return [
    {
      customer_name: "Emma Davis",
      customer_email: "emma@example.com",
      platform: "trustpilot",
      rating: 4,
      content: "Fast delivery and good communication.",
      sentiment: "positive",
      review_date: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
      user_id: userId,
    }
  ];
}