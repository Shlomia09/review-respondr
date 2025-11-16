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
    console.log('=== OAuth Callback Started ===');
    
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const error = url.searchParams.get('error');

    console.log('URL Parameters:', { code: !!code, state, error });

    if (error) {
      console.error('❌ OAuth Error from provider:', error);
      return new Response(`
        <html>
          <head>
            <title>OAuth Error</title>
            <style>
              body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f8f9fa; }
              .error { color: #dc3545; font-size: 24px; margin-bottom: 16px; }
            </style>
          </head>
          <body>
            <div class="error">❌ שגיאה בהתחברות</div>
            <p>שגיאה: ${error}</p>
            <script>
              console.log('OAuth Error from URL:', '${error}');
              if (window.opener) {
                window.opener.postMessage({error: '${error}'}, '*');
              }
              setTimeout(() => window.close(), 3000);
            </script>
          </body>
        </html>
      `, {
        headers: { 
          'Content-Type': 'text/html',
          'Content-Security-Policy': "default-src 'self' 'unsafe-inline' 'unsafe-eval'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';",
          'X-Frame-Options': 'SAMEORIGIN'
        }
      });
    }

    if (!code || !state) {
      console.error('❌ Missing code or state:', { code: !!code, state });
      throw new Error('Missing authorization code or state');
    }

    // Parse state to get platform and user ID
    const [platform, userId] = state.split('_');
    console.log('🔍 Parsed state:', { platform, userId });

    if (!platform || !userId) {
      throw new Error('Invalid state parameter');
    }

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Exchange code for access token
    console.log('🔄 Exchanging code for token...');
    let tokenData;
    switch (platform) {
      case 'google':
        tokenData = await exchangeGoogleCode(code);
        break;
      case 'facebook':
        tokenData = await exchangeFacebookCode(code);
        break;
      default:
        throw new Error('Unsupported platform: ' + platform);
    }

    if (!tokenData) {
      throw new Error('Failed to exchange code for token');
    }

    console.log('✅ Token exchange successful');

    // Store tokens in database
    // Facebook tokens typically expire in 60 days if not specified
    const expiresInSeconds = tokenData.expires_in || 5184000; // 60 days default
    const expiresAt = new Date(Date.now() + (expiresInSeconds * 1000)).toISOString();
    
    console.log('💾 Storing tokens (encrypted) in database...', { 
      expiresInSeconds, 
      expiresAt,
      hasRefreshToken: !!tokenData.refresh_token 
    });
    
    // Encrypt tokens before storing
    const { data: encryptedAccess, error: encryptAccessError } = await supabaseClient
      .rpc('encrypt_token', { token_value: tokenData.access_token });
    
    if (encryptAccessError || !encryptedAccess) {
      console.error('❌ Access token encryption error:', encryptAccessError);
      throw new Error('Failed to encrypt access token');
    }
    
    let encryptedRefresh = null;
    if (tokenData.refresh_token) {
      const { data: encryptedRefreshData, error: encryptRefreshError } = await supabaseClient
        .rpc('encrypt_token', { token_value: tokenData.refresh_token });
      
      if (encryptRefreshError || !encryptedRefreshData) {
        console.warn('⚠️ Refresh token encryption failed:', encryptRefreshError);
      } else {
        encryptedRefresh = encryptedRefreshData;
      }
    }
    
    const { error: dbError } = await supabaseClient
      .from('platform_tokens')
      .upsert({
        user_id: userId,
        platform: platform,
        access_token: encryptedAccess,
        refresh_token: encryptedRefresh,
        expires_at: expiresAt,
      }, {
        onConflict: 'user_id,platform'
      });

    if (dbError) {
      console.error('❌ Database error:', dbError);
      throw new Error('Failed to store tokens: ' + dbError.message);
    }

    console.log('✅ Tokens encrypted and stored successfully');

    // Return success page that closes the popup
    return new Response(`
      <html>
        <head>
          <title>All Set</title>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            html, body { height: 100%; margin: 0; }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              display: flex; align-items: center; justify-content: center;
              background: #0b1220; color: #fff; text-align: center;
            }
            .wrap { display: flex; flex-direction: column; align-items: center; gap: 12px; }
            .logo { width: 56px; height: 56px; border-radius: 12px; background: radial-gradient(120% 120% at 20% 10%, #22d3ee 0%, #6366f1 40%, #22c55e 100%); box-shadow: 0 10px 30px rgba(99,102,241,.35); position: relative; }
            .logo:after { content: ""; position: absolute; inset: 0; border-radius: 12px; background: linear-gradient(180deg, rgba(255,255,255,.18), rgba(255,255,255,0)); }
            h1 { margin: 0; font-size: 24px; letter-spacing: .08em; }
            p { margin: 0; opacity: .8; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="wrap">
            <div class="logo" aria-label="RevAI logo"></div>
            <h1>YOU ALL SET</h1>
            <p>Connection completed successfully</p>
          </div>
          <script>
            (function(){
              const msg = {
                type: 'oauth_success',
                success: true,
                platform: '${platform}',
                userId: '${userId}',
                timestamp: Date.now()
              };
              function send(){
                try { if (window.opener && !window.opener.closed) window.opener.postMessage(msg, '*'); } catch(e){}
                try { if (window.parent && window.parent !== window) window.parent.postMessage(msg, '*'); } catch(e){}
              }
              send();
              setTimeout(send, 150);
              setTimeout(send, 300);
              setTimeout(function(){
                try { if (window.opener) window.opener.focus(); } catch(e){}
                window.close();
              }, 900);
            })();
          </script>
        </body>
      </html>
    `, {
      headers: { 
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Security-Policy': "default-src 'self' 'unsafe-inline' 'unsafe-eval'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';",
        'X-Frame-Options': 'SAMEORIGIN',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });

  } catch (error) {
    console.error('❌ OAuth callback error:', error);
    
    // Return error page
    return new Response(`
      <html>
        <head>
          <title>Connection Failed</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              margin: 0;
              background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
              color: white;
              text-align: center;
            }
            .container {
              background: rgba(255, 255, 255, 0.1);
              backdrop-filter: blur(10px);
              padding: 2rem;
              border-radius: 15px;
              box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
            }
            .error { color: #ff4444; font-size: 3rem; margin-bottom: 1rem; }
            .title { font-size: 1.5rem; margin-bottom: 0.5rem; }
            .description { opacity: 0.8; margin-bottom: 2rem; }
            .error-details { font-size: 0.9rem; opacity: 0.7; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="error">✗</div>
            <div class="title">שגיאה בחיבור</div>
            <div class="description">אירעה שגיאה בתהליך החיבור</div>
            <div class="error-details">${error.message}</div>
          </div>
          <script>
            console.error('OAuth Error:', '${error.message}');
            if (window.opener) {
              window.opener.postMessage({
                error: '${error.message}'
              }, '*');
            }
            setTimeout(() => window.close(), 5000);
          </script>
        </body>
      </html>
    `, {
      status: 500,
      headers: { 
        'Content-Type': 'text/html',
        'Content-Security-Policy': "default-src 'self' 'unsafe-inline' 'unsafe-eval'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';",
        'X-Frame-Options': 'SAMEORIGIN'
      }
    });
  }
});

async function exchangeGoogleCode(code: string) {
  console.log('🔄 Exchanging Google code...');
  
  const clientId = Deno.env.get('GOOGLE_CLIENT_ID');
  const clientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET');
  const redirectUri = `${Deno.env.get('SUPABASE_URL')}/functions/v1/oauth-callback`;

  if (!clientId || !clientSecret) {
    throw new Error('Google OAuth credentials not configured');
  }

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code: code,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ Google token exchange failed:', errorText);
    throw new Error('Failed to exchange Google authorization code: ' + errorText);
  }

  const tokenData = await response.json();
  console.log('✅ Google token exchange successful');
  return tokenData;
}

async function exchangeFacebookCode(code: string) {
  console.log('🔄 Exchanging Facebook code...');
  
  const appId = Deno.env.get('FACEBOOK_APP_ID');
  const appSecret = Deno.env.get('FACEBOOK_APP_SECRET');
  const redirectUri = `${Deno.env.get('SUPABASE_URL')}/functions/v1/oauth-callback`;

  if (!appId || !appSecret) {
    throw new Error('Facebook OAuth credentials not configured');
  }

  const url = `https://graph.facebook.com/v18.0/oauth/access_token?` + 
    `client_id=${appId}&` +
    `client_secret=${appSecret}&` +
    `code=${code}&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ Facebook token exchange failed:', errorText);
    throw new Error('Failed to exchange Facebook authorization code: ' + errorText);
  }

  const tokenData = await response.json();
  console.log('✅ Facebook token exchange successful', { 
    hasAccessToken: !!tokenData.access_token,
    expiresIn: tokenData.expires_in,
    tokenType: tokenData.token_type 
  });
  return tokenData;
}