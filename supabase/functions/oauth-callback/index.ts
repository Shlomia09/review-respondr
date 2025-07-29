import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const error = url.searchParams.get('error');

    if (error) {
      return new Response(`
        <html>
          <body>
            <script>
              window.opener.postMessage({error: '${error}'}, '*');
              window.close();
            </script>
          </body>
        </html>
      `, {
        headers: { 'Content-Type': 'text/html' }
      });
    }

    if (!code || !state) {
      throw new Error('Missing authorization code or state');
    }

    // Parse state to get platform and user ID
    const [platform, userId] = state.split('_');

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Exchange code for access token
    let tokenData;
    switch (platform) {
      case 'google':
        tokenData = await exchangeGoogleCode(code);
        break;
      case 'facebook':
        tokenData = await exchangeFacebookCode(code);
        break;
      default:
        throw new Error('Unsupported platform');
    }

    if (!tokenData) {
      throw new Error('Failed to exchange code for token');
    }

    // Store tokens in database
    const expiresAt = new Date(Date.now() + (tokenData.expires_in * 1000)).toISOString();
    
    await supabaseClient
      .from('platform_tokens')
      .upsert({
        user_id: userId,
        platform: platform,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_at: expiresAt,
      }, {
        onConflict: 'user_id,platform'
      });

    // Return success page that closes the popup
    return new Response(`
      <html>
        <head>
          <title>Connection Successful</title>
        </head>
        <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f8f9fa;">
          <h2 style="color: #28a745;">Connection Successful!</h2>
          <p>This window will close automatically...</p>
          <script>
            console.log('Sending postMessage:', {success: true, platform: '${platform}'});
            if (window.opener && !window.opener.closed) {
              window.opener.postMessage({success: true, platform: '${platform}'}, '*');
            }
            setTimeout(() => {
              console.log('Attempting to close window');
              window.close();
            }, 1000);
          </script>
        </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' }
    });

  } catch (error) {
    console.error('OAuth callback error:', error);
    
    return new Response(`
      <html>
        <body>
          <h2>שגיאה בהתחברות</h2>
          <p>${error.message}</p>
          <script>
            window.opener.postMessage({error: '${error.message}'}, '*');
            setTimeout(() => window.close(), 3000);
          </script>
        </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' }
    });
  }
});

async function exchangeGoogleCode(code: string) {
  const clientId = Deno.env.get('GOOGLE_CLIENT_ID');
  const clientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET');
  const redirectUri = `${Deno.env.get('SUPABASE_URL')}/functions/v1/oauth-callback`;

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: clientId!,
      client_secret: clientSecret!,
      code: code,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to exchange Google authorization code');
  }

  return await response.json();
}

async function exchangeFacebookCode(code: string) {
  const appId = Deno.env.get('FACEBOOK_APP_ID');
  const appSecret = Deno.env.get('FACEBOOK_APP_SECRET');
  const redirectUri = `${Deno.env.get('SUPABASE_URL')}/functions/v1/oauth-callback`;

  const response = await fetch('https://graph.facebook.com/v18.0/oauth/access_token', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    body: new URLSearchParams({
      client_id: appId!,
      client_secret: appSecret!,
      code: code,
      redirect_uri: redirectUri,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to exchange Facebook authorization code');
  }

  return await response.json();
}